import { useEffect, useState } from 'react';
import type { Pokemon } from '../types/pokemon';

const ADDED_POKEMON_STORAGE_KEY = 'user-added-pokemons';

export const useAddedPokemons = () => {
  const [addedPokemons, setAddedPokemons] = useState<Pokemon[]>([]);

  // Load user-added Pokemon from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(ADDED_POKEMON_STORAGE_KEY);
    if (stored) {
      try {
        const parsedData = JSON.parse(stored) as Pokemon[];
        setAddedPokemons(parsedData);
      } catch (error) {
        console.error('Failed to parse stored added Pokemon data:', error);
        localStorage.removeItem(ADDED_POKEMON_STORAGE_KEY);
      }
    }
  }, []);

  // persist user-added Pokemon to localStorage
  useEffect(() => {
    if (addedPokemons.length > 0) {
      localStorage.setItem(ADDED_POKEMON_STORAGE_KEY, JSON.stringify(addedPokemons));
    }
  }, [addedPokemons]);

  return { addedPokemons, setAddedPokemons };
};
