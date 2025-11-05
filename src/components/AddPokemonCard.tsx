interface AddPokemonCardProps {
  onClick: () => void;
}

export default function AddPokemonCard({ onClick }: AddPokemonCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400 p-6 flex flex-col items-center justify-center min-h-[320px] group"
    >
      <div className="w-20 h-20 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center mb-4 transition-colors duration-300">
        <svg
          className="w-10 h-10 text-blue-500 group-hover:text-blue-600 transition-colors duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
      <p className="text-gray-600 group-hover:text-gray-800 font-semibold text-center transition-colors duration-300">
        Click to add a new Pokémon
      </p>
    </div>
  );
}

