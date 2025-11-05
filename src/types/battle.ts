import type { Pokemon } from './pokemon';

// Battle Pokemon with runtime state
export interface BattlePokemon {
  pokemon: Pokemon;
  currentHp: number;
  maxHp: number;
  stats: {
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  abilities: Ability[];
  moves: Move[];
  types: PokemonType[];
  status: StatusEffect | null;
  isKnockedOut: boolean;
}

// Pokemon abilities
export interface Ability {
  name: string;
  url: string;
  effect: string;
}

// Pokemon moves for battle
export interface Move {
  name: string;
  power: number;
  accuracy: number;
  pp: number;
  currentPp: number;
  type: string;
  damageClass: 'physical' | 'special' | 'status';
  priority: number;
  cooldown: number;
  currentCooldown: number;
}

// Pokemon types
export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

// Status effects
export type StatusEffect = 'burn' | 'freeze' | 'paralysis' | 'poison' | 'sleep';

// Battle participants
export interface BattleTeam {
  teamId: string;
  teamName: string;
  pokemons: BattlePokemon[];
  activePokemonIndex: number;
}

// Battle state machine states
export type BattlePhase =
  | 'SETUP'
  | 'READY'
  | 'POKEMON_ENTRY'
  | 'ACTION_SELECT'
  | 'EXECUTING_ACTION'
  | 'ANIMATION'
  | 'DAMAGE_CALC'
  | 'CHECK_KO'
  | 'BATTLE_END';

// Battle actions
export type BattleActionType = 'ATTACK' | 'SWITCH' | 'ITEM' | 'FLEE';

export interface BattleAction {
  id: string;
  teamId: string;
  pokemonIndex: number;
  type: BattleActionType;
  moveIndex?: number;
  targetPokemonIndex?: number;
  switchToPokemonIndex?: number;
  timestamp: number;
  priority: number;
}

// Main battle state
export interface Battle {
  id: string;
  team1: BattleTeam;
  team2: BattleTeam;
  phase: BattlePhase;
  currentTurn: number;
  battleLog: BattleLogEntry[];
  winnerId: string | null;
  startTime: number;
  endTime: number | null;
  isRealTime: boolean;
}

// Battle log entry
export interface BattleLogEntry {
  id: string;
  timestamp: number;
  turn: number;
  type: 'action' | 'damage' | 'status' | 'ko' | 'switch' | 'info';
  message: string;
  data?: {
    attackerName?: string;
    defenderName?: string;
    moveName?: string;
    damage?: number;
    isCritical?: boolean;
    effectiveness?: number;
    newStatus?: StatusEffect;
  };
}

// Battle result
export interface BattleResult {
  battleId: string;
  winnerId: string;
  loserId: string;
  duration: number;
  turns: number;
  team1Stats: TeamBattleStats;
  team2Stats: TeamBattleStats;
}

// Team statistics for a single battle
export interface TeamBattleStats {
  teamId: string;
  totalDamageDealt: number;
  totalDamageTaken: number;
  knockouts: number;
  pokemonsLost: number;
  movesUsed: Record<string, number>;
}

// Overall statistics
export interface BattleStatistics {
  battleId: string;
  duration: number;
  totalTurns: number;
  winner: string;
  loser: string;
}

export interface TeamStatistics {
  teamId: string;
  totalBattles: number;
  wins: number;
  losses: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  averageBattleDuration: number;
  knockouts: number;
}

export interface PokemonStatistics {
  pokemonId: number;
  battlesParticipated: number;
  wins: number;
  losses: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  knockouts: number;
  timesKnockedOut: number;
  movesUsed: Record<string, number>;
}

// Damage calculation result
export interface DamageCalculation {
  damage: number;
  isCritical: boolean;
  effectiveness: number;
  attackerName: string;
  defenderName: string;
  moveName: string;
}

