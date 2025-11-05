import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
  selectTeamStatsById,
  selectTeamWinRate,
  selectTeamPerformanceSummary,
  selectPokemonStatsById,
  selectPokemonPerformance,
  selectOverallStatistics,
} from '../../store/slices/statistics/statisticsSelectors';

/**
 * Hook for accessing battle statistics
 */
export const useBattleStatistics = () => {
  const overallStats = useSelector(selectOverallStatistics);

  const getTeamStats = (teamId: string) => {
    return useSelector((state: RootState) => selectTeamStatsById(state, teamId));
  };

  const getTeamWinRate = (teamId: string) => {
    return useSelector((state: RootState) => selectTeamWinRate(state, teamId));
  };

  const getTeamPerformance = (teamId: string) => {
    return useSelector((state: RootState) => selectTeamPerformanceSummary(state, teamId));
  };

  const getPokemonStats = (pokemonId: number) => {
    return useSelector((state: RootState) => selectPokemonStatsById(state, pokemonId));
  };

  const getPokemonPerformance = (pokemonId: number) => {
    return useSelector((state: RootState) => selectPokemonPerformance(state, pokemonId));
  };

  return {
    overallStats,
    getTeamStats,
    getTeamWinRate,
    getTeamPerformance,
    getPokemonStats,
    getPokemonPerformance,
  };
};

