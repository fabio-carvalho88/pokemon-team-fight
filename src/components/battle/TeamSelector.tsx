import { useState } from 'react';
import { useTeams } from '../../contexts/TeamContext/useTeams';
import type { Team } from '../../types/team';

interface TeamSelectorProps {
  onTeamsSelected: (team1: Team, team2: Team) => void;
  onCancel?: () => void;
}

export function TeamSelector({ onTeamsSelected, onCancel }: TeamSelectorProps) {
  const { teams } = useTeams();
  const [selectedTeam1, setSelectedTeam1] = useState<Team | null>(null);
  const [selectedTeam2, setSelectedTeam2] = useState<Team | null>(null);

  const handleStartBattle = () => {
    if (selectedTeam1 && selectedTeam2) {
      onTeamsSelected(selectedTeam1, selectedTeam2);
    }
  };

  const availableTeamsForSecondSelection = teams.filter(
    (team) => team.id !== selectedTeam1?.id && team.pokemons.length > 0
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Select Battle Teams</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Team 1 Selection */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-blue-600">Team 1</h3>
          <div className="space-y-3">
            {teams.filter(t => t.pokemons.length > 0).map((team) => (
              <button
                key={team.id}
                onClick={() => setSelectedTeam1(team)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedTeam1?.id === team.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold">{team.name}</div>
                  <div className="text-sm text-gray-600">
                    {team.pokemons.length} Pokemon
                  </div>
                  <div className="flex gap-1 mt-2">
                    {team.pokemons.slice(0, 6).map((pokemon) => (
                      <img
                        key={pokemon.id}
                        src={pokemon.image}
                        alt={pokemon.name}
                        className="w-8 h-8 object-contain"
                      />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Team 2 Selection */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-red-600">Team 2</h3>
          {!selectedTeam1 ? (
            <div className="text-gray-400 text-center py-8">
              Select Team 1 first
            </div>
          ) : (
            <div className="space-y-3">
              {availableTeamsForSecondSelection.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam2(team)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedTeam2?.id === team.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold">{team.name}</div>
                    <div className="text-sm text-gray-600">
                      {team.pokemons.length} Pokemon
                    </div>
                    <div className="flex gap-1 mt-2">
                      {team.pokemons.slice(0, 6).map((pokemon) => (
                        <img
                          key={pokemon.id}
                          src={pokemon.image}
                          alt={pokemon.name}
                          className="w-8 h-8 object-contain"
                        />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
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
          disabled={!selectedTeam1 || !selectedTeam2}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
        >
          Start Battle!
        </button>
      </div>

      {(!teams.length || teams.every(t => t.pokemons.length === 0)) && (
        <div className="mt-6 text-center text-gray-500">
          You need at least 2 teams with Pokemon to start a battle.
          <br />
          Create teams on the Teams page first.
        </div>
      )}
    </div>
  );
}

