import { type Pokemon } from '../types/pokemon';

interface PokemonFightComparisonProps {
  pokemon1: Pokemon;
  pokemon2: Pokemon;
}

export default function PokemonFightComparison({ pokemon1, pokemon2 }: PokemonFightComparisonProps) {
  const handleSimulateFight = () => {
    console.log(`Fight between ${pokemon1.name} and ${pokemon2.name}`);
  };

  return (
    <div className="bg-gradient-to-r from-red-100 via-purple-100 to-blue-100 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
        <span className="capitalize">{pokemon1.name}</span>
        <span className="mx-4 text-red-600">VS</span>
        <span className="capitalize">{pokemon2.name}</span>
      </h2>
      <div className="flex justify-center">
        <button
          onClick={handleSimulateFight}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg
                     transition-all duration-200 transform hover:scale-105 shadow-md"
        >
          Simulate Fight
        </button>
      </div>
    </div>
  );
}
