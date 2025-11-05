import { useState } from 'react';

interface CreateTeamFormProps {
  onCreateTeam: (name: string) => void;
  onCancel: () => void;
}

export function CreateTeamForm({ onCreateTeam, onCancel }: CreateTeamFormProps) {
  const [teamName, setTeamName] = useState('');

  const handleSubmit = () => {
    if (teamName.trim()) {
      onCreateTeam(teamName.trim());
      setTeamName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') {
      onCancel();
      setTeamName('');
    }
  };

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <input
        type="text"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        placeholder="Team name..."
        className="w-full px-3 py-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
        onKeyDown={handleKeyDown}
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Create
        </button>
        <button
          onClick={() => {
            onCancel();
            setTeamName('');
          }}
          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
