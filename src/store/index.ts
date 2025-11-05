import { configureStore } from '@reduxjs/toolkit';
import { pokemonApi } from './api/pokemonApi';
import battlesReducer from './slices/battles/battlesSlice';
import animationReducer from './slices/battles/animationSlice';
import statisticsReducer from './slices/statistics/statisticsSlice';
import filtersReducer from './slices/filters/filtersSlice';
import { setupListeners } from '@reduxjs/toolkit/query';
import { battlePersistenceMiddleware } from './middleware/battlePersistence';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    // RTK Query API
    [pokemonApi.reducerPath]: pokemonApi.reducer,

    // Feature slices
    battles: battlesReducer,
    animation: animationReducer,
    statistics: statisticsReducer,
    filters: filtersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serialization check for development performance
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['animation/updateFrameTime'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['animation.lastFrameTime'],
      },
    })
      .concat(pokemonApi.middleware)
      .concat(battlePersistenceMiddleware),
  devTools: {
    // Enable Redux DevTools with advanced features
    name: 'Pokemon Battle System',
    trace: true, // Enable action stack traces
    traceLimit: 25,
    maxAge: 50, // Maximum number of actions to keep in DevTools
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Setup listeners for refetchOnFocus/refetchOnReconnect behavior
setupListeners(store.dispatch);

