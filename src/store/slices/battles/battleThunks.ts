import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../../index';
import type { Battle, BattleAction, BattlePokemon, BattleTeam, Move } from '../../../types/battle';
import type { Team } from '../../../types/team';
import type { PokemonBattleStats, MoveDetails } from '../../../types/pokemon';
import {
  calculateDamage,
  applyDamage,
  useMove,
  getNextAvailablePokemon,
  isBattleOver,
  getEffectivenessMessage,
} from './battleEngine';
import {
  determinePostKOPhase,
  validateAction,
} from './battleStateMachine';
import {
  createBattleOptimistic,
  updateBattlePhase,
  updatePokemonHP,
  updateMovePP,
  updateMoveCooldown,
  addLogEntry,
  endBattle,
  incrementTurn,
  updateActivePokemon,
} from './battlesSlice';
import {
  initializeHPBar,
  updateHPTarget,
  addDamageNumber,
  addAttackEffect,
  updateSpriteAnimation,
} from './animationSlice';
import {
  recordPokemonDamageDealt,
  recordPokemonDamageTaken,
  recordPokemonKnockout,
  recordPokemonKnockedOut,
  recordBattleResults,
} from '../statistics/statisticsSlice';

/**
 * Initialize a battle from two teams
 */
export const initiateBattle = createAsyncThunk<
  Battle,
  {
    team1: Team;
    team2: Team;
    team1Pokemon: PokemonBattleStats[];
    team2Pokemon: PokemonBattleStats[];
    team1Moves: MoveDetails[][];
    team2Moves: MoveDetails[][];
    isRealTime: boolean;
  },
  { state: RootState; dispatch: AppDispatch }
