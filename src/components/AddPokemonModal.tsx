import { useEffect, useState } from 'react';
import PokemonSearchForm, { type SearchFilters } from './PokemonSearchForm';
import { searchPokemonAdvanced } from '../services/pokemonService';
import { type Pokemon } from '../types/pokemon';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface AddPokemonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPokemon: (pokemon: Pokemon) => void;
  existingPokemonIds: number[];
}

export default function AddPokemonModal({ isOpen, onClose, onAddPokemon, existingPokemonIds }: AddPokemonModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Pokemon[]>([]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useLockBodyScroll(isOpen);

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const pokemons = await searchPokemonAdvanced(filters);

      if (pokemons.length === 0) {
        setError('No Pokémon found matching your criteria. Try adjusting your filters.');
      } else {
        setResults(pokemons);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search Pokémon. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPokemon = (pokemon: Pokemon) => {
    if (existingPokemonIds.includes(pokemon.id)) {
      alert(`${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} is already in the grid!`);
      return;
    }

    onAddPokemon(pokemon);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black opacity-80 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Add New Pokémon</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <PokemonSearchForm onSearch={handleSearch} isLoading={isLoading} />

          {/* Error Message */}
          {error && <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Results ({results.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {results.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                  >
                    <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                      <img src={pokemon.image} alt={pokemon.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <h4 className="text-center font-semibold text-gray-800 capitalize mb-1">{pokemon.name}</h4>
                    <p className="text-center text-sm text-gray-600 mb-3">#{pokemon.id.toString().padStart(3, '0')}</p>
                    <button
                      onClick={() => handleAddPokemon(pokemon)}
                      disabled={existingPokemonIds.includes(pokemon.id)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {existingPokemonIds.includes(pokemon.id) ? 'Already Added' : 'Add to Grid'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
