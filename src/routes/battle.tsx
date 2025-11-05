import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useGetPokemonByIdsQuery, useGetMovesByNamesQuery } from '../store/api/pokemonApi';
import { useBattleActions } from '../hooks/battle/useBattleActions';
import { useBattle } from '../hooks/battle/useBattle';
import { TeamSelector } from '../components/battle/TeamSelector';
import { BattleArena } from '../components/battle/BattleArena';
import { BattleHistory } from '../components/battle/BattleHistory';
import type { Team } from '../types/team';

export default function Battle() {
  const [selectedTeams, setSelectedTeams] = useState<{ team1: Team; team2: Team } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { createBattle } = useBattleActions();
  const { isActive } = useBattle();

  // Fetch Pokemon data for selected teams
  const team1PokemonIds = selectedTeams?.team1.pokemons.map((p) => p.id) || [];
  const team2PokemonIds = selectedTeams?.team2.pokemons.map((p) => p.id) || [];

  const { data: team1Pokemon, isLoading: isLoadingTeam1 } = useGetPokemonByIdsQuery(
    team1PokemonIds,
    {
      skip: !selectedTeams || team1PokemonIds.length === 0,
    }
  );

  const { data: team2Pokemon, isLoading: isLoadingTeam2 } = useGetPokemonByIdsQuery(
    team2PokemonIds,
    {
      skip: !selectedTeams || team2PokemonIds.length === 0,
    }
  );

  // Fetch moves for all Pokemon
  const team1MoveNames =
    team1Pokemon?.flatMap((p) => p.moves.slice(0, 4).map((m) => m.move.name)) || [];
  const team2MoveNames =
    team2Pokemon?.flatMap((p) => p.moves.slice(0, 4).map((m) => m.move.name)) || [];

  const { data: team1Moves, isLoading: isLoadingTeam1Moves } = useGetMovesByNamesQuery(
    team1MoveNames,
    {
      skip: !team1Pokemon || team1MoveNames.length === 0,
    }
  );

  const { data: team2Moves, isLoading: isLoadingTeam2Moves } = useGetMovesByNamesQuery(
    team2MoveNames,
    {
      skip: !team2Pokemon || team2MoveNames.length === 0,
    }
  );

  const handleTeamsSelected = async (team1: Team, team2: Team) => {
    setSelectedTeams({ team1, team2 });
    setIsLoading(true);
  };

  // Auto-start battle when all data is loaded
  useEffect(() => {
    const allDataLoaded =
      selectedTeams &&
      team1Pokemon &&
      team2Pokemon &&
      team1Moves &&
      team2Moves &&
      !isLoadingTeam1 &&
      !isLoadingTeam2 &&
      !isLoadingTeam1Moves &&
      !isLoadingTeam2Moves;

    if (isLoading && allDataLoaded && !isActive) {
      // Group moves by Pokemon (4 moves per Pokemon)
      const team1MovesGrouped: typeof team1Moves[] = [];
      const team2MovesGrouped: typeof team2Moves[] = [];

      for (let i = 0; i < team1Pokemon.length; i++) {
        team1MovesGrouped.push(team1Moves.slice(i * 4, (i + 1) * 4));
      }
      for (let i = 0; i < team2Pokemon.length; i++) {
        team2MovesGrouped.push(team2Moves.slice(i * 4, (i + 1) * 4));
      }

      createBattle(
        selectedTeams.team1,
        selectedTeams.team2,
        team1Pokemon,
        team2Pokemon,
        team1MovesGrouped,
        team2MovesGrouped,
        true // isRealTime
      )
        .then(() => {
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to create battle:', error);
          setIsLoading(false);
          setSelectedTeams(null);
        });
    }
  }, [
    selectedTeams,
    team1Pokemon,
    team2Pokemon,
    team1Moves,
    team2Moves,
    isLoadingTeam1,
    isLoadingTeam2,
    isLoadingTeam1Moves,
    isLoadingTeam2Moves,
    isLoading,
    isActive,
    createBattle,
  ]);

  const handleNewBattle = () => {
    setSelectedTeams(null);
    setIsLoading(false);
  };

  const handleBattleEnd = () => {
    // Return to team selection
    setSelectedTeams(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Battle Arena</h1>
              <p className="text-gray-600">Challenge your teams in epic Pokemon battles!</p>
            </div>
            <Link
              to="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Content */}
        {!isActive && !isLoading ? (
          <>
            <TeamSelector onTeamsSelected={handleTeamsSelected} />

            {/* Battle History */}
            <div className="mt-8">
              <BattleHistory />
            </div>
          </>
        ) : isLoading ? (
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Preparing Battle...
              </h3>
              <p className="text-gray-600">Loading Pokemon data and moves...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ minHeight: '800px' }}>
            <BattleArena
              onNewBattle={handleNewBattle}
              onBattleEnd={handleBattleEnd}
            />
          </div>
        )}

        {/* Instructions */}
        {!isActive && !isLoading && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-3">How to Battle</h3>
            <ul className="space-y-2 text-blue-800">
              <li>• Select two different teams with Pokemon</li>
              <li>• Battle begins automatically once teams are selected</li>
              <li>• Choose moves to attack or switch Pokemon strategically</li>
              <li>• Real-time battles feature cooldowns on moves</li>
              <li>• Win by knocking out all opponent Pokemon!</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

