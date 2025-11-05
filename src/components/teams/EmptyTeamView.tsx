import { Link } from '@tanstack/react-router';

export function EmptyTeamView() {
  return (
    <div className="text-center py-16 text-gray-500">
      <p className="text-xl mb-4">Your team is empty!</p>
      <p className="mb-4">Go to the Pokémon Grid to add Pokémon to your team.</p>
      <Link
        to="/"
        className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors"
      >
        Add Pokémon
      </Link>
    </div>
  );
}
