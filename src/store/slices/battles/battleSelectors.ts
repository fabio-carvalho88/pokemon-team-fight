import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../index';
import { battlesSelectors } from './battlesSlice';

// Base selectors
export const selectBattlesState = (state: RootState) => state.battles;
export const selectActiveBattleId = (state: RootState) => state.battles.activeBattleId;
export const selectPendingActions = (state: RootState) => state.battles.pendingActions;
export const selectBattleError = (state: RootState) => state.battles.error;

// Entity selectors from adapter
export const {
  selectAll: selectAllBattles,
  selectById: selectBattleById,
  selectIds: selectBattleIds,
  selectEntities: selectBattleEntities,
  selectTotal: selectTotalBattles,
} = battlesSelectors;

// Memoized selectors
export const selectActiveBattle = createSelector(
  [selectBattlesState, selectActiveBattleId],
  (battlesState, activeBattleId) => {
    if (!activeBattleId) return null;
    return battlesState.entities[activeBattleId] || null;
  }
);

export const selectActiveBattleTeams = createSelector([selectActiveBattle], (battle) => {
  if (!battle) return null;
  return {
    team1: battle.team1,
    team2: battle.team2,
  };
});

export const selectActiveBattlePhase = createSelector([selectActiveBattle], (battle) => {
  return battle?.phase || null;
});

export const selectActiveBattleLog = createSelector([selectActiveBattle], (battle) => {
  return battle?.battleLog || [];
});

export const selectActiveBattleIsRealTime = createSelector([selectActiveBattle], (battle) => {
  return battle?.isRealTime || false;
});

// Select active Pokemon for each team
export const selectActivePokemon = createSelector([selectActiveBattle], (battle) => {
  if (!battle) return null;
  return {
    team1: battle.team1.pokemons[battle.team1.activePokemonIndex],
    team2: battle.team2.pokemons[battle.team2.activePokemonIndex],
  };
});

// Select all alive Pokemon for a team
export const selectAlivePokemon = createSelector([selectActiveBattle], (battle) => {
  if (!battle) return null;
  return {
    team1: battle.team1.pokemons.filter((p) => !p.isKnockedOut),
    team2: battle.team2.pokemons.filter((p) => !p.isKnockedOut),
  };
});

// Select battle status summary
export const selectBattleStatus = createSelector([selectActiveBattle], (battle) => {
  if (!battle) return null;

  const team1Alive = battle.team1.pokemons.filter((p) => !p.isKnockedOut).length;
  const team2Alive = battle.team2.pokemons.filter((p) => !p.isKnockedOut).length;

  return {
    phase: battle.phase,
    turn: battle.currentTurn,
    team1AliveCount: team1Alive,
    team2AliveCount: team2Alive,
    isFinished: battle.phase === 'BATTLE_END',
    winnerId: battle.winnerId,
  };
});

// Select finished battles
export const selectFinishedBattles = createSelector([selectAllBattles], (battles) => {
  return battles.filter((b) => b.phase === 'BATTLE_END');
});

// Select active battles
export const selectActiveBattles = createSelector([selectAllBattles], (battles) => {
  return battles.filter((b) => b.phase !== 'BATTLE_END');
});

// Select battles by team ID
export const selectBattlesByTeamId = createSelector(
  [selectAllBattles, (_state: RootState, teamId: string) => teamId],
  (battles, teamId) => {
    return battles.filter(
      (b) => b.team1.teamId === teamId || b.team2.teamId === teamId
    );
  }
);

// Select battle history (last N battles)
export const selectBattleHistory = createSelector(
  [selectFinishedBattles, (_state: RootState, limit: number = 10) => limit],
  (finishedBattles, limit) => {
    return finishedBattles.slice(0, limit);
  }
);

// Select battle results (winner/loser info)
export const selectBattleResults = createSelector(
  [selectBattleById, (_state: RootState, _battleId: string) => _battleId],
  (battle) => {
    if (!battle || battle.phase !== 'BATTLE_END') return null;

    return {
      battleId: battle.id,
      winnerId: battle.winnerId,
      winnerName: battle.winnerId === battle.team1.teamId ? battle.team1.teamName : battle.team2.teamName,
      loserId: battle.winnerId === battle.team1.teamId ? battle.team2.teamId : battle.team1.teamId,
      loserName: battle.winnerId === battle.team1.teamId ? battle.team2.teamName : battle.team1.teamName,
      duration: battle.endTime ? battle.endTime - battle.startTime : 0,
      turns: battle.currentTurn,
    };
  }
);

// Select if player can perform actions
export const selectCanPerformActions = createSelector([selectActiveBattle], (battle) => {
  if (!battle) return false;
  return battle.phase === 'ACTION_SELECT';
});

// Select available moves for active Pokemon
export const selectAvailableMoves = createSelector(
  [selectActivePokemon, selectActiveBattleIsRealTime],
  (activePokemon, isRealTime) => {
    if (!activePokemon) return null;

    return {
      team1: activePokemon.team1.moves.filter((move) => {
        if (move.currentPp <= 0) return false;
        if (isRealTime && move.currentCooldown > 0) return false;
        return true;
      }),
      team2: activePokemon.team2.moves.filter((move) => {
        if (move.currentPp <= 0) return false;
        if (isRealTime && move.currentCooldown > 0) return false;
        return true;
      }),
    };
  }
);

// Select pending actions for a team
export const selectPendingTeamActions = createSelector(
  [selectPendingActions, (_state: RootState, teamId: string) => teamId],
  (actions, teamId) => {
    return actions.filter((a) => a.teamId === teamId);
  }
);

// Select battle progress percentage
export const selectBattleProgress = createSelector([selectActiveBattle], (battle) => {
  if (!battle) return 0;

  const team1Total = battle.team1.pokemons.length;
  const team2Total = battle.team2.pokemons.length;
  const team1Alive = battle.team1.pokemons.filter((p) => !p.isKnockedOut).length;
  const team2Alive = battle.team2.pokemons.filter((p) => !p.isKnockedOut).length;

  const team1Loss = (team1Total - team1Alive) / team1Total;
  const team2Loss = (team2Total - team2Alive) / team2Total;

  return Math.max(team1Loss, team2Loss) * 100;
});

