import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  BattleStatistics,
  TeamStatistics,
  PokemonStatistics,
} from '../../../types/battle';

interface StatisticsState {
  battleStats: Record<string, BattleStatistics>;
  teamStats: Record<string, TeamStatistics>;
  pokemonStats: Record<number, PokemonStatistics>;
}

const initialState: StatisticsState = {
  battleStats: {},
  teamStats: {},
  pokemonStats: {},
};

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    // Battle statistics
    recordBattleStats: (state, action: PayloadAction<BattleStatistics>) => {
      const stats = action.payload;
      state.battleStats[stats.battleId] = stats;
    },

    // Team statistics
    initializeTeamStats: (state, action: PayloadAction<string>) => {
      const teamId = action.payload;
      if (!state.teamStats[teamId]) {
        state.teamStats[teamId] = {
          teamId,
          totalBattles: 0,
          wins: 0,
          losses: 0,
          totalDamageDealt: 0,
          totalDamageTaken: 0,
          averageBattleDuration: 0,
          knockouts: 0,
        };
      }
    },

    recordTeamWin: (
      state,
      action: PayloadAction<{
        teamId: string;
        damageDealt: number;
        damageTaken: number;
        battleDuration: number;
        knockouts: number;
      }>
    ) => {
      const { teamId, damageDealt, damageTaken, battleDuration, knockouts } = action.payload;

      if (!state.teamStats[teamId]) {
        statisticsSlice.caseReducers.initializeTeamStats(state, { payload: teamId, type: '' });
      }

      const stats = state.teamStats[teamId];
      stats.totalBattles++;
      stats.wins++;
      stats.totalDamageDealt += damageDealt;
      stats.totalDamageTaken += damageTaken;
      stats.knockouts += knockouts;

      // Update average duration
      const totalDuration = stats.averageBattleDuration * (stats.totalBattles - 1) + battleDuration;
      stats.averageBattleDuration = totalDuration / stats.totalBattles;
    },

    recordTeamLoss: (
      state,
      action: PayloadAction<{
        teamId: string;
        damageDealt: number;
        damageTaken: number;
        battleDuration: number;
        knockouts: number;
      }>
    ) => {
      const { teamId, damageDealt, damageTaken, battleDuration, knockouts } = action.payload;

      if (!state.teamStats[teamId]) {
        statisticsSlice.caseReducers.initializeTeamStats(state, { payload: teamId, type: '' });
      }

      const stats = state.teamStats[teamId];
      stats.totalBattles++;
      stats.losses++;
      stats.totalDamageDealt += damageDealt;
      stats.totalDamageTaken += damageTaken;
      stats.knockouts += knockouts;

      // Update average duration
      const totalDuration = stats.averageBattleDuration * (stats.totalBattles - 1) + battleDuration;
      stats.averageBattleDuration = totalDuration / stats.totalBattles;
    },

    // Pokemon statistics
    initializePokemonStats: (state, action: PayloadAction<number>) => {
      const pokemonId = action.payload;
      if (!state.pokemonStats[pokemonId]) {
        state.pokemonStats[pokemonId] = {
          pokemonId,
          battlesParticipated: 0,
          wins: 0,
          losses: 0,
          totalDamageDealt: 0,
          totalDamageTaken: 0,
          knockouts: 0,
          timesKnockedOut: 0,
          movesUsed: {},
        };
      }
    },

    recordPokemonDamageDealt: (
      state,
      action: PayloadAction<{
        pokemonId: number;
        damage: number;
        moveName: string;
      }>
    ) => {
      const { pokemonId, damage, moveName } = action.payload;

      if (!state.pokemonStats[pokemonId]) {
        statisticsSlice.caseReducers.initializePokemonStats(state, { payload: pokemonId, type: '' });
      }

      const stats = state.pokemonStats[pokemonId];
      stats.totalDamageDealt += damage;

      // Track move usage
      stats.movesUsed[moveName] = (stats.movesUsed[moveName] || 0) + 1;
    },

    recordPokemonDamageTaken: (
      state,
      action: PayloadAction<{
        pokemonId: number;
        damage: number;
      }>
    ) => {
      const { pokemonId, damage } = action.payload;

      if (!state.pokemonStats[pokemonId]) {
        statisticsSlice.caseReducers.initializePokemonStats(state, { payload: pokemonId, type: '' });
      }

      state.pokemonStats[pokemonId].totalDamageTaken += damage;
    },

    recordPokemonKnockout: (state, action: PayloadAction<number>) => {
      const pokemonId = action.payload;

      if (!state.pokemonStats[pokemonId]) {
        statisticsSlice.caseReducers.initializePokemonStats(state, { payload: pokemonId, type: '' });
      }

      state.pokemonStats[pokemonId].knockouts++;
    },

    recordPokemonKnockedOut: (state, action: PayloadAction<number>) => {
      const pokemonId = action.payload;

      if (!state.pokemonStats[pokemonId]) {
        statisticsSlice.caseReducers.initializePokemonStats(state, { payload: pokemonId, type: '' });
      }

      state.pokemonStats[pokemonId].timesKnockedOut++;
    },

    recordPokemonBattleResult: (
      state,
      action: PayloadAction<{
        pokemonId: number;
        won: boolean;
      }>
    ) => {
      const { pokemonId, won } = action.payload;

      if (!state.pokemonStats[pokemonId]) {
        statisticsSlice.caseReducers.initializePokemonStats(state, { payload: pokemonId, type: '' });
      }

      const stats = state.pokemonStats[pokemonId];
      stats.battlesParticipated++;
      if (won) {
        stats.wins++;
      } else {
        stats.losses++;
      }
    },

    // Bulk updates
    recordBattleResults: (
      state,
      action: PayloadAction<{
        battleId: string;
        winnerId: string;
        loserId: string;
        duration: number;
        turns: number;
        team1Stats: {
          teamId: string;
          damageDealt: number;
          damageTaken: number;
          knockouts: number;
          pokemonIds: number[];
        };
        team2Stats: {
          teamId: string;
          damageDealt: number;
          damageTaken: number;
          knockouts: number;
          pokemonIds: number[];
        };
      }>
    ) => {
      const { battleId, winnerId, loserId, duration, turns, team1Stats, team2Stats } =
        action.payload;

      // Record battle stats
      state.battleStats[battleId] = {
        battleId,
        duration,
        totalTurns: turns,
        winner: winnerId,
        loser: loserId,
      };

      // Record team stats
      const winnerStats = team1Stats.teamId === winnerId ? team1Stats : team2Stats;
      const loserStats = team1Stats.teamId === loserId ? team1Stats : team2Stats;

      statisticsSlice.caseReducers.recordTeamWin(state, {
        payload: {
          teamId: winnerStats.teamId,
          damageDealt: winnerStats.damageDealt,
          damageTaken: winnerStats.damageTaken,
          battleDuration: duration,
          knockouts: winnerStats.knockouts,
        },
        type: '',
      });

      statisticsSlice.caseReducers.recordTeamLoss(state, {
        payload: {
          teamId: loserStats.teamId,
          damageDealt: loserStats.damageDealt,
          damageTaken: loserStats.damageTaken,
          battleDuration: duration,
          knockouts: loserStats.knockouts,
        },
        type: '',
      });

      // Record Pokemon participation
      [...winnerStats.pokemonIds, ...loserStats.pokemonIds].forEach((pokemonId) => {
        const won = winnerStats.pokemonIds.includes(pokemonId);
        statisticsSlice.caseReducers.recordPokemonBattleResult(state, {
          payload: { pokemonId, won },
          type: '',
        });
      });
    },

    // Clear statistics
    clearAllStatistics: (state) => {
      state.battleStats = {};
      state.teamStats = {};
      state.pokemonStats = {};
    },

    clearTeamStatistics: (state, action: PayloadAction<string>) => {
      const teamId = action.payload;
      delete state.teamStats[teamId];
    },

    clearPokemonStatistics: (state, action: PayloadAction<number>) => {
      const pokemonId = action.payload;
      delete state.pokemonStats[pokemonId];
    },
  },
});

export const {
  recordBattleStats,
  initializeTeamStats,
  recordTeamWin,
  recordTeamLoss,
  initializePokemonStats,
  recordPokemonDamageDealt,
  recordPokemonDamageTaken,
  recordPokemonKnockout,
  recordPokemonKnockedOut,
  recordPokemonBattleResult,
  recordBattleResults,
  clearAllStatistics,
  clearTeamStatistics,
  clearPokemonStatistics,
} = statisticsSlice.actions;

export default statisticsSlice.reducer;

