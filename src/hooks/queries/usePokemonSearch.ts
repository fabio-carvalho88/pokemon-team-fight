import { useQuery } from '@tanstack/react-query';
import { searchPokemon } from '../../services/pokemonService';
import { queryKeys } from '../../queryKeys';

/**
 * Custom hook to search for a specific Pokémon by name or ID
 * @param searchTerm - The name or ID of the Pokémon to search for
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns Query result with pokemon data, loading state, and error
 */
export const usePokemonSearch = (searchTerm: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.pokemons.detail(searchTerm),
    queryFn: () => searchPokemon(searchTerm),
    enabled: enabled && searchTerm.trim().length > 0,
    retry: false
  });
};
