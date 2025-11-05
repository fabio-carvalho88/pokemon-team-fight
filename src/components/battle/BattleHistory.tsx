import { useSelector, useDispatch } from 'react-redux';
import { selectFinishedBattles } from '../../store/slices/battles/battleSelectors';
import { clearBattleHistory } from '../../store/slices/battles/battlesSlice';
import { clearBattleHistory as clearLocalStorage } from '../../store/middleware/battlePersistence';
import { useState } from 'react';

export function BattleHistory() {
  const dispatch = useDispatch();
  const finishedBattles = useSelector(selectFinishedBattles);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearHistory = () => {
    dispatch(clearBattleHistory());
    clearLocalStorage();
    setShowConfirm(false);
  };

  if (finishedBattles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">📜</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Battle History</h3>
        <p className="text-gray-600">Your completed battles will appear here</p>
        <p className="text-sm text-gray-400 mt-2">History is saved automatically and persists between sessions</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Battle History</h2>
          <p className="text-sm text-gray-500">
            Showing {finishedBattles.length} completed battle{finishedBattles.length !== 1 ? 's' : ''} •
            <span className="text-green-600 ml-1">✓ Saved to browser storage</span>
          </p>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
        >
          Clear History
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Clear Battle History?</h3>
            <p className="text-gray-600 mb-6">This will permanently delete all battle records. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {finishedBattles.slice(0, 10).map((battle) => {
          const winner = battle.winnerId === battle.team1.teamId ? battle.team1 : battle.team2;
          const loser = battle.winnerId === battle.team1.teamId ? battle.team2 : battle.team1;
          const duration = battle.endTime
            ? ((battle.endTime - battle.startTime) / 1000).toFixed(0)
            : 0;

          return (
            <div
              key={battle.id}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 font-bold">🏆 {winner.teamName}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="text-gray-600">{loser.teamName}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {battle.currentTurn} turns • {duration}s • {new Date(battle.startTime).toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {winner.pokemons.filter((p) => !p.isKnockedOut).length} Pokemon remaining
                  </div>
                  <div className="flex gap-1 mt-2 justify-end">
                    {winner.pokemons.filter((p) => !p.isKnockedOut).slice(0, 3).map((p) => (
                      <img
                        key={p.pokemon.id}
                        src={p.pokemon.image}
                        alt={p.pokemon.name}
                        className="w-8 h-8 object-contain"
                        title={p.pokemon.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

