import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { initiateBattle, executeBattleAction } from '../../store/slices/battles/battleThunks';
import type { BattleAction } from '../../types/battle';
import type { Team } from '../../types/team';
import type { PokemonBattleStats, MoveDetails } from '../../types/pokemon';

/**
 * Hook for dispatching battle actions
 */
export const useBattleActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  const createBattle = useCallback(
    async (
      team1: Team,
      team2: Team,
      team1Pokemon: PokemonBattleStats[],
      team2Pokemon: PokemonBattleStats[],
      team1Moves: MoveDetails[][],
      team2Moves: MoveDetails[][],
      isRealTime: boolean = true
    ) => {
      return dispatch(
        initiateBattle({
          team1,
          team2,
          team1Pokemon,
          team2Pokemon,
          team1Moves,
          team2Moves,
          isRealTime,
        })
      ).unwrap();
    },
    [dispatch]
  );

  const performAction = useCallback(
    async (battleId: string, action: BattleAction) => {
      return dispatch(executeBattleAction({ battleId, action })).unwrap();
    },
    [dispatch]
  );

  const attack = useCallback(
    async (
      battleId: string,
      teamId: string,
      pokemonIndex: number,
      moveIndex: number
    ) => {
      const action: BattleAction = {
        id: `action-${Date.now()}`,
        teamId,
        pokemonIndex,
        type: 'ATTACK',
        moveIndex,
        timestamp: Date.now(),
        priority: 0,
      };
      return performAction(battleId, action);
    },
    [performAction]
  );

  const switchPokemon = useCallback(
    async (
      battleId: string,
      teamId: string,
      pokemonIndex: number,
      switchToPokemonIndex: number
    ) => {
      const action: BattleAction = {
        id: `action-${Date.now()}`,
        teamId,
        pokemonIndex,
        type: 'SWITCH',
        switchToPokemonIndex,
        timestamp: Date.now(),
        priority: 6, // Switch has high priority
      };
      return performAction(battleId, action);
    },
    [performAction]
  );

  return {
    createBattle,
    performAction,
    attack,
    switchPokemon,
  };
};

