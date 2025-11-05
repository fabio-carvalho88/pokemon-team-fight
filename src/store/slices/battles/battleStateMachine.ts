import type { BattlePhase, Battle, BattleAction } from '../../../types/battle';

// State machine configuration
interface StateConfig {
  canTransitionTo: BattlePhase[];
  onEnter?: (battle: Battle) => Partial<Battle>;
  onExit?: (battle: Battle) => Partial<Battle>;
  autoTransitionTo?: BattlePhase;
  autoTransitionDelay?: number;
}

// State machine definition
const STATE_MACHINE: Record<BattlePhase, StateConfig> = {
  SETUP: {
    canTransitionTo: ['READY'],
    autoTransitionTo: 'READY',
    autoTransitionDelay: 0,
  },
  READY: {
    canTransitionTo: ['POKEMON_ENTRY'],
    autoTransitionTo: 'POKEMON_ENTRY',
    autoTransitionDelay: 500,
  },
  POKEMON_ENTRY: {
    canTransitionTo: ['ACTION_SELECT'],
    autoTransitionTo: 'ACTION_SELECT',
    autoTransitionDelay: 1500, // Time for entry animation
  },
  ACTION_SELECT: {
    canTransitionTo: ['EXECUTING_ACTION'],
    // No auto-transition - waits for player action
  },
  EXECUTING_ACTION: {
    canTransitionTo: ['ANIMATION'],
    autoTransitionTo: 'ANIMATION',
    autoTransitionDelay: 100,
  },
  ANIMATION: {
    canTransitionTo: ['DAMAGE_CALC'],
    // Transition happens when animation completes
  },
  DAMAGE_CALC: {
    canTransitionTo: ['CHECK_KO'],
    autoTransitionTo: 'CHECK_KO',
    autoTransitionDelay: 200,
  },
  CHECK_KO: {
    canTransitionTo: ['ACTION_SELECT', 'POKEMON_ENTRY', 'BATTLE_END'],
    // Transitions based on battle state:
    // - If Pokemon KO'd -> POKEMON_ENTRY (switch) or BATTLE_END (no more Pokemon)
    // - Otherwise -> ACTION_SELECT (continue battle)
  },
  BATTLE_END: {
    canTransitionTo: [],
    // Final state - no transitions
  },
};

/**
 * Check if a state transition is valid
 */
export const canTransition = (from: BattlePhase, to: BattlePhase): boolean => {
  const config = STATE_MACHINE[from];
  return config.canTransitionTo.includes(to);
};

/**
 * Transition to a new battle phase
 */
export const transitionToPhase = (
  battle: Battle,
  newPhase: BattlePhase
): { battle: Battle; valid: boolean; error?: string } => {
  if (!canTransition(battle.phase, newPhase)) {
    return {
      battle,
      valid: false,
      error: `Invalid transition from ${battle.phase} to ${newPhase}`,
    };
  }

  const currentConfig = STATE_MACHINE[battle.phase];
  const newConfig = STATE_MACHINE[newPhase];

  let updatedBattle = { ...battle };

  // Execute exit handler
  if (currentConfig.onExit) {
    const exitChanges = currentConfig.onExit(updatedBattle);
    updatedBattle = { ...updatedBattle, ...exitChanges };
  }

  // Update phase
  updatedBattle.phase = newPhase;

  // Execute enter handler
  if (newConfig.onEnter) {
    const enterChanges = newConfig.onEnter(updatedBattle);
    updatedBattle = { ...updatedBattle, ...enterChanges };
  }

  return {
    battle: updatedBattle,
    valid: true,
  };
};

/**
 * Get the next automatic transition if available
 */
export const getAutoTransition = (
  phase: BattlePhase
): { nextPhase: BattlePhase; delay: number } | null => {
  const config = STATE_MACHINE[phase];
  if (config.autoTransitionTo && config.autoTransitionDelay !== undefined) {
    return {
      nextPhase: config.autoTransitionTo,
      delay: config.autoTransitionDelay,
    };
  }
  return null;
};

/**
 * Determine next phase after CHECK_KO based on battle state
 */
export const determinePostKOPhase = (battle: Battle): BattlePhase => {
  const { team1, team2 } = battle;

  // Check if active Pokemon is knocked out
  const team1Active = team1.pokemons[team1.activePokemonIndex];
  const team2Active = team2.pokemons[team2.activePokemonIndex];

  // Check if all Pokemon on a team are knocked out
  const team1AllKO = team1.pokemons.every((p) => p.isKnockedOut);
  const team2AllKO = team2.pokemons.every((p) => p.isKnockedOut);

  if (team1AllKO || team2AllKO) {
    return 'BATTLE_END';
  }

  // If active Pokemon is KO'd, need to switch
  if (team1Active.isKnockedOut || team2Active.isKnockedOut) {
    return 'POKEMON_ENTRY';
  }

  // Otherwise continue battle
  return 'ACTION_SELECT';
};

