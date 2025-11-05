import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../index';

// Base selectors
export const selectStatisticsState = (state: RootState) => state.statistics;
export const selectAllBattleStats = (state: RootState) => state.statistics.battleStats;
export const selectAllTeamStats = (state: RootState) => state.statistics.teamStats;
export const selectAllPokemonStats = (state: RootState) => state.statistics.pokemonStats;

// Team statistics selectors
export const selectTeamStatsById = createSelector(
  [selectAllTeamStats, (_state: RootState, teamId: string) => teamId],
  (teamStats, teamId) => teamStats[teamId] || null
);

export const selectTeamWinRate = createSelector(
  [selectTeamStatsById],
  (teamStats) => {
    if (!teamStats || teamStats.totalBattles === 0) return 0;
    return (teamStats.wins / teamStats.totalBattles) * 100;
  }
);

export const selectTeamPerformanceSummary = createSelector(
  [selectTeamStatsById],
  (teamStats) => {
    if (!teamStats) return null;

    const winRate = teamStats.totalBattles > 0
      ? (teamStats.wins / teamStats.totalBattles) * 100
      : 0;

    const avgDamagePerBattle = teamStats.totalBattles > 0
      ? teamStats.totalDamageDealt / teamStats.totalBattles
      : 0;

    const kdRatio = teamStats.losses > 0
      ? teamStats.knockouts / (teamStats.totalBattles - teamStats.wins)
      : teamStats.knockouts;

    return {
      teamId: teamStats.teamId,
      totalBattles: teamStats.totalBattles,
      winRate,
      wins: teamStats.wins,
      losses: teamStats.losses,
      avgDamagePerBattle,
      avgDamageTakenPerBattle: teamStats.totalBattles > 0
        ? teamStats.totalDamageTaken / teamStats.totalBattles
        : 0,
      kdRatio,
      knockouts: teamStats.knockouts,
      averageBattleDuration: teamStats.averageBattleDuration,
    };
  }
);

// Top performing teams
export const selectTopTeams = createSelector(
  [selectAllTeamStats, (_state: RootState, limit: number = 5) => limit],
  (teamStats, limit) => {
    return Object.values(teamStats)
      .sort((a, b) => {
        const winRateA = a.totalBattles > 0 ? a.wins / a.totalBattles : 0;
        const winRateB = b.totalBattles > 0 ? b.wins / b.totalBattles : 0;
        return winRateB - winRateA;
      })
      .slice(0, limit);
  }
);

// Pokemon statistics selectors
export const selectPokemonStatsById = createSelector(
  [selectAllPokemonStats, (_state: RootState, pokemonId: number) => pokemonId],
  (pokemonStats, pokemonId) => pokemonStats[pokemonId] || null
);

export const selectPokemonWinRate = createSelector(
  [selectPokemonStatsById],
  (pokemonStats) => {
    if (!pokemonStats || pokemonStats.battlesParticipated === 0) return 0;
    return (pokemonStats.wins / pokemonStats.battlesParticipated) * 100;
  }
);

export const selectPokemonPerformance = createSelector(
  [selectPokemonStatsById],
  (pokemonStats) => {
    if (!pokemonStats) return null;

    const winRate = pokemonStats.battlesParticipated > 0
      ? (pokemonStats.wins / pokemonStats.battlesParticipated) * 100
      : 0;

    const avgDamagePerBattle = pokemonStats.battlesParticipated > 0
      ? pokemonStats.totalDamageDealt / pokemonStats.battlesParticipated
      : 0;

    const survivalRate = pokemonStats.battlesParticipated > 0
      ? ((pokemonStats.battlesParticipated - pokemonStats.timesKnockedOut) /
         pokemonStats.battlesParticipated) * 100
      : 0;

    return {
      pokemonId: pokemonStats.pokemonId,
      battlesParticipated: pokemonStats.battlesParticipated,
      winRate,
      avgDamagePerBattle,
      survivalRate,
      knockouts: pokemonStats.knockouts,
      timesKnockedOut: pokemonStats.timesKnockedOut,
      favoriteMove: Object.entries(pokemonStats.movesUsed).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    };
  }
);

