import type { BattlePokemon, Move, DamageCalculation } from '../../../types/battle';

// Type effectiveness chart (attacker type -> defender type -> multiplier)
const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2,
  },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: {
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
    steel: 2,
  },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
    steel: 0.5,
  },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
    fairy: 2,
  },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

/**
 * Calculate type effectiveness multiplier
 */
export const calculateTypeEffectiveness = (
  moveType: string,
  defenderTypes: Array<{ type: { name: string } }>
): number => {
  let multiplier = 1;

  for (const defenderType of defenderTypes) {
    const defenderTypeName = defenderType.type.name;
    const typeMatchup = TYPE_CHART[moveType]?.[defenderTypeName];

    if (typeMatchup !== undefined) {
      multiplier *= typeMatchup;
    }
  }

  return multiplier;
};

/**
 * Check if attack is a critical hit (1/16 chance)
 */
export const isCriticalHit = (): boolean => {
  return Math.random() < 1 / 16;
};

/**
 * Calculate damage using Pokemon damage formula
 * Formula: ((2 * Level / 5 + 2) * Power * (Attack / Defense) / 50 + 2) * Modifiers
 */
export const calculateDamage = (
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: Move
): DamageCalculation => {
  // If move has no power (status move), return 0 damage
  if (move.power === 0) {
    return {
      damage: 0,
      isCritical: false,
      effectiveness: 1,
      attackerName: attacker.pokemon.name,
      defenderName: defender.pokemon.name,
      moveName: move.name,
    };
  }

  const level = 50; // Standard battle level
  const power = move.power;

  // Determine attack and defense stats based on move type
  let attack: number;
  let defense: number;

  if (move.damageClass === 'physical') {
    attack = attacker.stats.attack;
    defense = defender.stats.defense;
  } else if (move.damageClass === 'special') {
    attack = attacker.stats.specialAttack;
    defense = defender.stats.specialDefense;
  } else {
    // Status move
    return {
      damage: 0,
      isCritical: false,
      effectiveness: 1,
      attackerName: attacker.pokemon.name,
      defenderName: defender.pokemon.name,
      moveName: move.name,
    };
  }

  // Base damage calculation
  const baseDamage = ((2 * level) / 5 + 2) * power * (attack / defense);
  let damage = Math.floor(baseDamage / 50) + 2;

  // Critical hit (1.5x damage)
  const isCritical = isCriticalHit();
  if (isCritical) {
    damage = Math.floor(damage * 1.5);
  }

  // Type effectiveness
  const effectiveness = calculateTypeEffectiveness(move.type, defender.types);
  damage = Math.floor(damage * effectiveness);

  // STAB (Same Type Attack Bonus) - 1.5x if move type matches attacker type
  const hasStab = attacker.types.some((t) => t.type.name === move.type);
  if (hasStab) {
    damage = Math.floor(damage * 1.5);
  }

  // Random factor (0.85 to 1.0)
  const randomFactor = 0.85 + Math.random() * 0.15;
  damage = Math.floor(damage * randomFactor);

  // Ensure minimum damage of 1 if move has power
  damage = Math.max(1, damage);

  return {
    damage,
    isCritical,
    effectiveness,
    attackerName: attacker.pokemon.name,
    defenderName: defender.pokemon.name,
    moveName: move.name,
  };
};

/**
 * Apply damage to a Pokemon and return updated Pokemon
 */
export const applyDamage = (pokemon: BattlePokemon, damage: number): BattlePokemon => {
  const newHp = Math.max(0, pokemon.currentHp - damage);
  return {
    ...pokemon,
    currentHp: newHp,
    isKnockedOut: newHp === 0,
  };
};

/**
 * Check if a Pokemon can use a move (has PP and not on cooldown)
 */
export const canUseMove = (move: Move): boolean => {
  return move.currentPp > 0 && move.currentCooldown === 0;
};

/**
 * Update move after use (decrease PP, set cooldown)
 */
