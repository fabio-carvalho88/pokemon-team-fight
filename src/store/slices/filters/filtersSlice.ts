import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FiltersState {
  battleListFilters: {
    status: 'all' | 'active' | 'finished';
    teamId: string | null;
    dateRange: [number, number] | null;
  };
}

const initialState: FiltersState = {
  battleListFilters: {
    status: 'all',
    teamId: null,
    dateRange: null,
  },
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<'all' | 'active' | 'finished'>) => {
      state.battleListFilters.status = action.payload;
    },

    setTeamFilter: (state, action: PayloadAction<string | null>) => {
      state.battleListFilters.teamId = action.payload;
    },

    setDateRange: (state, action: PayloadAction<[number, number] | null>) => {
      state.battleListFilters.dateRange = action.payload;
    },

    setDateRangePreset: (
      state,
      action: PayloadAction<'today' | 'week' | 'month' | 'all'>
    ) => {
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      switch (action.payload) {
        case 'today':
          state.battleListFilters.dateRange = [now - oneDayMs, now];
          break;
        case 'week':
          state.battleListFilters.dateRange = [now - 7 * oneDayMs, now];
          break;
        case 'month':
          state.battleListFilters.dateRange = [now - 30 * oneDayMs, now];
          break;
        case 'all':
          state.battleListFilters.dateRange = null;
          break;
      }
    },

    resetFilters: (state) => {
      state.battleListFilters = initialState.battleListFilters;
    },

    setAllFilters: (
      state,
      action: PayloadAction<{
        status?: 'all' | 'active' | 'finished';
        teamId?: string | null;
        dateRange?: [number, number] | null;
      }>
    ) => {
      const { status, teamId, dateRange } = action.payload;
      if (status !== undefined) state.battleListFilters.status = status;
      if (teamId !== undefined) state.battleListFilters.teamId = teamId;
      if (dateRange !== undefined) state.battleListFilters.dateRange = dateRange;
    },
  },
});

export const {
  setStatusFilter,
  setTeamFilter,
  setDateRange,
  setDateRangePreset,
  resetFilters,
  setAllFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;

