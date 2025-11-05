import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { fetchPokemons } from '../../services/pokemonService';
import { queryKeys } from '../../queryKeys';
import { type Pokemon } from '../../types/pokemon';

/**
 * Custom hook to fetch a list of Pokémon
 * @param options - Optional useQuery options to customize the query behavior
 * @returns Query result with pokemons data, loading state, and error
 */
export const usePokemon = (options?: Omit<UseQueryOptions<Pokemon[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.pokemons.all,
    queryFn: fetchPokemons,
    ...options
  });
};
