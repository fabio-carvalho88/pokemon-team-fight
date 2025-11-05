import { useState } from 'react';
import { usePokemonSearch } from '../hooks/queries/usePokemonSearch';
import { type Pokemon } from '../types/pokemon';

interface PokemonSearchProps {
  onAddPokemon: (pokemon: Pokemon) => void;
}

export default function PokemonSearch({ onAddPokemon }: PokemonSearchProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: pokemon, isLoading, error } = usePokemonSearch(searchTerm);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchTerm(searchInput.trim());
    }
  };

  const handleAddPokemon = () => {
    if (pokemon) {
      onAddPokemon(pokemon);
      setSearchInput('');
      setSearchTerm('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Search Pokémon</h2>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Enter Pokémon name or ID..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!searchInput.trim() || isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Pokémon not found. Please try another name or ID.
        </div>
      )}

      {pokemon && (
        <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-4 bg-gray-50">
          <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center p-2">
            <img src={pokemon.image} alt={pokemon.name} className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 capitalize">{pokemon.name}</h3>
            <p className="text-gray-600">#{pokemon.id.toString().padStart(3, '0')}</p>
          </div>
          <button
            onClick={handleAddPokemon}
            className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            Add to Grid
          </button>
        </div>
      )}
    </div>
  );
}
