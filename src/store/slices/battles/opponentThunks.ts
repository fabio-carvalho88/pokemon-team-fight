import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../../index';
import type { BattleAction } from '../../../types/battle';
import { executeBattleAction } from './battleThunks';
import { selectOpponentMove, shouldOpponentSwitch, selectOpponentSwitchTarget } from './opponentAI';

/**
 * Execute opponent's turn automatically
 */
export const executeOpponentTurn = createAsyncThunk<
  void,
  { battleId: string },
  { state: RootState; dispatch: AppDispatch }
>(
  'battles/executeOpponentTurn',
  async ({ battleId }, { dispatch, getState }) => {
    // Wait a moment before opponent acts (for better UX)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const state = getState();
    const battle = state.battles.entities[battleId];

    if (!battle) {
      console.error('Battle not found for opponent turn');
      return;
    }

    // Get Team 2 (opponent) data
    const team2 = battle.team2;
    const activePokemon = team2.pokemons[team2.activePokemonIndex];

    if (activePokemon.isKnockedOut) {
      console.log('Opponent Pokemon is knocked out, skipping turn');
      return;
    }

    // Decide action: switch or attack
    const shouldSwitch = shouldOpponentSwitch(activePokemon, team2.pokemons);

    if (shouldSwitch) {
      const targetIndex = selectOpponentSwitchTarget(team2.activePokemonIndex, team2.pokemons);

      if (targetIndex !== team2.activePokemonIndex) {
        const switchAction: BattleAction = {
          id: `action-opponent-${Date.now()}`,
          teamId: team2.teamId,
          pokemonIndex: team2.activePokemonIndex,
          type: 'SWITCH',
          switchToPokemonIndex: targetIndex,
          timestamp: Date.now(),
          priority: 6,
        };

        console.log('Opponent switching Pokemon:', {
          from: activePokemon.pokemon.name,
          to: team2.pokemons[targetIndex].pokemon.name,
        });

        await dispatch(executeBattleAction({ battleId, action: switchAction })).unwrap();
        return;
      }
    }

    // Otherwise, attack
    const moveIndex = selectOpponentMove(activePokemon);
    const selectedMove = activePokemon.moves[moveIndex];

    console.log('Opponent attacking with:', {
      pokemon: activePokemon.pokemon.name,
      move: selectedMove.name,
      power: selectedMove.power,
    });

    const attackAction: BattleAction = {
      id: `action-opponent-${Date.now()}`,
      teamId: team2.teamId,
      pokemonIndex: team2.activePokemonIndex,
      type: 'ATTACK',
      moveIndex,
      timestamp: Date.now(),
      priority: selectedMove.priority,
    };

    try {
      await dispatch(executeBattleAction({ battleId, action: attackAction })).unwrap();
    } catch (error) {
      console.error('Opponent attack failed:', error);
    }
  }
);