export const useMove = (move: Move): Move => {
  return {
    ...move,
    currentPp: Math.max(0, move.currentPp - 1),
    currentCooldown: move.cooldown,
  };
};

/**
 * Update cooldowns for all moves (called each frame/tick)
 */
export const updateCooldowns = (moves: Move[], deltaTime: number): Move[] => {
  return moves.map((move) => ({
    ...move,
    currentCooldown: Math.max(0, move.currentCooldown - deltaTime),
  }));
};

/**
 * Determine turn order based on Pokemon speed stats
 * In real-time combat, this determines action priority when actions occur simultaneously
 */
export const determineTurnOrder = (
  pokemon1: BattlePokemon,
  pokemon2: BattlePokemon,
  move1?: Move,
  move2?: Move
): 'pokemon1' | 'pokemon2' => {
  // Priority moves go first
  if (move1 && move2) {
    if (move1.priority > move2.priority) return 'pokemon1';
    if (move2.priority > move1.priority) return 'pokemon2';
  }

  // Otherwise, faster Pokemon goes first
  if (pokemon1.stats.speed > pokemon2.stats.speed) return 'pokemon1';
  if (pokemon2.stats.speed > pokemon1.stats.speed) return 'pokemon2';

  // If tied, random
  return Math.random() < 0.5 ? 'pokemon1' : 'pokemon2';
};

/**
 * Get effectiveness message for UI display
 */
export const getEffectivenessMessage = (effectiveness: number): string => {
  if (effectiveness === 0) return "It doesn't affect the opponent!";
  if (effectiveness < 1) return "It's not very effective...";
  if (effectiveness > 1) return "It's super effective!";
  return '';
};

/**
 * Calculate move cooldown based on move power and speed
 * Lower power moves have shorter cooldowns for real-time combat
 */
export const calculateMoveCooldown = (move: Move, pokemonSpeed: number): number => {
  const baseCooldown = move.power / 10; // 40 power = 4s cooldown
  const speedModifier = 1 - pokemonSpeed / 500; // Faster Pokemon = shorter cooldown
  const cooldown = baseCooldown * Math.max(0.5, speedModifier);
  return Math.max(1, cooldown); // Minimum 1 second cooldown
};

/**
 * Initialize battle stats for a Pokemon with full HP and moves
 */
export const initializeBattlePokemon = (
  pokemon: BattlePokemon,
  moveDetails: Move[]
): BattlePokemon => {
  // Add cooldown values based on move power
  const movesWithCooldown = moveDetails.map((move) => {
    const cooldown = calculateMoveCooldown(move, pokemon.stats.speed);
    return {
      ...move,
      currentPp: move.pp,
      cooldown,
      currentCooldown: 0,
    };
  });

  return {
    ...pokemon,
    currentHp: pokemon.maxHp,
    moves: movesWithCooldown,
    isKnockedOut: false,
  };
};

/**
 * Check if battle is over (all Pokemon on one side are knocked out)
 */
export const isBattleOver = (team1Pokemon: BattlePokemon[], team2Pokemon: BattlePokemon[]): 'team1' | 'team2' | null => {
  const team1Alive = team1Pokemon.some((p) => !p.isKnockedOut);
  const team2Alive = team2Pokemon.some((p) => !p.isKnockedOut);

  console.log('Battle Over Check:', {
    team1Alive,
    team2Alive,
    team1KOd: team1Pokemon.filter((p) => p.isKnockedOut).length,
    team2KOd: team2Pokemon.filter((p) => p.isKnockedOut).length,
  });

  if (!team1Alive && team2Alive) return 'team2';
  if (!team2Alive && team1Alive) return 'team1';
  return null;
};

/**
 * Get next available Pokemon index (not knocked out)
 */
export const getNextAvailablePokemon = (pokemons: BattlePokemon[]): number => {
  const index = pokemons.findIndex((p) => !p.isKnockedOut);
  return index !== -1 ? index : 0;
};

