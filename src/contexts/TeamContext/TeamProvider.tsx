import { type ReactNode, useState, useEffect, useCallback } from 'react';
import { type Team, type TeamContextType } from '../../types/team';
import { type Pokemon } from '../../types/pokemon';
import { TeamContext } from './teamContext';

const TEAMS_STORAGE_KEY = 'pokemon-teams';
const CURRENT_TEAM_STORAGE_KEY = 'current-team-id';

interface TeamProviderProps {
  children: ReactNode;
}

export function TeamProvider({ children }: TeamProviderProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);

  // Load teams from localStorage on mount
  useEffect(() => {
    const storedTeams = localStorage.getItem(TEAMS_STORAGE_KEY);
    const storedCurrentTeamId = localStorage.getItem(CURRENT_TEAM_STORAGE_KEY);

    if (storedTeams) {
      try {
        const parsedTeams = JSON.parse(storedTeams) as Team[];
        setTeams(parsedTeams);

        if (storedCurrentTeamId && parsedTeams.some((t) => t.id === storedCurrentTeamId)) {
          setCurrentTeamId(storedCurrentTeamId);
        } else if (parsedTeams.length > 0) {
          setCurrentTeamId(parsedTeams[0].id);
        }
      } catch (error) {
        console.error('Failed to parse stored teams:', error);
        localStorage.removeItem(TEAMS_STORAGE_KEY);
      }
    }
  }, []);

  // Persist teams to localStorage whenever they change
  useEffect(() => {
    if (teams.length > 0) {
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
    } else {
      localStorage.removeItem(TEAMS_STORAGE_KEY);
    }
  }, [teams]);

  // Persist current team ID to localStorage
  useEffect(() => {
    if (currentTeamId) {
      localStorage.setItem(CURRENT_TEAM_STORAGE_KEY, currentTeamId);
    } else {
      localStorage.removeItem(CURRENT_TEAM_STORAGE_KEY);
    }
  }, [currentTeamId]);

  const createTeam = useCallback((name: string) => {
    const newTeam: Team = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      pokemons: [],
      createdAt: Date.now()
    };
    setTeams((prev) => [...prev, newTeam]);
    setCurrentTeamId(newTeam.id);
  }, []);

  const deleteTeam = useCallback(
    (teamId: string) => {
      setTeams((prev) => {
        const filtered = prev.filter((t) => t.id !== teamId);

        // If deleting the current team, switch to another team or null
        if (teamId === currentTeamId) {
          if (filtered.length > 0) {
            setCurrentTeamId(filtered[0].id);
          } else {
            setCurrentTeamId(null);
          }
        }

        return filtered;
      });
    },
    [currentTeamId]
  );

  const renameTeam = useCallback((teamId: string, newName: string) => {
    setTeams((prev) => prev.map((team) => (team.id === teamId ? { ...team, name: newName } : team)));
  }, []);

  const addPokemonToTeam = useCallback((teamId: string, pokemon: Pokemon) => {
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id !== teamId) return team;

        // Check if Pokemon already in team
        if (team.pokemons.some((p) => p.id === pokemon.id)) {
          return team;
        }

        // Check team size limit
        if (team.pokemons.length >= 6) {
          alert('Team is full! Maximum 6 Pokemon per team.');
          return team;
        }

        return {
          ...team,
          pokemons: [...team.pokemons, pokemon]
        };
      })
    );
  }, []);

  const removePokemonFromTeam = useCallback((teamId: string, pokemonId: number) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId ? { ...team, pokemons: team.pokemons.filter((p) => p.id !== pokemonId) } : team
      )
    );
  }, []);

  const currentTeam = teams.find((t) => t.id === currentTeamId) ?? null;

  const value: TeamContextType = {
    teams,
    currentTeamId,
    currentTeam,
    createTeam,
    deleteTeam,
    renameTeam,
    addPokemonToTeam,
    removePokemonFromTeam,
    setCurrentTeamId
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}
