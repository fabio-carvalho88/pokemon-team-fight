import { useState } from 'react';

export interface SearchFilters {
  name: string;
  type: string;
  generation: string;
  minStat: string;
}

interface PokemonSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
}

const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy'
];

const GENERATIONS = [
  { value: '1', label: 'Generation I (1-151)' },
  { value: '2', label: 'Generation II (152-251)' },
  { value: '3', label: 'Generation III (252-386)' },
  { value: '4', label: 'Generation IV (387-493)' },
  { value: '5', label: 'Generation V (494-649)' },
  { value: '6', label: 'Generation VI (650-721)' },
  { value: '7', label: 'Generation VII (722-809)' },
  { value: '8', label: 'Generation VIII (810-905)' },
  { value: '9', label: 'Generation IX (906+)' }
];

export default function PokemonSearchForm({ onSearch, isLoading }: PokemonSearchFormProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    type: '',
    generation: '',
    minStat: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      name: '',
      type: '',
      generation: '',
      minStat: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Search - Primary */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
          Search by Name or ID
        </label>
        <input
          id="name"
          type="text"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          placeholder="e.g., pikachu, charizard, or 25"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">If name is provided, other filters will be ignored</p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm font-semibold text-gray-700 mb-4">Or filter by characteristics:</p>

        {/* Type Filter */}
        <div className="mb-4">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            id="type"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
            disabled={!!filters.name}
          >
            <option value="">All types</option>
            {POKEMON_TYPES.map((type) => (
              <option key={type} value={type} className="capitalize">
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Generation Filter */}
        <div className="mb-4">
          <label htmlFor="generation" className="block text-sm font-medium text-gray-700 mb-2">
            Generation
          </label>
          <select
            id="generation"
            value={filters.generation}
            onChange={(e) => setFilters({ ...filters, generation: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!!filters.name}
          >
            <option value="">All generations</option>
            {GENERATIONS.map((gen) => (
              <option key={gen.value} value={gen.value}>
                {gen.label}
              </option>
            ))}
          </select>
        </div>

        {/* Minimum Base Stat Total Filter */}
        <div className="mb-4">
          <label htmlFor="minStat" className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Base Stat Total
          </label>
          <input
            id="minStat"
            type="number"
            min="0"
            max="800"
            value={filters.minStat}
            onChange={(e) => setFilters({ ...filters, minStat: e.target.value })}
            placeholder="e.g., 500"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!!filters.name}
          />
          <p className="text-xs text-gray-500 mt-1">
            Filter by total base stats (HP + Attack + Defense + Sp. Atk + Sp. Def + Speed)
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading || (!filters.name && !filters.type && !filters.generation && !filters.minStat)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
