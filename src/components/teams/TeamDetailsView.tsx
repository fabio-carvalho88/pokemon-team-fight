import { Link } from '@tanstack/react-router';
import { type Team } from '../../types/team';
import { PokemonTeamCard } from './PokemonTeamCard';
import { EmptyTeamView } from './EmptyTeamView';

interface TeamDetailsViewProps {
  team: Team | null;
  onRemovePokemon: (teamId: string, pokemonId: number) => void;
}

export function TeamDetailsView({ team, onRemovePokemon }: TeamDetailsViewProps) {
  if (!team) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-xl mb-4">No team selected</p>
          <p>Create a team to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{team.name}</h1>
        <p className="text-gray-600">{team.pokemons.length} / 6 Pokémon in team</p>
        <Link
          to="/"
          className="inline-block mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          ← Back to Pokémon Grid
        </Link>
      </div>

      {team.pokemons.length === 0 ? (
        <EmptyTeamView />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.pokemons.map((pokemon) => (
            <PokemonTeamCard
              key={pokemon.id}
              pokemon={pokemon}
              onRemove={(pokemonId) => onRemovePokemon(team.id, pokemonId)}
              isInTeam={true}
            />
          ))}
        </div>
      )}
    </>
  );
}
