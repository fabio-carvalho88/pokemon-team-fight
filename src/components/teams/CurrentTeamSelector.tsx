import { useTeams } from '../../contexts/TeamContext/useTeams';
import { Link } from '@tanstack/react-router';

export default function CurrentTeamSelector() {
  const { teams, currentTeam, setCurrentTeamId } = useTeams();

  const handleTeamChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const teamId = event.target.value;
    setCurrentTeamId(teamId || null);
  };

  if (teams.length === 0) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-gray-700">
          💡 <strong>Tip:</strong> Create a team to start building your Pokémon roster!{' '}
          <Link to="/teams" className="text-blue-600 hover:underline font-semibold">
            Go to Teams
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <label htmlFor="team-selector" className="block text-sm font-medium text-gray-700 mb-2">
            Current Team
          </label>
          <select
            id="team-selector"
            value={currentTeam?.id || ''}
            onChange={handleTeamChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-white text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.pokemons.length}/6 Pokémon)
              </option>
            ))}
          </select>
        </div>
        {currentTeam && (
          <Link
            to="/teams"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold whitespace-nowrap self-end"
          >
            View Team
          </Link>
        )}
      </div>
    </div>
  );
}

