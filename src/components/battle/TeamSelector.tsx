import { useState } from 'react';
import { useTeams } from '../../contexts/TeamContext/useTeams';
import type { Team } from '../../types/team';

interface TeamSelectorProps {
  onTeamsSelected: (team1: Team, team2: Team) => void;
  onCancel?: () => void;
}

export function TeamSelector({ onTeamsSelected, onCancel }: TeamSelectorProps) {
  const { teams } = useTeams();
  const [selectedTeamA, setSelectedTeamA] = useState<Team | null>(null);
  const [selectedTeamB, setSelectedTeamB] = useState<Team | null>(null);

  const handleStartBattle = () => {
    if (selectedTeamA && selectedTeamB) {
      onTeamsSelected(selectedTeamA, selectedTeamB);
    }
  };

  const availableTeams = teams.filter((t) => t.pokemons.length > 0);

  const handleTeamAChange = (teamId: string) => {
    const team = availableTeams.find((t) => t.id === teamId);
    setSelectedTeamA(team || null);
    // If Team B is the same as newly selected Team A, clear Team B
    if (team && selectedTeamB?.id === team.id) {
      setSelectedTeamB(null);
    }
  };

  const handleTeamBChange = (teamId: string) => {
    const team = availableTeams.find((t) => t.id === teamId);
    setSelectedTeamB(team || null);
    // If Team A is the same as newly selected Team B, clear Team A
    if (team && selectedTeamA?.id === team.id) {
      setSelectedTeamA(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Select Battle Teams</h2>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Team A Selection */}
        <div>
          <label htmlFor="team-a" className="block text-lg font-semibold mb-2 text-blue-600">
            Team A
          </label>
          <select
            id="team-a"
            value={selectedTeamA?.id || ''}
            onChange={(e) => handleTeamAChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 bg-white cursor-pointer hover:border-blue-400 transition-colors"
          >
            <option value="">Select Team A...</option>
            {availableTeams.map((team) => (
              <option
                key={team.id}
                value={team.id}
                disabled={team.id === selectedTeamB?.id}
                className={team.id === selectedTeamB?.id ? 'text-gray-400' : ''}
              >
                {team.name} ({team.pokemons.length} Pokemon)
                {team.id === selectedTeamB?.id ? ' - Selected as Team B' : ''}
              </option>
            ))}
          </select>

          {/* Team A Preview */}
          {selectedTeamA && (
            <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="font-semibold text-gray-800 mb-2">{selectedTeamA.name}</div>
              <div className="flex gap-2 flex-wrap">
                {selectedTeamA.pokemons.slice(0, 6).map((pokemon) => (
                  <div key={pokemon.id} className="relative group">
                    <img src={pokemon.image} alt={pokemon.name} className="w-12 h-12 object-contain" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {pokemon.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center">
          <div className="h-px bg-gray-300 flex-1"></div>
          <span className="px-4 text-2xl font-bold text-gray-400">VS</span>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>

        {/* Team B Selection */}
        <div>
          <label htmlFor="team-b" className="block text-lg font-semibold mb-2 text-red-600">
            Team B
          </label>
          <select
            id="team-b"
            value={selectedTeamB?.id || ''}
            onChange={(e) => handleTeamBChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-800 bg-white cursor-pointer hover:border-red-400 transition-colors"
          >
            <option value="">Select Team B...</option>
            {availableTeams.map((team) => (
              <option
                key={team.id}
                value={team.id}
                disabled={team.id === selectedTeamA?.id}
                className={team.id === selectedTeamA?.id ? 'text-gray-400' : ''}
              >
                {team.name} ({team.pokemons.length} Pokemon)
                {team.id === selectedTeamA?.id ? ' - Selected as Team A' : ''}
              </option>
            ))}
          </select>

          {/* Team B Preview */}
          {selectedTeamB && (
            <div className="mt-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="font-semibold text-gray-800 mb-2">{selectedTeamB.name}</div>
              <div className="flex gap-2 flex-wrap">
                {selectedTeamB.pokemons.slice(0, 6).map((pokemon) => (
                  <div key={pokemon.id} className="relative group">
                    <img src={pokemon.image} alt={pokemon.name} className="w-12 h-12 object-contain" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {pokemon.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleStartBattle}
          disabled={!selectedTeamA || !selectedTeamB}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
        >
          Start Battle!
        </button>
      </div>

      {(!teams.length || teams.every((t) => t.pokemons.length === 0)) && (
        <div className="mt-6 text-center text-gray-500">
          You need at least 2 teams with Pokemon to start a battle.
          <br />
          Create teams on the Teams page first.
        </div>
      )}
    </div>
  );
}