// Top performing Pokemon
export const selectTopPokemon = createSelector(
  [selectAllPokemonStats, (_state: RootState, limit: number = 10) => limit],
  (pokemonStats, limit) => {
    return Object.values(pokemonStats)
      .filter((p) => p.battlesParticipated > 0)
      .sort((a, b) => {
        const winRateA = a.wins / a.battlesParticipated;
        const winRateB = b.wins / b.battlesParticipated;
        return winRateB - winRateA;
      })
      .slice(0, limit);
  }
);

// Most used moves across all Pokemon
export const selectMostUsedMoves = createSelector(
  [selectAllPokemonStats, (_state: RootState, limit: number = 10) => limit],
  (pokemonStats, limit) => {
    const moveUsage: Record<string, number> = {};

    Object.values(pokemonStats).forEach((pokemon) => {
      Object.entries(pokemon.movesUsed).forEach(([move, count]) => {
        moveUsage[move] = (moveUsage[move] || 0) + count;
      });
    });

    return Object.entries(moveUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([move, count]) => ({ move, count }));
  }
);

// Battle statistics selectors
export const selectBattleStatsById = createSelector(
  [selectAllBattleStats, (_state: RootState, battleId: string) => battleId],
  (battleStats, battleId) => battleStats[battleId] || null
);

export const selectRecentBattleStats = createSelector(
  [selectAllBattleStats, (_state: RootState, limit: number = 10) => limit],
  (battleStats, limit) => {
    return Object.values(battleStats)
      .sort((a, b) => {
        // Sort by battle ID which contains timestamp
        return b.battleId.localeCompare(a.battleId);
      })
      .slice(0, limit);
  }
);

// Overall statistics summary
export const selectOverallStatistics = createSelector(
  [selectAllBattleStats, selectAllTeamStats, selectAllPokemonStats],
  (battleStats, teamStats, pokemonStats) => {
    const totalBattles = Object.keys(battleStats).length;
    const totalTeams = Object.keys(teamStats).length;
    const totalPokemon = Object.keys(pokemonStats).length;

    const avgBattleDuration = Object.values(battleStats).reduce(
      (sum, stat) => sum + stat.duration,
      0
    ) / (totalBattles || 1);

    const avgTurnsPerBattle = Object.values(battleStats).reduce(
      (sum, stat) => sum + stat.totalTurns,
      0
    ) / (totalBattles || 1);

    const totalDamageDealt = Object.values(pokemonStats).reduce(
      (sum, stat) => sum + stat.totalDamageDealt,
      0
    );

    return {
      totalBattles,
      totalTeams,
      totalPokemon,
      avgBattleDuration,
      avgTurnsPerBattle,
      totalDamageDealt,
    };
  }
);

// Compare two teams
export const selectTeamComparison = createSelector(
  [
    selectAllTeamStats,
    (_state: RootState, team1Id: string, _team2Id: string) => team1Id,
    (_state: RootState, _team1Id: string, team2Id: string) => team2Id,
  ],
  (teamStats, team1Id, team2Id) => {
    const team1 = teamStats[team1Id];
    const team2 = teamStats[team2Id];

    if (!team1 || !team2) return null;

    const team1WinRate = team1.totalBattles > 0 ? (team1.wins / team1.totalBattles) * 100 : 0;
    const team2WinRate = team2.totalBattles > 0 ? (team2.wins / team2.totalBattles) * 100 : 0;

    return {
      team1: {
        id: team1.teamId,
        winRate: team1WinRate,
        totalBattles: team1.totalBattles,
        avgDamage: team1.totalBattles > 0 ? team1.totalDamageDealt / team1.totalBattles : 0,
        knockouts: team1.knockouts,
      },
      team2: {
        id: team2.teamId,
        winRate: team2WinRate,
        totalBattles: team2.totalBattles,
        avgDamage: team2.totalBattles > 0 ? team2.totalDamageDealt / team2.totalBattles : 0,
        knockouts: team2.knockouts,
      },
      recommendation: team1WinRate > team2WinRate ? team1Id : team2Id,
    };
  }
);

