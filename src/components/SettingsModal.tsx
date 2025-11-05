import { usePreferencesStore, type GridColumns, type PokemonType } from '../store/preferencesStore';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POKEMON_TYPES: PokemonType[] = [
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

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    gridColumns,
    sortBy,
    displayOptions,
    filterByType,
    setGridColumns,
    setSortPreference,
    toggleDisplayOption,
    setFilterByType,
    resetPreferences
  } = usePreferencesStore();

  // Prevent body scroll when modal is open
  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black opacity-50 transition-opacity" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Modal Content */}
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-linear-to-r from-blue-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">⚙️ Settings</h3>
              <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors text-2xl">
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Grid Layout Settings */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">📐 Grid Columns</h4>
              <div className="flex gap-2">
                {([2, 3, 4, 5, 6] as GridColumns[]).map((cols) => (
                  <button
                    key={cols}
                    onClick={() => setGridColumns(cols)}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      gridColumns === cols
                        ? 'bg-purple-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cols}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Settings */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">🔢 Sort By</h4>
              <div className="flex gap-3">
                <button
                  onClick={() => setSortPreference('id')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    sortBy === 'id'
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ID (Default)
                </button>
                <button
                  onClick={() => setSortPreference('name')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    sortBy === 'name'
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Name (A-Z)
                </button>
                <button
                  onClick={() => setSortPreference('nameDesc')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    sortBy === 'nameDesc'
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Name (Z-A)
                </button>
              </div>
            </div>

            {/* Display Options */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">👁️ Display Options</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={displayOptions.showStats}
                    onChange={() => toggleDisplayOption('showStats')}
                    className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-medium">Show Stats</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={displayOptions.showTypes}
                    onChange={() => toggleDisplayOption('showTypes')}
                    className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-medium">Show Types</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={displayOptions.compactView}
                    onChange={() => toggleDisplayOption('compactView')}
                    className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-medium">Compact View</span>
                </label>
              </div>
            </div>

            {/* Filter by Type */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">🔍 Filter by Type</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                <button
                  onClick={() => setFilterByType(null)}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    filterByType === null
                      ? 'bg-gray-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {POKEMON_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterByType(type)}
                    className={`px-3 py-2 rounded-lg font-medium text-sm capitalize transition-all ${
                      filterByType === type
                        ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between sticky bottom-0">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all preferences to default?')) {
                  resetPreferences();
                }
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
