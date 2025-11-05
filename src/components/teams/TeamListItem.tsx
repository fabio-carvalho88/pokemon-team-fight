import { useState } from 'react';
import { type Team } from '../../types/team';

interface TeamListItemProps {
  team: Team;
  isSelected: boolean;
  onSelect: (teamId: string) => void;
  onRename: (teamId: string, newName: string) => void;
  onDelete: (teamId: string) => void;
}

export function TeamListItem({ team, isSelected, onSelect, onRename, onDelete }: TeamListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState('');

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingName(team.name);
  };

  const handleRename = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (editingName.trim()) {
      onRename(team.id, editingName.trim());
      setIsEditing(false);
      setEditingName('');
    }
  };

  const handleCancel = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsEditing(false);
    setEditingName('');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this team?')) {
      onDelete(team.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRename();
    if (e.key === 'Escape') handleCancel();
    e.stopPropagation();
  };

  return (
    <div
      className={`
        p-3 rounded-lg border-2 transition-all cursor-pointer
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}
      `}
      onClick={() => onSelect(team.id)}
    >
      {isEditing ? (
        <div className="mb-2">
          <input
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          />
          <div className="flex gap-1 mt-2">
            <button
              onClick={handleRename}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800 truncate">{team.name}</h3>
            <div className="flex gap-1">
              <button
                onClick={startEditing}
                className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                title="Rename team"
              >
                ✏️
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-100 transition-colors"
                title="Delete team"
              >
                🗑️
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{team.pokemons.length}/6</span> Pokémon
          </div>
          <div className="text-xs text-gray-500 mt-1">Created {new Date(team.createdAt).toLocaleDateString()}</div>
        </>
      )}
    </div>
  );
}
