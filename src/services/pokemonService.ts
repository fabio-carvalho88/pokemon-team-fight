import type { Pokemon } from '../types/pokemon';

interface PokemonListResponse {
  results: Array<{
    name: string;
    url: string;
  }>;
}

export const fetchPokemons = async (): Promise<Pokemon[]> => {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=5');

  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon');
  }

  const data: PokemonListResponse = await response.json();

  // Extract pokemon ID from URL and construct image URL
  const pokemons: Pokemon[] = data.results.map((pokemon) => {
    const id = parseInt(pokemon.url.split('/').slice(-2, -1)[0]);
    return {
      name: pokemon.name,
      url: pokemon.url,
      id,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    };
  });

  return pokemons;
};

interface PokemonDetailResponse {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
}

export const searchPokemon = async (searchTerm: string): Promise<Pokemon> => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);

  if (!response.ok) {
    throw new Error('Pokémon not found');
  }

  const data: PokemonDetailResponse = await response.json();

  return {
    name: data.name,
    url: `https://pokeapi.co/api/v2/pokemon/${data.id}`,
    id: data.id,
    image: data.sprites.other['official-artwork'].front_default
  };
};

interface PokemonDetailResponseExtended extends PokemonDetailResponse {
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
}

interface TypeResponse {
  pokemon: Array<{
    pokemon: {
      name: string;
      url: string;
    };
  }>;
}

interface SearchFilters {
  name: string;
  type: string;
  generation: string;
  minStat: string;
}

const GENERATION_RANGES: Record<string, [number, number]> = {
  '1': [1, 151],
  '2': [152, 251],
  '3': [252, 386],
  '4': [387, 493],
  '5': [494, 649],
  '6': [650, 721],
  '7': [722, 809],
  '8': [810, 905],
  '9': [906, 1025]
};

const fetchPokemonDetails = async (pokemonId: number): Promise<Pokemon & { totalStats: number }> => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch details for Pokémon #${pokemonId}`);
  }

  const data: PokemonDetailResponseExtended = await response.json();

  const totalStats = data.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

  return {
    name: data.name,
    url: `https://pokeapi.co/api/v2/pokemon/${data.id}`,
    id: data.id,
    image: data.sprites.other['official-artwork'].front_default,
    totalStats
  };
};

export const searchPokemonAdvanced = async (filters: SearchFilters): Promise<Pokemon[]> => {
  // If name is provided, search by name only
  if (filters.name.trim()) {
    try {
      const pokemon = await searchPokemon(filters.name.trim());
      return [pokemon];
    } catch {
      throw new Error(`Pokémon "${filters.name}" not found. Please check the name or ID.`);
    }
  }

  // Otherwise, apply filters
  let pokemonList: Array<{ id: number; name: string; url: string }> = [];

  // Filter by type
  if (filters.type) {
    const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${filters.type}`);

    if (!typeResponse.ok) {
      throw new Error('Failed to fetch Pokémon by type');
    }

    const typeData: TypeResponse = await typeResponse.json();
    pokemonList = typeData.pokemon.map((p) => {
      const id = parseInt(p.pokemon.url.split('/').slice(-2, -1)[0]);
      return {
        id,
        name: p.pokemon.name,
        url: p.pokemon.url
      };
    });
  } else if (filters.generation) {
    // Filter by generation
    const [start, end] = GENERATION_RANGES[filters.generation];
    pokemonList = Array.from({ length: end - start + 1 }, (_, i) => {
      const id = start + i;
      return {
        id,
        name: '',
        url: `https://pokeapi.co/api/v2/pokemon/${id}`
      };
    });
  } else {
    // Default: get first 151 Pokémon (Generation 1)
    pokemonList = Array.from({ length: 151 }, (_, i) => {
      const id = i + 1;
      return {
        id,
        name: '',
        url: `https://pokeapi.co/api/v2/pokemon/${id}`
      };
    });
  }

  // Apply generation filter if type was also specified
  if (filters.type && filters.generation) {
    const [start, end] = GENERATION_RANGES[filters.generation];
    pokemonList = pokemonList.filter((p) => p.id >= start && p.id <= end);
  }

  // Limit results to first 50 for performance
  const limitedList = pokemonList.slice(0, 50);

  // Fetch details for all pokemon (with stats if needed)
  if (filters.minStat) {
    const minStatValue = parseInt(filters.minStat);
    const pokemonWithDetails = await Promise.all(limitedList.map((p) => fetchPokemonDetails(p.id)));

    return pokemonWithDetails
      .filter((p) => p.totalStats >= minStatValue)
      .map((p) => ({
        name: p.name,
        url: p.url,
        id: p.id,
        image: p.image
      }));
  } else {
    // Fetch basic details without stats calculation
    const pokemons = await Promise.all(
      limitedList.map(async (p) => {
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`);
          if (!response.ok) return null;

          const data: PokemonDetailResponse = await response.json();
          return {
            name: data.name,
            url: `https://pokeapi.co/api/v2/pokemon/${data.id}`,
            id: data.id,
            image: data.sprites.other['official-artwork'].front_default
          };
        } catch {
          return null;
        }
      })
    );

    return pokemons.filter((p): p is Pokemon => p !== null);
  }
};
