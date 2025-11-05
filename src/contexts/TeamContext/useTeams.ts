import { useContext } from 'react';
import { TeamContext } from '.';

export function useTeams() {
  const context = useContext(TeamContext);

  if (!context) {
    throw new Error('useTeams must be used within a TeamProvider');
  }

  return context;
}
