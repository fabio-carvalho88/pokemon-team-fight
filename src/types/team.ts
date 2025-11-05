import { type Pokemon } from './pokemon';

export interface Team {
  id: string;
  name: string;
  pokemons: Pokemon[];
  createdAt: number;
}

export interface TeamContextType {
  teams: Team[];
  currentTeamId: string | null;
  currentTeam: Team | null;
  createTeam: (name: string) => void;
  deleteTeam: (teamId: string) => void;
  renameTeam: (teamId: string, newName: string) => void;
  addPokemonToTeam: (teamId: string, pokemon: Pokemon) => void;
  removePokemonFromTeam: (teamId: string, pokemonId: number) => void;
  setCurrentTeamId: (teamId: string | null) => void;
}
