import type { BattlePokemon } from '../../types/battle';
import type { HPBarAnimation } from '../../types/animation';

interface PokemonSpriteProps {
  pokemon: BattlePokemon;
  side: 'player' | 'opponent';
  hpBar?: HPBarAnimation;
  isActive?: boolean;
}

export function PokemonSprite({ pokemon, side, hpBar, isActive = true }: PokemonSpriteProps) {
  const isPlayer = side === 'player';

  // Use actual current HP from pokemon state
  const currentHp = pokemon.currentHp;
  const maxHp = pokemon.maxHp;
  const hpPercent = (currentHp / maxHp) * 100;

  const getHPColor = () => {
    if (hpPercent > 50) return 'bg-green-500';
    if (hpPercent > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div
      className={`relative transition-all duration-300 ${
        isActive ? 'scale-100 opacity-100' : 'scale-75 opacity-50'
      } ${pokemon.isKnockedOut ? 'grayscale opacity-30' : ''}`}
    >
      {/* Pokemon Image */}
      <div className={`relative ${isPlayer ? 'ml-auto' : 'mr-auto'}`}>
        <img
          src={pokemon.pokemon.image}
          alt={pokemon.pokemon.name}
          className={`w-48 h-48 object-contain drop-shadow-2xl ${
            !pokemon.isKnockedOut ? 'animate-bounce-slow' : ''
          }`}
          style={{
            imageRendering: 'pixelated',
          }}
        />

        {/* Status Effects */}
        {pokemon.status && (
          <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
            {pokemon.status}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div
        className={`bg-white rounded-lg shadow-lg p-4 mt-4 ${
          isPlayer ? 'border-l-4 border-blue-500' : 'border-r-4 border-red-500'
        }`}
      >
        {/* Name */}
        <div className="font-bold text-gray-800 text-lg mb-2">
          {pokemon.pokemon.name.charAt(0).toUpperCase() + pokemon.pokemon.name.slice(1)}
        </div>

        {/* HP Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>HP</span>
            <span>
              {currentHp}/{maxHp}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getHPColor()}`}
              style={{
                width: `${Math.max(0, Math.min(100, hpPercent))}%`,
              }}
            />
          </div>
          {/* Visual HP percentage */}
          <div className="text-xs text-gray-500 text-center mt-1">
            {Math.round(hpPercent)}%
          </div>
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div className="text-center">
            <div className="font-semibold text-red-600">{pokemon.stats.attack}</div>
            <div>ATK</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">{pokemon.stats.defense}</div>
            <div>DEF</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-yellow-600">{pokemon.stats.speed}</div>
            <div>SPD</div>
          </div>
        </div>
      </div>
    </div>
  );
}

