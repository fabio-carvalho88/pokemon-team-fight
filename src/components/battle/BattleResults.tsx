import { Link } from '@tanstack/react-router';
import type { Battle } from '../../types/battle';

interface BattleResultsProps {
  battle: Battle;
  onNewBattle?: () => void;
  onClose?: () => void;
}

export function BattleResults({ battle, onNewBattle, onClose }: BattleResultsProps) {
  const winnerTeam = battle.winnerId === battle.team1.teamId ? battle.team1 : battle.team2;
  const loserTeam = battle.winnerId === battle.team1.teamId ? battle.team2 : battle.team1;

  const duration = battle.endTime
    ? ((battle.endTime - battle.startTime) / 1000).toFixed(1)
    : 0;

  const winnerAlive = winnerTeam.pokemons.filter((p) => !p.isKnockedOut);
  const totalDamageDealt = battle.battleLog
    .filter((entry) => entry.type === 'damage' && entry.data?.damage)
    .reduce((sum, entry) => sum + (entry.data?.damage || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 animate-fadeIn">
        {/* Victory Banner */}
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 mb-2">
            BATTLE FINISHED!
          </h2>
          <div className="text-3xl font-bold text-gray-800 mt-4">
            🏆 {winnerTeam.teamName} Wins! 🏆
          </div>
        </div>

        {/* Battle Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
            <h3 className="text-lg font-bold text-green-800 mb-3">Winner</h3>
            <div className="text-2xl font-bold text-gray-800">{winnerTeam.teamName}</div>
            <div className="text-sm text-gray-600 mt-2">
              {winnerAlive.length} Pokemon remaining
            </div>
            <div className="flex gap-2 mt-3">
              {winnerAlive.map((pokemon) => (
                <div key={pokemon.pokemon.id} className="relative">
                  <img
                    src={pokemon.pokemon.image}
                    alt={pokemon.pokemon.name}
                    className="w-12 h-12 object-contain"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    ✓
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Loser</h3>
            <div className="text-2xl font-bold text-gray-600">{loserTeam.teamName}</div>
            <div className="text-sm text-gray-500 mt-2">All Pokemon fainted</div>
            <div className="flex gap-2 mt-3 opacity-50">
              {loserTeam.pokemons.slice(0, 6).map((pokemon) => (
                <img
                  key={pokemon.pokemon.id}
                  src={pokemon.pokemon.image}
                  alt={pokemon.pokemon.name}
                  className="w-12 h-12 object-contain grayscale"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Battle Statistics */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Battle Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{battle.currentTurn}</div>
              <div className="text-sm text-gray-600">Turns</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{duration}s</div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{totalDamageDealt}</div>
              <div className="text-sm text-gray-600">Total Damage</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {onNewBattle && (
            <button
              onClick={onNewBattle}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
            >
              New Battle
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Back to Battle Select
            </button>
          )}
          <Link
            to="/teams"
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
          >
            Back to Teams
          </Link>
        </div>
      </div>
    </div>
  );
}

