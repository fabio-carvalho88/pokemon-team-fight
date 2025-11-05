import { useState } from 'react';
import type { BattlePokemon, Move } from '../../types/battle';

interface BattleControlsProps {
  activePokemon: BattlePokemon;
  teamPokemons: BattlePokemon[];
  isRealTime: boolean;
  canPerformActions: boolean;
  onAttack: (moveIndex: number) => void;
  onSwitch: (pokemonIndex: number) => void;
  isPlayerTurn?: boolean;
}

export function BattleControls({
  activePokemon,
  teamPokemons,
  isRealTime,
  canPerformActions,
  onAttack,
  onSwitch,
  isPlayerTurn = true,
}: BattleControlsProps) {
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  const getMoveButtonStyle = (move: Move, index: number) => {
    const isDisabled = move.currentPp <= 0 || (isRealTime && move.currentCooldown > 0);
    const baseStyle = 'p-4 rounded-lg transition-all font-semibold';

    if (isDisabled) {
      return `${baseStyle} bg-gray-200 text-gray-400 cursor-not-allowed`;
    }

    const colors = [
      'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
      'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
      'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
      'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    ];

    return `${baseStyle} ${colors[index % 4]} text-white shadow-lg`;
  };

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      normal: 'bg-gray-400',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      electric: 'bg-yellow-400',
      grass: 'bg-green-500',
      ice: 'bg-cyan-300',
      fighting: 'bg-orange-600',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-400',
      psychic: 'bg-pink-500',
      bug: 'bg-lime-500',
      rock: 'bg-yellow-700',
      ghost: 'bg-purple-700',
      dragon: 'bg-indigo-600',
      dark: 'bg-gray-700',
      steel: 'bg-gray-500',
      fairy: 'bg-pink-300',
    };
    return typeColors[type] || 'bg-gray-400';
  };

  const availablePokemons = teamPokemons.filter((p) => !p.isKnockedOut && p !== activePokemon);

  if (!isPlayerTurn) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500 py-8">
          <div className="animate-pulse text-2xl mb-2">⏳</div>
          <div>Waiting for opponent...</div>
        </div>
      </div>
    );
  }

  if (!canPerformActions) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500 py-8">
          <div className="animate-pulse text-2xl mb-2">
            {activePokemon.isKnockedOut ? '💀' : '⏳'}
          </div>
          <div>
            {activePokemon.isKnockedOut
              ? 'Pokemon fainted! Select a new Pokemon...'
              : 'Please wait...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {!showSwitchMenu ? (
        <>
          {/* Active Pokemon Info */}
          <div className="mb-6 pb-4 border-b">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {activePokemon.pokemon.name.charAt(0).toUpperCase() +
                activePokemon.pokemon.name.slice(1)}
            </h3>
            <div className="flex gap-2 items-center">
              <span className="text-sm font-semibold">Types:</span>
              {activePokemon.types.map((type) => (
                <span
                  key={type.slot}
                  className={`text-xs px-2 py-1 rounded text-white ${getTypeColor(
                    type.type.name
                  )}`}
                >
                  {type.type.name}
                </span>
              ))}
            </div>
          </div>

          {/* Moves */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-700">Select Move</h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {activePokemon.moves.map((move, index) => {
                const isDisabled = move.currentPp <= 0 || (isRealTime && move.currentCooldown > 0);
                return (
                  <button
                    key={index}
                    onClick={() => !isDisabled && onAttack(index)}
                    disabled={isDisabled}
                    className={getMoveButtonStyle(move, index)}
                  >
                    <div className="text-left">
                      <div className="font-bold">
                        {move.name.charAt(0).toUpperCase() + move.name.slice(1)}
                      </div>
                      <div className="text-xs opacity-90 mt-1">
                        <span className={`px-2 py-0.5 rounded ${getTypeColor(move.type)}`}>
                          {move.type}
                        </span>
                        {move.power > 0 && (
                          <span className="ml-2">Power: {move.power}</span>
                        )}
                      </div>
                      <div className="text-xs mt-1 flex justify-between">
                        <span>PP: {move.currentPp}/{move.pp}</span>
                        {isRealTime && move.currentCooldown > 0 && (
                          <span className="text-yellow-200">
                            CD: {move.currentCooldown.toFixed(1)}s
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Switch Button */}
          {availablePokemons.length > 0 && (
            <button
              onClick={() => setShowSwitchMenu(true)}
              className="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Switch Pokemon ({availablePokemons.length} available)
            </button>
          )}
        </>
      ) : (
        <>
          {/* Switch Pokemon Menu */}
          <div className="mb-4 flex justify-between items-center">
            <h4 className="text-lg font-semibold text-gray-700">Switch Pokemon</h4>
            <button
              onClick={() => setShowSwitchMenu(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
          </div>

          <div className="space-y-3">
            {teamPokemons.map((pokemon, index) => {
              if (pokemon.isKnockedOut || pokemon === activePokemon) return null;

              const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;

              return (
                <button
                  key={pokemon.pokemon.id}
                  onClick={() => {
                    onSwitch(index);
                    setShowSwitchMenu(false);
                  }}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={pokemon.pokemon.image}
                      alt={pokemon.pokemon.name}
                      className="w-16 h-16 object-contain"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">
                        {pokemon.pokemon.name.charAt(0).toUpperCase() +
                          pokemon.pokemon.name.slice(1)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        HP: {pokemon.currentHp}/{pokemon.maxHp}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            hpPercent > 50
                              ? 'bg-green-500'
                              : hpPercent > 20
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${hpPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

