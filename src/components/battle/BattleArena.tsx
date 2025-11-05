import { useState } from 'react';
import { useBattle } from '../../hooks/battle/useBattle';
import { useBattleActions } from '../../hooks/battle/useBattleActions';
import { useBattleAnimation } from '../../hooks/battle/useBattleAnimation';
import { PokemonSprite } from './PokemonSprite';
import { AnimationLayer } from './AnimationLayer';
import { BattleControls } from './BattleControls';
import { BattleLog } from './BattleLog';
import { BattleResults } from './BattleResults';
import { ForfeitModal } from './ForfeitModal';
import { getPhaseDisplayName } from '../../store/slices/battles/battleStateMachine';
import { useDispatch } from 'react-redux';
import { endBattle, addLogEntry } from '../../store/slices/battles/battlesSlice';
import type { AppDispatch } from '../../store';

interface BattleArenaProps {
  onNewBattle?: () => void;
  onBattleEnd?: () => void;
}

export function BattleArena({ onNewBattle, onBattleEnd }: BattleArenaProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { battle, activePokemon, log, canPerformActions, status } = useBattle();
  const { attack, switchPokemon } = useBattleActions();
  const { hpBars } = useBattleAnimation();
  const [showForfeitModal, setShowForfeitModal] = useState(false);

  if (!battle) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-xl">No active battle</p>
          <p className="text-sm mt-2">Select teams to start a battle</p>
        </div>
      </div>
    );
  }

  const team1ActivePokemon = battle.team1.pokemons[battle.team1.activePokemonIndex];
  const team2ActivePokemon = battle.team2.pokemons[battle.team2.activePokemonIndex];

  const handleAttack = async (moveIndex: number) => {
    if (!canPerformActions) {
      console.log('Cannot perform actions in current phase:', battle.phase);
      return;
    }

    try {
      console.log('Executing attack with move index:', moveIndex);
      await attack(battle.id, battle.team1.teamId, battle.team1.activePokemonIndex, moveIndex);
    } catch (error) {
      console.error('Attack failed:', error);
      alert('Attack failed: ' + (error as Error).message);
    }
  };

  const handleSwitch = async (pokemonIndex: number) => {
    if (!canPerformActions) {
      console.log('Cannot perform actions in current phase:', battle.phase);
      return;
    }

    try {
      console.log('Executing switch to pokemon index:', pokemonIndex);
      await switchPokemon(
        battle.id,
        battle.team1.teamId,
        battle.team1.activePokemonIndex,
        pokemonIndex
      );
    } catch (error) {
      console.error('Switch failed:', error);
      alert('Switch failed: ' + (error as Error).message);
    }
  };

  const handleForfeit = () => {
    if (!battle) return;

    // Add forfeit log entry
    dispatch(
      addLogEntry({
        battleId: battle.id,
        entry: {
          id: `log-${Date.now()}-forfeit`,
          timestamp: Date.now(),
          turn: battle.currentTurn,
          type: 'info',
          message: `${battle.team1.teamName} forfeited the battle!`,
        },
      })
    );

    // End battle with opponent as winner
    dispatch(
      endBattle({
        battleId: battle.id,
        winnerId: battle.team2.teamId,
      })
    );

    setShowForfeitModal(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Battle Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{battle.team1.teamName}</h2>
            <div className="text-sm opacity-90">
              {battle.team1.pokemons.filter((p) => !p.isKnockedOut).length}/
              {battle.team1.pokemons.length} Pokemon
            </div>
          </div>

          <div className="text-center flex-1 mx-4">
            <div className="text-lg font-semibold">{getPhaseDisplayName(battle.phase)}</div>
            <div className="text-sm opacity-90">Turn {battle.currentTurn}</div>
            {status && (
              <div className="text-xs mt-1">
                Progress: {Math.round(status.team1AliveCount / battle.team1.pokemons.length * 100)}% vs{' '}
                {Math.round(status.team2AliveCount / battle.team2.pokemons.length * 100)}%
              </div>
            )}
            {battle.phase !== 'BATTLE_END' && (
              <button
                onClick={() => setShowForfeitModal(true)}
                className="mt-2 px-4 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
              >
                Forfeit Battle
              </button>
            )}
          </div>

          <div className="text-right">
            <h2 className="text-2xl font-bold">{battle.team2.teamName}</h2>
            <div className="text-sm opacity-90">
              {battle.team2.pokemons.filter((p) => !p.isKnockedOut).length}/
              {battle.team2.pokemons.length} Pokemon
            </div>
          </div>
        </div>
      </div>

      {/* Battle Arena */}
      <div className="flex-1 grid grid-cols-3 gap-6 p-6 bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Left Side - Team 1 Pokemon */}
        <div className="flex items-center justify-center">
          {activePokemon && (
            <PokemonSprite
              pokemon={team1ActivePokemon}
              side="player"
              hpBar={hpBars[team1ActivePokemon.pokemon.id]}
              isActive={true}
            />
          )}
        </div>

          {/* Center - Battle Field */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 rounded-lg opacity-50" />

          {/* Battlefield Decoration */}
          <div className="relative z-10 text-center">
            <div className="text-6xl mb-4">⚔️</div>
            <div className="text-gray-600 font-semibold">
              {battle.isRealTime ? 'Real-Time Battle' : 'Turn-Based Battle'}
            </div>
            {canPerformActions && (
              <div className="mt-2 text-green-600 font-bold animate-pulse">
                Your Turn!
              </div>
            )}
            {/* Debug info */}
            <div className="mt-2 text-xs text-gray-400">
              Phase: {battle.phase} | Can Act: {canPerformActions ? 'Yes' : 'No'}
            </div>
          </div>

          {/* Animation Layer */}
          <AnimationLayer />
        </div>

        {/* Right Side - Team 2 Pokemon */}
        <div className="flex items-center justify-center">
          {activePokemon && (
            <PokemonSprite
              pokemon={team2ActivePokemon}
              side="opponent"
              hpBar={hpBars[team2ActivePokemon.pokemon.id]}
              isActive={true}
            />
          )}
        </div>
      </div>

      {/* Battle Controls and Log */}
      <div className="grid md:grid-cols-2 gap-6 p-6 bg-gray-100">
        <BattleControls
          activePokemon={team1ActivePokemon}
          teamPokemons={battle.team1.pokemons}
          isRealTime={battle.isRealTime}
          canPerformActions={canPerformActions}
          onAttack={handleAttack}
          onSwitch={handleSwitch}
          isPlayerTurn={true}
        />

        <BattleLog entries={log} />
      </div>

      {/* Battle Results Modal */}
      {battle.phase === 'BATTLE_END' && (
        <BattleResults
          battle={battle}
          onNewBattle={onNewBattle}
          onClose={onBattleEnd}
        />
      )}

      {/* Forfeit Confirmation Modal */}
      <ForfeitModal
        isOpen={showForfeitModal}
        onConfirm={handleForfeit}
        onCancel={() => setShowForfeitModal(false)}
      />
    </div>
  );
}

