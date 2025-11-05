/**
 * Utility functions for battle history storage management
 */

const BATTLES_STORAGE_KEY = 'pokemon-battle-history';
const STORAGE_VERSION = '1.0';
const VERSION_KEY = 'pokemon-battle-history-version';

/**
 * Get storage size in KB
 */
export const getStorageSize = (): number => {
  try {
    const stored = localStorage.getItem(BATTLES_STORAGE_KEY);
    if (stored) {
      return new Blob([stored]).size / 1024;
    }
  } catch (error) {
    console.error('Failed to get storage size:', error);
  }
  return 0;
};

/**
 * Get number of battles in storage
 */
export const getBattleCount = (): number => {
  try {
    const stored = localStorage.getItem(BATTLES_STORAGE_KEY);
    if (stored) {
      const battles = JSON.parse(stored);
      return Array.isArray(battles) ? battles.length : 0;
    }
  } catch (error) {
    console.error('Failed to get battle count:', error);
  }
  return 0;
};

/**
 * Check if storage version matches
 */
export const checkStorageVersion = (): boolean => {
  try {
    const version = localStorage.getItem(VERSION_KEY);
    if (version !== STORAGE_VERSION) {
      console.log('Storage version mismatch, clearing old data');
      localStorage.removeItem(BATTLES_STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to check storage version:', error);
    return false;
  }
};

/**
 * Export battle history as JSON file
 */
export const exportBattleHistory = (): void => {
  try {
    const stored = localStorage.getItem(BATTLES_STORAGE_KEY);
    if (stored) {
      const blob = new Blob([stored], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pokemon-battle-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Failed to export battle history:', error);
  }
};

/**
 * Import battle history from JSON file
 */
export const importBattleHistory = (file: File): Promise<unknown[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const battles = JSON.parse(content);
        if (Array.isArray(battles)) {
          localStorage.setItem(BATTLES_STORAGE_KEY, content);
          resolve(battles);
        } else {
          reject(new Error('Invalid battle history format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

