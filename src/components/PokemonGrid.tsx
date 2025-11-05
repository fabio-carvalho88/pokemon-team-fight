import { useState, useMemo } from 'react';
import { type Pokemon } from '../types/pokemon';
import { PokemonTeamCard } from './teams/PokemonTeamCard';
import AddPokemonCard from './AddPokemonCard';
import AddPokemonModal from './AddPokemonModal';
import { useGridColumns, useSortBy } from '../store/preferencesStore';

interface PokemonGridProps {
  pokemons: Pokemon[];
  selectedPokemons: Pokemon[];
  onPokemonSelect: (pokemon: Pokemon) => void;
  onAddToTeam?: (pokemon: Pokemon) => void;
  onRemoveFromTeam?: (pokemonId: number) => void;
  teamPokemonIds?: number[];
  onAddPokemon?: (pokemon: Pokemon) => void;
  showAddCard?: boolean;
}

export default function PokemonGrid({
  pokemons,
  selectedPokemons,
  onPokemonSelect,
  onAddToTeam,
  onRemoveFromTeam,
  teamPokemonIds = [],
  onAddPokemon,
  showAddCard = false
}: PokemonGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const gridColumns = useGridColumns();
  const sortBy = useSortBy();

  // Sort pokemons based on preference
  const sortedPokemons = useMemo(() => {
    const pokemonsCopy = [...pokemons];

    switch (sortBy) {
      case 'name':
        return pokemonsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case 'nameDesc':
        return pokemonsCopy.sort((a, b) => b.name.localeCompare(a.name));
      case 'id':
      default:
        return pokemonsCopy.sort((a, b) => a.id - b.id);
    }
  }, [pokemons, sortBy]);

  const existingPokemonIds = pokemons.map((p) => p.id);

  // Generate grid classes based on preference
  const gridClasses = useMemo(() => {
    const baseClasses = 'grid gap-6';
    const colClasses = {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
    };

    return `${baseClasses} ${colClasses[gridColumns]}`;
  }, [gridColumns]);

  return (
    <>
      <div className={gridClasses}>
        {showAddCard && <AddPokemonCard onClick={() => setIsModalOpen(true)} />}

        {sortedPokemons.map((pokemon) => {
          const isInTeam = teamPokemonIds.includes(pokemon.id);
          return (
            <PokemonTeamCard
              key={pokemon.id}
              pokemon={pokemon}
              isSelected={selectedPokemons.some((p) => p.id === pokemon.id)}
              onSelect={() => onPokemonSelect(pokemon)}
              onAdd={onAddToTeam ? () => onAddToTeam(pokemon) : undefined}
              onRemove={onRemoveFromTeam}
              isInTeam={isInTeam}
            />
          );
        })}
      </div>

      {showAddCard && onAddPokemon && (
        <AddPokemonModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddPokemon={onAddPokemon}
          existingPokemonIds={existingPokemonIds}
        />
      )}
    </>
  );
}
