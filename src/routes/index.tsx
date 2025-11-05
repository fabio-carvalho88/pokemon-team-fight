import { useState, useMemo, useEffect } from 'react';
import PokemonGrid from '../components/PokemonGrid';
import PokemonFightComparison from '../components/PokemonFightComparison';
import CurrentTeamSelector from '../components/teams/CurrentTeamSelector';
import { usePokemon } from '../hooks/queries/usePokemon';
import { useTeams } from '../contexts/TeamContext/useTeams';
import { type Pokemon } from '../types/pokemon';
import { Link } from '@tanstack/react-router';
import { useAddedPokemons } from '../hooks/useAddedPokemons';
import { useFilterByType } from '../store/preferencesStore';
import { searchPokemonAdvanced } from '../services/pokemonService';

export default function Index() {
  const [selectedPokemons, setSelectedPokemons] = useState<Pokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[] | null>(null);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const { addedPokemons, setAddedPokemons } = useAddedPokemons();
  const { currentTeam, addPokemonToTeam, removePokemonFromTeam } = useTeams();
  const { data: pokemons, isLoading, error } = usePokemon();
  const filterByType = useFilterByType();

  // Fetch pokemons by type when filter changes
  useEffect(() => {
    if (filterByType) {
      setIsFilterLoading(true);
      searchPokemonAdvanced({
        name: '',
        type: filterByType,
        generation: '',
        minStat: ''
      })
        .then((filtered) => {
          setFilteredPokemons(filtered);
        })
        .catch((err) => {
          console.error('Error filtering by type:', err);
          setFilteredPokemons([]);
        })
        .finally(() => {
          setIsFilterLoading(false);
        });
    } else {
      setFilteredPokemons(null);
    }
  }, [filterByType]);

  // combine API pokemons with user-added ones, and use filtered pokemons if type filter is active
  const allPokemons = useMemo(() => {
    if (filteredPokemons !== null) {
      // When filtering by type, merge filtered results with added pokemons
      return [...filteredPokemons, ...addedPokemons];
    }
    return [...(pokemons ?? []), ...addedPokemons];
  }, [pokemons, addedPokemons, filteredPokemons]);

  const handlePokemonSelect = (pokemon: Pokemon) => {
    setSelectedPokemons((prev) => {
      // Check if pokemon is already selected
      if (prev.some((p) => p.id === pokemon.id)) {
        return prev.filter((p) => p.id !== pokemon.id);
      }
      // Only allow 2 selections
      if (prev.length >= 2) return prev;

      return [...prev, pokemon];
    });
  };

  const handleAddPokemon = (pokemon: Pokemon) => {
    // check if pokemon is not already in the grid
    if (!allPokemons.some((p) => p.id === pokemon.id)) {
      setAddedPokemons((prev) => [...prev, pokemon]);
    } else {
      alert(`${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} is already in the grid!`);
    }
  };

  const handleAddToTeam = (pokemon: Pokemon) => {
    if (!currentTeam) {
      alert('Please create a team first! Go to the Teams page to create one.');
      return;
    }

    if (currentTeam.pokemons.some((p) => p.id === pokemon.id)) {
      alert(`${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} is already in the team!`);
      return;
    }

    if (currentTeam.pokemons.length >= 6) {
      alert('Team is full! Maximum 6 Pokémon per team.');
      return;
    }

    addPokemonToTeam(currentTeam.id, pokemon);
  };

  const handleRemoveFromTeam = (pokemonId: number) => {
    if (!currentTeam) {
      return;
    }
    removePokemonFromTeam(currentTeam.id, pokemonId);
  };

  const teamPokemonIds = currentTeam?.pokemons.map((p) => p.id) ?? [];

  if (isLoading || error || isFilterLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {(isLoading || isFilterLoading) && (
          <div className="text-2xl text-gray-600">
            Loading Pokémon...
            {isFilterLoading && filterByType && (
              <span className="block text-sm mt-2">Filtering by {filterByType} type</span>
            )}
          </div>
        )}
        {error && <div className="text-2xl text-red-600">Error loading Pokémon: {error.message}</div>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Pokémon Selector</h1>
        <div className="flex gap-3">
          <Link
            to="/battle"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ⚔️ Battle Arena
          </Link>
          <Link
            to="/teams"
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            My Teams →
          </Link>
        </div>
      </div>

      <CurrentTeamSelector />

      {filterByType && (
        <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <p className="text-blue-800 font-medium">
            🔍 Filtering by <span className="capitalize font-bold">{filterByType}</span> type
            <span className="text-sm ml-2">({allPokemons.length} Pokémon found)</span>
          </p>
        </div>
      )}

      <p className="text-center text-gray-600 mb-8">Select up to 2 Pokémon ({selectedPokemons.length}/2)</p>

      {selectedPokemons.length === 2 && (
        <PokemonFightComparison pokemon1={selectedPokemons[0]} pokemon2={selectedPokemons[1]} />
      )}

      <PokemonGrid
        pokemons={allPokemons}
        selectedPokemons={selectedPokemons}
        onPokemonSelect={handlePokemonSelect}
        onAddToTeam={handleAddToTeam}
        onRemoveFromTeam={handleRemoveFromTeam}
        teamPokemonIds={teamPokemonIds}
        onAddPokemon={handleAddPokemon}
        showAddCard={true}
      />
    </div>
  );
}
