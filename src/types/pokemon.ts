export interface Pokemon {
  name: string;
  url: string;
  id: number;
  image: string;
}

// Extended Pokemon data for battles
export interface PokemonBattleStats {
  id: number;
  name: string;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
  moves: Array<{
    move: {
      name: string;
      url: string;
    };
  }>;
  sprites: {
    front_default: string;
    back_default: string;
    front_shiny: string;
    back_shiny: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
    versions: {
      'generation-v': {
        'black-white': {
          animated: {
            front_default: string;
            back_default: string;
          };
        };
      };
    };
  };
  weight: number;
  height: number;
}

// Move details for battle
export interface MoveDetails {
  id: number;
  name: string;
  power: number | null;
  pp: number;
  accuracy: number | null;
  priority: number;
  damage_class: {
    name: 'physical' | 'special' | 'status';
  };
  type: {
    name: string;
  };
  effect_entries: Array<{
    effect: string;
    short_effect: string;
  }>;
}

// Ability details
export interface AbilityDetails {
  id: number;
  name: string;
  effect_entries: Array<{
    effect: string;
    short_effect: string;
  }>;
}