/**
 * Validate battle action based on current phase
 */
export const validateAction = (
  battle: Battle,
  action: BattleAction
): { valid: boolean; error?: string } => {
  // Can only perform actions during ACTION_SELECT phase in real-time
  // or when action is queued
  if (battle.phase !== 'ACTION_SELECT' && !battle.isRealTime) {
    return {
      valid: false,
      error: 'Actions can only be performed during action selection phase',
    };
  }

  const team = action.teamId === battle.team1.teamId ? battle.team1 : battle.team2;
  const pokemon = team.pokemons[action.pokemonIndex];

  // Check if Pokemon is knocked out
  if (pokemon.isKnockedOut) {
    return {
      valid: false,
      error: 'Cannot use knocked out Pokemon',
    };
  }

  // Validate action type
  switch (action.type) {
    case 'ATTACK': {
      if (action.moveIndex === undefined) {
        return { valid: false, error: 'Move index required for attack' };
      }
      const move = pokemon.moves[action.moveIndex];
      if (!move) {
        return { valid: false, error: 'Invalid move index' };
      }
      if (move.currentPp <= 0) {
        return { valid: false, error: 'Move has no PP remaining' };
      }
      if (move.currentCooldown > 0 && battle.isRealTime) {
        return {
          valid: false,
          error: `Move on cooldown (${move.currentCooldown.toFixed(1)}s)`,
        };
      }
      break;
    }
    case 'SWITCH': {
      if (action.switchToPokemonIndex === undefined) {
        return { valid: false, error: 'Target Pokemon index required for switch' };
      }
      const targetPokemon = team.pokemons[action.switchToPokemonIndex];
      if (!targetPokemon) {
        return { valid: false, error: 'Invalid target Pokemon index' };
      }
      if (targetPokemon.isKnockedOut) {
        return { valid: false, error: 'Cannot switch to knocked out Pokemon' };
      }
      if (action.switchToPokemonIndex === action.pokemonIndex) {
        return { valid: false, error: 'Pokemon is already active' };
      }
      break;
    }
    case 'ITEM': {
      // Item validation would go here
      return { valid: false, error: 'Items not yet implemented' };
    }
    case 'FLEE': {
      // Can't flee from real-time battles typically
      if (battle.isRealTime) {
        return { valid: false, error: 'Cannot flee from real-time battle' };
      }
      break;
    }
    default:
      return { valid: false, error: 'Invalid action type' };
  }

  return { valid: true };
};

/**
 * Real-time battle update tick
 * Called every frame to update cooldowns and check for automatic transitions
 */
export const updateBattleTick = (
  battle: Battle,
  deltaTime: number
): { battle: Battle; shouldTransition: boolean; nextPhase?: BattlePhase } => {
  if (!battle.isRealTime) {
    return { battle, shouldTransition: false };
  }

  // Update cooldowns for all Pokemon
  const updatedTeam1 = {
    ...battle.team1,
    pokemons: battle.team1.pokemons.map((pokemon) => ({
      ...pokemon,
      moves: pokemon.moves.map((move) => ({
        ...move,
        currentCooldown: Math.max(0, move.currentCooldown - deltaTime),
      })),
    })),
  };

  const updatedTeam2 = {
    ...battle.team2,
    pokemons: battle.team2.pokemons.map((pokemon) => ({
      ...pokemon,
      moves: pokemon.moves.map((move) => ({
        ...move,
        currentCooldown: Math.max(0, move.currentCooldown - deltaTime),
      })),
    })),
  };

  const updatedBattle = {
    ...battle,
    team1: updatedTeam1,
    team2: updatedTeam2,
  };

  // Check for automatic phase transitions
  const autoTransition = getAutoTransition(battle.phase);
  if (autoTransition) {
    return {
      battle: updatedBattle,
      shouldTransition: true,
      nextPhase: autoTransition.nextPhase,
    };
  }

  return { battle: updatedBattle, shouldTransition: false };
};

/**
 * Get phase display name for UI
 */
export const getPhaseDisplayName = (phase: BattlePhase): string => {
  const names: Record<BattlePhase, string> = {
    SETUP: 'Setting up battle...',
    READY: 'Ready!',
    POKEMON_ENTRY: 'Pokemon entering battle!',
    ACTION_SELECT: 'Select your action',
    EXECUTING_ACTION: 'Executing action...',
    ANIMATION: 'Action in progress',
    DAMAGE_CALC: 'Calculating damage...',
    CHECK_KO: 'Checking status...',
    BATTLE_END: 'Battle finished!',
  };
  return names[phase];
};

/**
 * Check if phase allows user input
 */
export const isInputPhase = (phase: BattlePhase): boolean => {
  return phase === 'ACTION_SELECT';
};

