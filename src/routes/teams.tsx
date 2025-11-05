import { useTeams } from '../contexts/TeamContext/useTeams';
import { TeamSidebar } from '../components/teams/TeamSidebar';
import { TeamDetailsView } from '../components/teams/TeamDetailsView';

export default function Teams() {
  const {
    teams,
    currentTeamId,
    currentTeam,
    createTeam,
    deleteTeam,
    renameTeam,
    removePokemonFromTeam,
    setCurrentTeamId
  } = useTeams();

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6">
      <TeamSidebar
        teams={teams}
        currentTeamId={currentTeamId}
        onCreateTeam={createTeam}
        onSelectTeam={setCurrentTeamId}
        onRenameTeam={renameTeam}
        onDeleteTeam={deleteTeam}
      />

      <div className="flex-1 bg-white rounded-lg shadow-lg p-8 overflow-y-auto">
        <TeamDetailsView team={currentTeam} onRemovePokemon={removePokemonFromTeam} />
      </div>
    </div>
  );
}
