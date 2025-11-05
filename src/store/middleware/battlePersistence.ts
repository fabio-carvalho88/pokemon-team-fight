import type { Middleware, PayloadAction } from '@reduxjs/toolkit';
import type { Battle } from '../../types/battle';

const BATTLES_STORAGE_KEY = 'pokemon-battle-history';

/**
 * Middleware to persist battle history to localStorage
 */
export const battlePersistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // Save battles to localStorage whenever battle state changes
  if ((action as PayloadAction<unknown>).type?.startsWith('battles/')) {
    const state = store.getState();
    const battles = state.battles;

    try {
      // Save only finished battles to reduce storage size
      const finishedBattles = Object.values(battles.entities).filter(
        (battle): battle is Battle => battle != null && (battle as Battle).phase === 'BATTLE_END'
      );

      if (finishedBattles.length > 0) {
        localStorage.setItem(BATTLES_STORAGE_KEY, JSON.stringify(finishedBattles));
        console.log(`Saved ${finishedBattles.length} finished battles to localStorage`);
      }
    } catch (error) {
      console.error('Failed to save battle history:', error);
    }
  }

  return result;
};

/**
 * Load battle history from localStorage
 */
export const loadBattleHistory = () => {
  try {
    const stored = localStorage.getItem(BATTLES_STORAGE_KEY);
    if (stored) {
      const battles = JSON.parse(stored);
      console.log(`Loaded ${battles.length} battles from localStorage`);
      return battles;
    } else {
      console.log('No battles found in localStorage');
    }
  } catch (error) {
    console.error('Failed to load battle history:', error);
  }
  return [];
};

/**
 * Clear battle history from localStorage
 */
export const clearBattleHistory = () => {
  try {
    localStorage.removeItem(BATTLES_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear battle history:', error);
  }
};
