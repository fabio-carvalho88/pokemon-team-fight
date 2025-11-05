import { useSelector } from 'react-redux';
import {
  selectActiveBattle,
  selectActiveBattleTeams,
  selectActiveBattlePhase,
  selectActiveBattleLog,
  selectActivePokemon,
  selectBattleStatus,
  selectCanPerformActions,
  selectAvailableMoves,
  selectBattleProgress,
} from '../../store/slices/battles/battleSelectors';

/**
 * Hook for accessing active battle state
 */
export const useBattle = () => {
  const battle = useSelector(selectActiveBattle);
  const teams = useSelector(selectActiveBattleTeams);
  const phase = useSelector(selectActiveBattlePhase);
  const log = useSelector(selectActiveBattleLog);
  const activePokemon = useSelector(selectActivePokemon);
  const status = useSelector(selectBattleStatus);
  const canPerformActions = useSelector(selectCanPerformActions);
  const availableMoves = useSelector(selectAvailableMoves);
  const progress = useSelector(selectBattleProgress);

  return {
    battle,
    teams,
    phase,
    log,
    activePokemon,
    status,
    canPerformActions,
    availableMoves,
    progress,
    isActive: battle !== null,
  };
};

