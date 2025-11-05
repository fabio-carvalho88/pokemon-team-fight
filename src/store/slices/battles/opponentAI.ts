import type { BattlePokemon } from '../../../types/battle';

/**
 * Simple AI to select a move for the opponent
 */
export const selectOpponentMove = (pokemon: BattlePokemon): number => {
  // Filter available moves (has PP and not on cooldown)
  const availableMoves = pokemon.moves
    .map((move, index) => ({ move, index }))
    .filter(({ move }) => move.currentPp > 0 && move.currentCooldown === 0);

  if (availableMoves.length === 0) {
    // If no moves available, return first move (struggle)
    return 0;
  }

  // Strategy: Prefer higher power moves
  const sortedMoves = availableMoves.sort((a, b) => {
    // Prioritize moves with power
    if (a.move.power > 0 && b.move.power === 0) return -1;
    if (a.move.power === 0 && b.move.power > 0) return 1;

    // Among damaging moves, prefer higher power
    return b.move.power - a.move.power;
  });

  // Add some randomness - 70% chance to use best move, 30% random
  if (Math.random() > 0.3) {
    return sortedMoves[0].index;
  } else {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex].index;
  }
};

/**
 * Determine if opponent should switch Pokemon
 * For now, just returns false (no switching logic)
 */
export const shouldOpponentSwitch = (activePokemon: BattlePokemon, allPokemon: BattlePokemon[]): boolean => {
  // Don't switch if active Pokemon has more than 25% HP
  const hpPercent = (activePokemon.currentHp / activePokemon.maxHp) * 100;
  if (hpPercent > 25) return false;

  // Check if there's a healthier Pokemon available
  const healthierPokemon = allPokemon.some((p) => {
    if (p.isKnockedOut || p === activePokemon) return false;
    const otherHpPercent = (p.currentHp / p.maxHp) * 100;
    return otherHpPercent > hpPercent + 20;
  });

  return healthierPokemon && Math.random() > 0.5;
};

/**
 * Select which Pokemon to switch to
 */
export const selectOpponentSwitchTarget = (currentIndex: number, allPokemon: BattlePokemon[]): number => {
  // Find all available Pokemon
  const availablePokemon = allPokemon
    .map((p, index) => ({ pokemon: p, index }))
    .filter(({ pokemon, index }) => !pokemon.isKnockedOut && index !== currentIndex);

  if (availablePokemon.length === 0) return currentIndex;

  // Select the one with highest HP percentage
  availablePokemon.sort((a, b) => {
    const hpPercentA = (a.pokemon.currentHp / a.pokemon.maxHp) * 100;
    const hpPercentB = (b.pokemon.currentHp / b.pokemon.maxHp) * 100;
    return hpPercentB - hpPercentA;
  });

  return availablePokemon[0].index;
};
