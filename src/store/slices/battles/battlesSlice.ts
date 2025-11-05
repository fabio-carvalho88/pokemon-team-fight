import { createSlice, createEntityAdapter, type PayloadAction } from '@reduxjs/toolkit';
import type { Battle, BattleAction, BattlePhase, BattleLogEntry } from '../../../types/battle';
import type { RootState } from '../../index';
import { loadBattleHistory } from '../../middleware/battlePersistence';

// Create entity adapter for normalized state
const battlesAdapter = createEntityAdapter<Battle>({
  sortComparer: (a, b) => b.startTime - a.startTime, // Most recent first
});

interface BattlesState {
  activeBattleId: string | null;
  pendingActions: BattleAction[];
  error: string | null;
  isHydrated: boolean;
}

// Load persisted battles from localStorage
const persistedBattles = loadBattleHistory();

// Create initial state with proper hydration
const baseInitialState = battlesAdapter.getInitialState<BattlesState>({
  activeBattleId: null,
  pendingActions: [],
  error: null,
  isHydrated: false,
});

// Add persisted battles if they exist
const initialState = persistedBattles.length > 0
  ? battlesAdapter.setAll(baseInitialState, persistedBattles)
  : baseInitialState;

const battlesSlice = createSlice({
  name: 'battles',
  initialState,
  reducers: {
    // Optimistic battle creation
    createBattleOptimistic: (state, action: PayloadAction<Battle>) => {
      battlesAdapter.addOne(state, action.payload);
      state.activeBattleId = action.payload.id;
      state.error = null;
    },

    createBattleSuccess: (state) => {
      // Battle already added optimistically, just clear error
      state.error = null;
    },

    createBattleFailed: (state, action: PayloadAction<{ battleId: string; error: string }>) => {
      // Remove the optimistically added battle
      battlesAdapter.removeOne(state, action.payload.battleId);
      state.error = action.payload.error;
      if (state.activeBattleId === action.payload.battleId) {
        state.activeBattleId = null;
      }
    },

    // Battle lifecycle
    startBattle: (state, action: PayloadAction<string>) => {
      const battleId = action.payload;
      const battle = state.entities[battleId];
      if (battle && battle.phase === 'SETUP') {
        battle.phase = 'READY';
      }
    },

    pauseBattle: (state, action: PayloadAction<string>) => {
      const battleId = action.payload;
      const battle = state.entities[battleId];
      if (battle) {
        // Store current phase to resume later
        battle.phase = 'ACTION_SELECT';
      }
    },

    endBattle: (state, action: PayloadAction<{ battleId: string; winnerId: string }>) => {
      const { battleId, winnerId } = action.payload;
      const battle = state.entities[battleId];
      if (battle) {
        battle.phase = 'BATTLE_END';
        battle.winnerId = winnerId;
        battle.endTime = Date.now();
      }
      if (state.activeBattleId === battleId) {
        state.activeBattleId = null;
      }
    },

    // Battle state updates
    updateBattlePhase: (
      state,
      action: PayloadAction<{
        battleId: string;
        phase: BattlePhase;
      }>
    ) => {
      const { battleId, phase } = action.payload;
      const battle = state.entities[battleId];
      if (battle) {
        battle.phase = phase;
      }
    },

    updateBattle: (
      state,
      action: PayloadAction<{
        battleId: string;
        changes: Partial<Battle>;
      }>
    ) => {
      const { battleId, changes } = action.payload;
      battlesAdapter.updateOne(state, {
        id: battleId,
        changes,
      });
    },

    incrementTurn: (state, action: PayloadAction<string>) => {
      const battleId = action.payload;
      const battle = state.entities[battleId];
      if (battle) {
        battle.currentTurn++;
      }
    },

    // Battle log
    addLogEntry: (
      state,
      action: PayloadAction<{
        battleId: string;
        entry: BattleLogEntry;
      }>
    ) => {
      const { battleId, entry } = action.payload;
      const battle = state.entities[battleId];
      if (battle) {
        battle.battleLog.push(entry);
      }
    },

    clearBattleLog: (state, action: PayloadAction<string>) => {
      const battleId = action.payload;
      const battle = state.entities[battleId];
      if (battle) {
        battle.battleLog = [];
      }
    },

    // Pokemon updates
    updatePokemonHP: (
      state,
      action: PayloadAction<{
        battleId: string;
        teamSide: 'team1' | 'team2';
        pokemonIndex: number;
        newHp: number;
        isKnockedOut: boolean;
      }>
    ) => {
      const { battleId, teamSide, pokemonIndex, newHp, isKnockedOut } = action.payload;
      const battle = state.entities[battleId];
      if (battle) {
        const pokemon = battle[teamSide].pokemons[pokemonIndex];
        if (pokemon) {
          pokemon.currentHp = newHp;
          pokemon.isKnockedOut = isKnockedOut;
        }
      }
    },

    updateActivePokemon: (
      state,
      action: PayloadAction<{
        battleId: string;
        teamSide: 'team1' | 'team2';
        newIndex: number;
      }>
    ) => {
      const { battleId, teamSide, newIndex } = action.payload;
      const battle = state.entities[battleId];
      if (battle) {
        battle[teamSide].activePokemonIndex = newIndex;
      }
    },

    updateMoveCooldown: (
      state,
      action: PayloadAction<{
        battleId: string;
        teamSide: 'team1' | 'team2';
        pokemonIndex: number;
        moveIndex: number;
        cooldown: number;
      }>
    ) => {
      const { battleId, teamSide, pokemonIndex, moveIndex, cooldown } = action.payload;
      const battle = state.entities[battleId];
      if (battle) {
        const pokemon = battle[teamSide].pokemons[pokemonIndex];
        if (pokemon && pokemon.moves[moveIndex]) {
          pokemon.moves[moveIndex].currentCooldown = cooldown;
        }
      }
    },

    updateMovePP: (
      state,
      action: PayloadAction<{
        battleId: string;
        teamSide: 'team1' | 'team2';
        pokemonIndex: number;
        moveIndex: number;
        pp: number;
      }>
    ) => {
      const { battleId, teamSide, pokemonIndex, moveIndex, pp } = action.payload;
      const battle = state.entities[battleId];
      if (battle) {
        const pokemon = battle[teamSide].pokemons[pokemonIndex];
        if (pokemon && pokemon.moves[moveIndex]) {
          pokemon.moves[moveIndex].currentPp = pp;
        }
      }
    },

    // Action queue management (for real-time battles)
    queueAction: (state, action: PayloadAction<BattleAction>) => {
      state.pendingActions.push(action.payload);
    },

    removeAction: (state, action: PayloadAction<string>) => {
      const actionId = action.payload;
      state.pendingActions = state.pendingActions.filter((a) => a.id !== actionId);
    },

    clearActionQueue: (state) => {
      state.pendingActions = [];
    },

    // Active battle management
    setActiveBattle: (state, action: PayloadAction<string | null>) => {
      state.activeBattleId = action.payload;
    },

    // Bulk operations
    removeBattle: (state, action: PayloadAction<string>) => {
      battlesAdapter.removeOne(state, action.payload);
      if (state.activeBattleId === action.payload) {
        state.activeBattleId = null;
      }
    },

    removeAllBattles: (state) => {
      battlesAdapter.removeAll(state);
      state.activeBattleId = null;
      state.pendingActions = [];
    },

    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Hydration
    hydrateBattles: (state, action: PayloadAction<Battle[]>) => {
      battlesAdapter.setAll(state, action.payload);
      state.isHydrated = true;
    },

    // Clear history
    clearBattleHistory: (state) => {
      // Remove only finished battles
      const activeIds = Object.values(state.entities)
        .filter((battle): battle is Battle =>
          battle !== undefined && battle.phase !== 'BATTLE_END'
        )
        .map((battle) => battle.id);

      battlesAdapter.removeMany(
        state,
        Object.keys(state.entities).filter((id) => !activeIds.includes(id))
      );
    },
  },
});

// Export actions
export const {
  createBattleOptimistic,
  createBattleSuccess,
  createBattleFailed,
  startBattle,
  pauseBattle,
  endBattle,
  updateBattlePhase,
  updateBattle,
  incrementTurn,
  addLogEntry,
  clearBattleLog,
  updatePokemonHP,
  updateActivePokemon,
  updateMoveCooldown,
  updateMovePP,
  queueAction,
  removeAction,
  clearActionQueue,
  setActiveBattle,
  removeBattle,
  removeAllBattles,
  setError,
  clearError,
  hydrateBattles,
  clearBattleHistory,
} = battlesSlice.actions;

// Export entity adapter selectors
export const battlesSelectors = battlesAdapter.getSelectors<RootState>(
  (state) => state.battles
);

export default battlesSlice.reducer;

