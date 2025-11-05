import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export type GridColumns = 2 | 3 | 4 | 5 | 6;
export type SortOption = 'id' | 'name' | 'nameDesc';
export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

export interface DisplayOptions {
  showStats: boolean;
  showTypes: boolean;
  compactView: boolean;
}

export interface PreferencesState {
  // State
  gridColumns: GridColumns;
  sortBy: SortOption;
  displayOptions: DisplayOptions;
  filterByType: PokemonType | null;

  // Actions
  setGridColumns: (columns: GridColumns) => void;
  setSortPreference: (sortBy: SortOption) => void;
  toggleDisplayOption: (option: keyof DisplayOptions) => void;
  setFilterByType: (type: PokemonType | null) => void;
  resetPreferences: () => void;
}

const initialState = {
  gridColumns: 5 as GridColumns,
  sortBy: 'id' as SortOption,
  displayOptions: {
    showStats: false,
    showTypes: true,
    compactView: false
  },
  filterByType: null
};

export const usePreferencesStore = create<PreferencesState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setGridColumns: (gridColumns) => set({ gridColumns }, false, 'preferences/setGridColumns'),

        setSortPreference: (sortBy) => set({ sortBy }, false, 'preferences/setSortPreference'),

        toggleDisplayOption: (option) =>
          set(
            (state) => ({
              displayOptions: {
                ...state.displayOptions,
                [option]: !state.displayOptions[option]
              }
            }),
            false,
            'preferences/toggleDisplayOption'
          ),

        setFilterByType: (filterByType) => set({ filterByType }, false, 'preferences/setFilterByType'),

        resetPreferences: () => set(initialState, false, 'preferences/resetPreferences')
      }),
      {
        name: 'pokemon-preferences', // localStorage key
        version: 2 // Increment version to clear old data with theme
      }
    ),
    {
      name: 'Pokemon Preferences Store',
      enabled: true
    }
  )
);

// Selector hooks to prevent unnecessary re-renders
export const useGridColumns = () => usePreferencesStore((state) => state.gridColumns);
export const useSortBy = () => usePreferencesStore((state) => state.sortBy);
export const useDisplayOptions = () => usePreferencesStore((state) => state.displayOptions);
export const useFilterByType = () => usePreferencesStore((state) => state.filterByType);
