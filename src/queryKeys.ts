/**
 * Centralized query keys for React Query
 * This ensures consistent cache keys across the application
 */
export const queryKeys = {
  pokemons: {
    all: ['pokemons'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.pokemons.all, 'list', filters] as const,
    detail: (id: number | string) => [...queryKeys.pokemons.all, 'detail', id] as const
  }
} as const;
