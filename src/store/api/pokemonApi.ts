import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { PokemonBattleStats, MoveDetails, AbilityDetails } from '../../types/pokemon';

// PokeAPI response interfaces
interface PokeApiPokemon {
  id: number;
  name: string;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
  moves: Array<{
    move: {
      name: string;
      url: string;
    };
  }>;
  sprites: {
    front_default: string;
    back_default: string;
    front_shiny: string;
    back_shiny: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
    versions: {
      'generation-v': {
        'black-white': {
          animated: {
            front_default: string;
            back_default: string;
          };
        };
      };
    };
  };
  weight: number;
  height: number;
}

interface PokeApiMove {
  id: number;
  name: string;
  power: number | null;
  pp: number;
  accuracy: number | null;
  priority: number;
  damage_class: {
    name: 'physical' | 'special' | 'status';
  };
  type: {
    name: string;
  };
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: {
      name: string;
    };
  }>;
}

interface PokeApiAbility {
  id: number;
  name: string;
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: {
      name: string;
    };
  }>;
}

// Transform PokeAPI stats format to our format
const transformPokemonStats = (apiPokemon: PokeApiPokemon): PokemonBattleStats => {
  const statsMap = apiPokemon.stats.reduce(
    (acc, stat) => {
      const statName = stat.stat.name;
      if (statName === 'hp') acc.hp = stat.base_stat;
      else if (statName === 'attack') acc.attack = stat.base_stat;
      else if (statName === 'defense') acc.defense = stat.base_stat;
      else if (statName === 'special-attack') acc.specialAttack = stat.base_stat;
      else if (statName === 'special-defense') acc.specialDefense = stat.base_stat;
      else if (statName === 'speed') acc.speed = stat.base_stat;
      return acc;
    },
    {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
    }
  );

  return {
    id: apiPokemon.id,
    name: apiPokemon.name,
    baseStats: statsMap,
    types: apiPokemon.types,
    abilities: apiPokemon.abilities,
    moves: apiPokemon.moves,
    sprites: apiPokemon.sprites,
    weight: apiPokemon.weight,
    height: apiPokemon.height,
  };
};

// Create the Pokemon API
export const pokemonApi = createApi({
  reducerPath: 'pokemonApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://pokeapi.co/api/v2/' }),
  tagTypes: ['Pokemon', 'Move', 'Ability'],
  // Cache for 1 hour
  keepUnusedDataFor: 3600,
  endpoints: (builder) => ({
    // Get Pokemon by ID or name with full battle stats
    getPokemonById: builder.query<PokemonBattleStats, number | string>({
      query: (id) => `pokemon/${id}`,
      transformResponse: (response: PokeApiPokemon) => transformPokemonStats(response),
      providesTags: (result, _error, id) =>
        result ? [{ type: 'Pokemon', id: result.id }] : [],
    }),

    // Get multiple Pokemon at once (for team loading)
    getPokemonByIds: builder.query<PokemonBattleStats[], number[]>({
      async queryFn(ids, _api, _extraOptions, fetchWithBQ) {
        const results = await Promise.all(
          ids.map(async (id) => {
            const result = await fetchWithBQ(`pokemon/${id}`);
            if (result.error) return null;
            return transformPokemonStats(result.data as PokeApiPokemon);
          })
        );
        const filteredResults = results.filter((r): r is PokemonBattleStats => r !== null);
        return { data: filteredResults };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((pokemon) => ({ type: 'Pokemon' as const, id: pokemon.id })),
              { type: 'Pokemon', id: 'LIST' },
            ]
          : [{ type: 'Pokemon', id: 'LIST' }],
    }),

    // Get move details by name or ID
    getMoveDetails: builder.query<MoveDetails, string | number>({
      query: (id) => `move/${id}`,
      transformResponse: (response: PokeApiMove) => {
        const englishEffect = response.effect_entries.find((e) => e.language.name === 'en');
        return {
          id: response.id,
          name: response.name,
          power: response.power,
          pp: response.pp,
          accuracy: response.accuracy,
          priority: response.priority,
          damage_class: response.damage_class,
          type: response.type,
          effect_entries: englishEffect
            ? [
                {
                  effect: englishEffect.effect,
                  short_effect: englishEffect.short_effect,
                },
              ]
            : [],
        };
      },
      providesTags: (result) => (result ? [{ type: 'Move', id: result.name }] : []),
    }),

    // Get multiple moves at once
    getMovesByNames: builder.query<MoveDetails[], string[]>({
      async queryFn(names, _api, _extraOptions, fetchWithBQ) {
        // Limit to first 4 moves for performance
        const limitedNames = names.slice(0, 4);
        const results = await Promise.all(
          limitedNames.map(async (name) => {
            const result = await fetchWithBQ(`move/${name}`);
            if (result.error) return null;
            const moveData = result.data as PokeApiMove;
            const englishEffect = moveData.effect_entries.find((e) => e.language.name === 'en');
            return {
              id: moveData.id,
              name: moveData.name,
              power: moveData.power,
              pp: moveData.pp,
              accuracy: moveData.accuracy,
              priority: moveData.priority,
              damage_class: moveData.damage_class,
              type: moveData.type,
              effect_entries: englishEffect
                ? [
                    {
                      effect: englishEffect.effect,
                      short_effect: englishEffect.short_effect,
                    },
                  ]
                : [],
            };
          })
        );
        const filteredResults = results.filter((r): r is MoveDetails => r !== null);
        return { data: filteredResults };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((move) => ({ type: 'Move' as const, id: move.name })),
              { type: 'Move', id: 'LIST' },
            ]
          : [{ type: 'Move', id: 'LIST' }],
    }),

    // Get ability details
    getAbilityDetails: builder.query<AbilityDetails, string | number>({
      query: (id) => `ability/${id}`,
      transformResponse: (response: PokeApiAbility) => {
        const englishEffect = response.effect_entries.find((e) => e.language.name === 'en');
        return {
          id: response.id,
          name: response.name,
          effect_entries: englishEffect
            ? [
                {
                  effect: englishEffect.effect,
                  short_effect: englishEffect.short_effect,
                },
              ]
            : [],
        };
      },
      providesTags: (result) => (result ? [{ type: 'Ability', id: result.name }] : []),
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetPokemonByIdQuery,
  useGetPokemonByIdsQuery,
  useGetMoveDetailsQuery,
  useGetMovesByNamesQuery,
  useGetAbilityDetailsQuery,
  usePrefetch,
} = pokemonApi;