>(
  'battles/initiateBattle',
  async ({ team1, team2, team1Pokemon, team2Pokemon, team1Moves, team2Moves, isRealTime }, { dispatch }) => {
    // Convert Pokemon to BattlePokemon format
    const convertToBattlePokemon = (
      stats: PokemonBattleStats,
      moves: MoveDetails[]
    ): BattlePokemon => {
      // Select first 4 moves
      const selectedMoves: Move[] = moves.slice(0, 4).map((move) => ({
        name: move.name,
        power: move.power || 0,
        accuracy: move.accuracy || 100,
        pp: move.pp,
        currentPp: move.pp,
        type: move.type.name,
        damageClass: move.damage_class.name,
        priority: move.priority,
        cooldown: 0,
        currentCooldown: 0,
      }));

      // Default moves if not enough available
      while (selectedMoves.length < 4) {
        selectedMoves.push({
          name: 'tackle',
          power: 40,
          accuracy: 100,
          pp: 35,
          currentPp: 35,
          type: 'normal',
          damageClass: 'physical',
          priority: 0,
          cooldown: 2,
          currentCooldown: 0,
        });
      }

      return {
        pokemon: {
          id: stats.id,
          name: stats.name,
          url: `https://pokeapi.co/api/v2/pokemon/${stats.id}`,
          image: stats.sprites.other['official-artwork'].front_default,
        },
        currentHp: stats.baseStats.hp,
        maxHp: stats.baseStats.hp,
        stats: {
          attack: stats.baseStats.attack,
          defense: stats.baseStats.defense,
          specialAttack: stats.baseStats.specialAttack,
          specialDefense: stats.baseStats.specialDefense,
          speed: stats.baseStats.speed,
        },
        abilities: stats.abilities.map((a) => ({
          name: a.ability.name,
          url: a.ability.url,
          effect: '',
        })),
        moves: selectedMoves,
        types: stats.types,
        status: null,
        isKnockedOut: false,
      };
    };

    const battleTeam1: BattleTeam = {
      teamId: team1.id,
      teamName: team1.name,
      pokemons: team1Pokemon.map((p, i) => convertToBattlePokemon(p, team1Moves[i] || [])),
      activePokemonIndex: 0,
    };

    const battleTeam2: BattleTeam = {
      teamId: team2.id,
      teamName: team2.name,
      pokemons: team2Pokemon.map((p, i) => convertToBattlePokemon(p, team2Moves[i] || [])),
      activePokemonIndex: 0,
    };

    const battle: Battle = {
      id: `battle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      team1: battleTeam1,
      team2: battleTeam2,
      phase: 'SETUP',
      currentTurn: 1,
      battleLog: [],
      winnerId: null,
      startTime: Date.now(),
      endTime: null,
      isRealTime,
    };

    // Optimistically create battle
    dispatch(createBattleOptimistic(battle));

    // Initialize HP bars for all Pokemon
    [...battleTeam1.pokemons, ...battleTeam2.pokemons].forEach((pokemon) => {
      dispatch(
        initializeHPBar({
          pokemonId: pokemon.pokemon.id,
          maxHp: pokemon.maxHp,
          currentHp: pokemon.currentHp,
        })
      );
    });

    // Add initial log entry
    dispatch(
      addLogEntry({
        battleId: battle.id,
        entry: {
          id: `log-${Date.now()}-1`,
          timestamp: Date.now(),
          turn: 1,
          type: 'info',
          message: `Battle started between ${team1.name} and ${team2.name}!`,
        },
      })
    );

    // Progress battle through initial phases to ACTION_SELECT
    // SETUP -> READY -> POKEMON_ENTRY -> ACTION_SELECT
    setTimeout(() => {
      dispatch(updateBattlePhase({ battleId: battle.id, phase: 'READY' }));
    }, 100);

    setTimeout(() => {
      dispatch(updateBattlePhase({ battleId: battle.id, phase: 'POKEMON_ENTRY' }));
      dispatch(
        addLogEntry({
          battleId: battle.id,
          entry: {
            id: `log-${Date.now()}-entry1`,
            timestamp: Date.now(),
            turn: 1,
            type: 'info',
            message: `${team1.name} sent out ${battleTeam1.pokemons[0].pokemon.name}!`,
          },
        })
      );
      dispatch(
        addLogEntry({
          battleId: battle.id,
          entry: {
            id: `log-${Date.now()}-entry2`,
            timestamp: Date.now(),
            turn: 1,
            type: 'info',
            message: `${team2.name} sent out ${battleTeam2.pokemons[0].pokemon.name}!`,
          },
        })
      );
    }, 600);

    setTimeout(() => {
      dispatch(updateBattlePhase({ battleId: battle.id, phase: 'ACTION_SELECT' }));
      dispatch(
        addLogEntry({
          battleId: battle.id,
          entry: {
            id: `log-${Date.now()}-ready`,
            timestamp: Date.now(),
            turn: 1,
            type: 'info',
            message: 'Battle begin! Select your move!',
          },
        })
      );
    }, 1500);

    return battle;
  }
);

/**
 * Execute a battle action (attack, switch, etc.)
 */
export const executeBattleAction = createAsyncThunk<
  void,
  {
    battleId: string;
    action: BattleAction;
  },
  { state: RootState; dispatch: AppDispatch }
>(
  'battles/executeBattleAction',
  async ({ battleId, action }, { dispatch, getState }) => {
    const state = getState();
    const battle = state.battles.entities[battleId];

    if (!battle) {
      throw new Error('Battle not found');
    }

    // Validate action
    const validation = validateAction(battle, action);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Transition to executing phase
    dispatch(updateBattlePhase({ battleId, phase: 'EXECUTING_ACTION' }));

    // Handle different action types
    switch (action.type) {
      case 'ATTACK':
        await dispatch(executeAttack({ battleId, action })).unwrap();
        break;
      case 'SWITCH':
        await dispatch(executeSwitchPokemon({ battleId, action })).unwrap();
        break;
      default:
        throw new Error('Action type not implemented');
    }

    // Increment turn only if battle continues
    const currentState = getState();
    const currentBattle = currentState.battles.entities[battleId];
    if (currentBattle && currentBattle.phase !== 'BATTLE_END') {
      dispatch(incrementTurn(battleId));
    }

    // If action was from Team 1, trigger opponent turn
    if (action.teamId === currentState.battles.entities[battleId]?.team1.teamId) {
      // Import dynamically to avoid circular dependency
      const { executeOpponentTurn } = await import('./opponentThunks');
      // Wait a bit before opponent acts
      setTimeout(() => {
        dispatch(executeOpponentTurn({ battleId }));
      }, 500);
    }
  }
);

/**
 * Execute an attack action
 */
const executeAttack = createAsyncThunk<
  void,
  {
    battleId: string;
    action: BattleAction;
  },
  { state: RootState; dispatch: AppDispatch }
>(
  'battles/executeAttack',
  async ({ battleId, action }, { dispatch, getState }) => {
    const state = getState();
    const battle = state.battles.entities[battleId];

    if (!battle || action.moveIndex === undefined) {
      throw new Error('Invalid attack action');
    }

    const attackerTeam = action.teamId === battle.team1.teamId ? battle.team1 : battle.team2;
    const defenderTeam = action.teamId === battle.team1.teamId ? battle.team2 : battle.team1;
    const attackerSide: 'team1' | 'team2' = action.teamId === battle.team1.teamId ? 'team1' : 'team2';
    const defenderSide: 'team1' | 'team2' = attackerSide === 'team1' ? 'team2' : 'team1';

    // Use active pokemon index from action (for opponent) or team's active index
    const attackerIndex = action.pokemonIndex;
    const attacker = attackerTeam.pokemons[attackerIndex];
    const defender = defenderTeam.pokemons[defenderTeam.activePokemonIndex];
    const move = attacker.moves[action.moveIndex];

    // Transition to animation phase
    dispatch(updateBattlePhase({ battleId, phase: 'ANIMATION' }));

    // Trigger attack animation
    dispatch(
      updateSpriteAnimation({
        pokemonId: attacker.pokemon.id,
        animation: 'ATTACK',
      })
    );

    // Calculate damage
    const damageCalc = calculateDamage(attacker, defender, move);

    // Add attack effect animation
    dispatch(
      addAttackEffect({
        id: `effect-${Date.now()}`,
        effectType: move.damageClass,
        sourcePosition: { x: 200, y: 300 },
        targetPosition: { x: 600, y: 200 },
        color: move.damageClass === 'physical' ? '#ff4444' : '#4444ff',
        particles: [],
        duration: 600,
        startTime: Date.now(),
      })
    );

    // Wait for animation
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Transition to damage calculation phase
    dispatch(updateBattlePhase({ battleId, phase: 'DAMAGE_CALC' }));

    // Apply damage
    const updatedDefender = applyDamage(defender, damageCalc.damage);

    console.log('Damage applied:', {
      attacker: attacker.pokemon.name,
      defender: defender.pokemon.name,
      damage: damageCalc.damage,
      oldHP: defender.currentHp,
      newHP: updatedDefender.currentHp,
      isKO: updatedDefender.isKnockedOut,
    });

    // Update Pokemon HP
    dispatch(
      updatePokemonHP({
        battleId,
        teamSide: defenderSide,
        pokemonIndex: defenderTeam.activePokemonIndex,
        newHp: updatedDefender.currentHp,
        isKnockedOut: updatedDefender.isKnockedOut,
      })
    );

    // Animate HP bar
    dispatch(
      updateHPTarget({
        pokemonId: defender.pokemon.id,
        targetHp: updatedDefender.currentHp,
      })
    );

    // Show damage number
    dispatch(
      addDamageNumber({
        id: `dmg-${Date.now()}`,
        value: damageCalc.damage,
        position: { x: 600, y: 200 },
        velocity: { x: 0, y: -2 },
        opacity: 1,
        scale: 1,
        color: damageCalc.isCritical ? '#ff0000' : '#ffffff',
        isCritical: damageCalc.isCritical,
        startTime: Date.now(),
        duration: 1000,
      })
    );

    // Update move PP and cooldown
    const updatedMove = useMove(move);
    dispatch(
      updateMovePP({
        battleId,
        teamSide: attackerSide,
        pokemonIndex: action.pokemonIndex,
        moveIndex: action.moveIndex,
        pp: updatedMove.currentPp,
      })
    );

    if (battle.isRealTime) {
      dispatch(
        updateMoveCooldown({
          battleId,
          teamSide: attackerSide,
          pokemonIndex: action.pokemonIndex,
          moveIndex: action.moveIndex,
          cooldown: updatedMove.cooldown,
        })
      );
    }

    // Record statistics
    dispatch(
      recordPokemonDamageDealt({
        pokemonId: attacker.pokemon.id,
        damage: damageCalc.damage,
        moveName: move.name,
      })
    );

    dispatch(
      recordPokemonDamageTaken({
        pokemonId: defender.pokemon.id,
        damage: damageCalc.damage,
      })
    );

    if (updatedDefender.isKnockedOut) {
      dispatch(recordPokemonKnockout(attacker.pokemon.id));
      dispatch(recordPokemonKnockedOut(defender.pokemon.id));
    }

    // Add log entries
    const effectiveness = getEffectivenessMessage(damageCalc.effectiveness);
    dispatch(
      addLogEntry({
        battleId,
        entry: {
          id: `log-${Date.now()}-attack`,
          timestamp: Date.now(),
          turn: battle.currentTurn,
          type: 'action',
          message: `${attacker.pokemon.name} used ${move.name}!`,
          data: {
            attackerName: attacker.pokemon.name,
            defenderName: defender.pokemon.name,
            moveName: move.name,
          },
        },
      })
    );

    dispatch(
      addLogEntry({
        battleId,
        entry: {
          id: `log-${Date.now()}-damage`,
          timestamp: Date.now(),
          turn: battle.currentTurn,
          type: 'damage',
          message: `${defender.pokemon.name} took ${damageCalc.damage} damage! ${effectiveness}${
            damageCalc.isCritical ? ' Critical hit!' : ''
          }`,
          data: {
            damage: damageCalc.damage,
            isCritical: damageCalc.isCritical,
            effectiveness: damageCalc.effectiveness,
          },
        },
      })
    );

    if (updatedDefender.isKnockedOut) {
      dispatch(
        addLogEntry({
          battleId,
          entry: {
            id: `log-${Date.now()}-ko`,
            timestamp: Date.now(),
            turn: battle.currentTurn,
            type: 'ko',
            message: `${defender.pokemon.name} fainted!`,
          },
        })
      );

      // Auto-switch to next Pokemon if available
      const nextIndex = getNextAvailablePokemon(defenderTeam.pokemons);
      if (nextIndex !== defenderTeam.activePokemonIndex) {
        dispatch(
          updateActivePokemon({
            battleId,
            teamSide: defenderSide,
            newIndex: nextIndex,
          })
        );
      }
    }

    // Transition to check KO phase
    dispatch(updateBattlePhase({ battleId, phase: 'CHECK_KO' }));

    // After a short delay, check battle state and transition
    await new Promise((resolve) => setTimeout(resolve, 500));

    const finalState = getState();
    const finalBattle = finalState.battles.entities[battleId];

    if (finalBattle) {
      // Check if battle is over
      const winner = isBattleOver(
        finalBattle.team1.pokemons,
        finalBattle.team2.pokemons
      );

      if (winner) {
        const winnerId = winner === 'team1' ? finalBattle.team1.teamId : finalBattle.team2.teamId;

        // Add final log entry
        dispatch(
          addLogEntry({
            battleId,
            entry: {
              id: `log-${Date.now()}-battleend`,
              timestamp: Date.now(),
              turn: finalBattle.currentTurn,
              type: 'info',
              message: `${winner === 'team1' ? finalBattle.team1.teamName : finalBattle.team2.teamName} wins the battle!`,
            },
          })
        );

        // End the battle
        dispatch(endBattle({ battleId, winnerId }));

        // Record statistics
        dispatch(
          recordBattleResults({
            battleId,
            winnerId,
            loserId: winner === 'team1' ? finalBattle.team2.teamId : finalBattle.team1.teamId,
            duration: Date.now() - finalBattle.startTime,
            turns: finalBattle.currentTurn,
            team1Stats: {
              teamId: finalBattle.team1.teamId,
              damageDealt: 0,
              damageTaken: 0,
              knockouts: finalBattle.team2.pokemons.filter((p) => p.isKnockedOut).length,
              pokemonIds: finalBattle.team1.pokemons.map((p) => p.pokemon.id),
            },
            team2Stats: {
              teamId: finalBattle.team2.teamId,
              damageDealt: 0,
              damageTaken: 0,
              knockouts: finalBattle.team1.pokemons.filter((p) => p.isKnockedOut).length,
              pokemonIds: finalBattle.team2.pokemons.map((p) => p.pokemon.id),
            },
          })
        );
      } else {
        // Battle continues
        const nextPhase = determinePostKOPhase(finalBattle);
        dispatch(updateBattlePhase({ battleId, phase: nextPhase }));

        // If we need to switch Pokemon (active one is KO'd), add log entry
        if (nextPhase === 'POKEMON_ENTRY') {
          const team1Active = finalBattle.team1.pokemons[finalBattle.team1.activePokemonIndex];
          const team2Active = finalBattle.team2.pokemons[finalBattle.team2.activePokemonIndex];

          if (team1Active.isKnockedOut) {
            const nextIndex = getNextAvailablePokemon(finalBattle.team1.pokemons);
            if (nextIndex !== finalBattle.team1.activePokemonIndex) {
              dispatch(
                updateActivePokemon({
                  battleId,
                  teamSide: 'team1',
                  newIndex: nextIndex,
                })
              );

              dispatch(
                addLogEntry({
                  battleId,
                  entry: {
                    id: `log-${Date.now()}-switch1`,
                    timestamp: Date.now(),
                    turn: finalBattle.currentTurn,
                    type: 'switch',
                    message: `Go, ${finalBattle.team1.pokemons[nextIndex].pokemon.name}!`,
                  },
                })
              );
            }
          }

          if (team2Active.isKnockedOut) {
            const nextIndex = getNextAvailablePokemon(finalBattle.team2.pokemons);
            if (nextIndex !== finalBattle.team2.activePokemonIndex) {
              dispatch(
                updateActivePokemon({
                  battleId,
                  teamSide: 'team2',
                  newIndex: nextIndex,
                })
              );

              dispatch(
                addLogEntry({
                  battleId,
                  entry: {
                    id: `log-${Date.now()}-switch2`,
                    timestamp: Date.now(),
                    turn: finalBattle.currentTurn,
                    type: 'switch',
                    message: `Opponent sent out ${finalBattle.team2.pokemons[nextIndex].pokemon.name}!`,
                  },
                })
              );
            }
          }

          // After Pokemon entry, go back to action select
          setTimeout(() => {
            dispatch(updateBattlePhase({ battleId, phase: 'ACTION_SELECT' }));

            // If Team 2's Pokemon was knocked out and switched, let Team 1 continue
            // If Team 1's Pokemon was knocked out, opponent should attack after switch
            const updatedState = getState();
            const updatedBattle = updatedState.battles.entities[battleId];
            if (updatedBattle && team1Active.isKnockedOut && !team2Active.isKnockedOut) {
              // Team 1 switched, opponent's turn
              setTimeout(async () => {
                const { executeOpponentTurn } = await import('./opponentThunks');
                dispatch(executeOpponentTurn({ battleId }));
              }, 1000);
            }
          }, 1000);
        }
      }
    }
  }
);

/**
 * Execute a switch Pokemon action
 */
const executeSwitchPokemon = createAsyncThunk<
  void,
  {
    battleId: string;
    action: BattleAction;
  },
  { state: RootState; dispatch: AppDispatch }
>(
  'battles/executeSwitchPokemon',
  async ({ battleId, action }, { dispatch, getState }) => {
    const state = getState();
    const battle = state.battles.entities[battleId];

    if (!battle || action.switchToPokemonIndex === undefined) {
      throw new Error('Invalid switch action');
    }

    const teamSide: 'team1' | 'team2' = action.teamId === battle.team1.teamId ? 'team1' : 'team2';
    const team = battle[teamSide];
    const oldPokemon = team.pokemons[team.activePokemonIndex];
    const newPokemon = team.pokemons[action.switchToPokemonIndex];

    // Update active Pokemon
    dispatch(
      updateActivePokemon({
        battleId,
        teamSide,
        newIndex: action.switchToPokemonIndex,
      })
    );

    // Add log entry
    dispatch(
      addLogEntry({
        battleId,
        entry: {
          id: `log-${Date.now()}-switch`,
          timestamp: Date.now(),
          turn: battle.currentTurn,
          type: 'switch',
          message: `${oldPokemon.pokemon.name} was recalled! Go, ${newPokemon.pokemon.name}!`,
        },
      })
    );

    // Transition back to action select
    dispatch(updateBattlePhase({ battleId, phase: 'ACTION_SELECT' }));
  }
);

export { executeAttack, executeSwitchPokemon };

