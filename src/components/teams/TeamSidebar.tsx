import { useState } from 'react';
import { type Team } from '../../types/team';
import { CreateTeamForm } from './CreateTeamForm';
import { TeamListItem } from './TeamListItem';

interface TeamSidebarProps {
  teams: Team[];
  currentTeamId: string | null;
  onCreateTeam: (name: string) => void;
  onSelectTeam: (teamId: string) => void;
  onRenameTeam: (teamId: string, newName: string) => void;
  onDeleteTeam: (teamId: string) => void;
}

export function TeamSidebar({
  teams,
  currentTeamId,
  onCreateTeam,
  onSelectTeam,
  onRenameTeam,
  onDeleteTeam
}: TeamSidebarProps) {
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  const handleCreateTeam = (name: string) => {
    onCreateTeam(name);
    setIsCreatingTeam(false);
  };

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">My Teams</h2>
          <button
            onClick={() => setIsCreatingTeam(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            title="Create new team"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {isCreatingTeam && <CreateTeamForm onCreateTeam={handleCreateTeam} onCancel={() => setIsCreatingTeam(false)} />}
      </div>

      <div className="space-y-2">
        {teams.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">No teams yet!</p>
            <p className="text-sm">Click the + button to create your first team.</p>
          </div>
        ) : (
          teams.map((team) => (
            <TeamListItem
              key={team.id}
              team={team}
              isSelected={team.id === currentTeamId}
              onSelect={onSelectTeam}
              onRename={onRenameTeam}
              onDelete={onDeleteTeam}
            />
          ))
        )}
      </div>
    </div>
  );
}
