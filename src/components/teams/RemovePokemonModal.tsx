import { useEffect } from 'react';
import { type Pokemon } from '../../types/pokemon';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

interface RemovePokemonModalProps {
  isOpen: boolean;
  pokemon: Pokemon | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function RemovePokemonModal({ isOpen, pokemon, onClose, onConfirm }: RemovePokemonModalProps) {
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

  if (!isOpen || !pokemon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black opacity-80 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Remove Pokémon?</h2>
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
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <img src={pokemon.image} alt={pokemon.name} className="w-full h-full object-contain p-2" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 capitalize mb-1">{pokemon.name}</h3>
            <p className="text-gray-600">#{pokemon.id.toString().padStart(3, '0')}</p>
          </div>

          <p className="text-center text-gray-700 mb-6">
            Are you sure you want to remove <span className="font-semibold capitalize">{pokemon.name}</span> from your
            team?
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
