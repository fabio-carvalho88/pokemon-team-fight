import { useState } from 'react';
import { type Pokemon } from '../../types/pokemon';
import { RemovePokemonModal } from './RemovePokemonModal';

interface PokemonTeamCardProps {
  pokemon: Pokemon;
  onRemove?: (pokemonId: number) => void;
  onAdd?: (pokemon: Pokemon) => void;
  isInTeam?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function PokemonTeamCard({
  pokemon,
  onRemove,
  onAdd,
  isInTeam = false,
  isSelected = false,
  onSelect
}: PokemonTeamCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirmRemove = () => {
    if (onRemove) {
      onRemove(pokemon.id);
    }
    setIsModalOpen(false);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAdd) {
      onAdd(pokemon);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const showAddButton = onAdd && !isInTeam;
  const showRemoveButton = onRemove && isInTeam;
  const showSelection = onSelect !== undefined;

  return (
    <>
      <div
        className={`
          bg-white rounded-lg shadow-md overflow-hidden border-2
          hover:shadow-xl transition-all
          ${isSelected ? 'border-green-500' : 'border-gray-200'}
        `}
        onClick={onSelect}
        style={{ cursor: showSelection ? 'pointer' : 'default' }}
      >
        <div className="aspect-square bg-gray-100 flex items-center justify-center p-6">
          <img src={pokemon.image} alt={pokemon.name} className="w-full h-full object-contain" />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 capitalize text-center mb-2">{pokemon.name}</h3>
          <p className="text-sm text-gray-500 text-center mb-3">#{pokemon.id.toString().padStart(3, '0')}</p>

          {showAddButton && (
            <button
              onClick={handleAddClick}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              + Add to Team
            </button>
          )}

          {showRemoveButton && (
            <button
              onClick={handleRemoveClick}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
            >
              Remove from Team
            </button>
          )}

          {isInTeam && !showRemoveButton && (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 cursor-not-allowed px-4 py-2 rounded transition-colors"
            >
              ✓ In Team
            </button>
          )}
        </div>
      </div>

      {showRemoveButton && (
        <RemovePokemonModal
          isOpen={isModalOpen}
          pokemon={pokemon}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmRemove}
        />
      )}
    </>
  );
}
