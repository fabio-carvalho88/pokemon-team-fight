// Animation state for battle visuals

export type AnimationType =
  | 'IDLE'
  | 'ATTACK'
  | 'DAMAGE'
  | 'FAINT'
  | 'ENTRY'
  | 'SWITCH_OUT'
  | 'EFFECT';

export type AnimationStatus = 'idle' | 'playing' | 'paused' | 'completed';

// Individual animation frame
export interface AnimationFrame {
  id: string;
  timestamp: number;
  duration: number;
  type: AnimationType;
  targetId: string;
  properties: Record<string, unknown>;
}

// Animation sequence
export interface AnimationSequence {
  id: string;
  frames: AnimationFrame[];
  currentFrameIndex: number;
  status: AnimationStatus;
  loop: boolean;
  onComplete?: string; // Action to dispatch when complete
}

// Pokemon sprite animation state
export interface SpriteAnimation {
  pokemonId: number;
  teamSide: 'team1' | 'team2';
  currentAnimation: AnimationType;
  position: { x: number; y: number };
  scale: number;
  opacity: number;
  rotation: number;
  isVisible: boolean;
}

// Attack effect animation
export interface AttackEffect {
  id: string;
  effectType: 'physical' | 'special' | 'status';
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  color: string;
  particles: Particle[];
  duration: number;
  startTime: number;
}

// Particle for effects
export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
}

// Damage number animation
export interface DamageNumber {
  id: string;
  value: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  opacity: number;
  scale: number;
  color: string;
  isCritical: boolean;
  startTime: number;
  duration: number;
}

// HP bar animation
export interface HPBarAnimation {
  pokemonId: number;
  currentValue: number;
  targetValue: number;
  maxValue: number;
  animationProgress: number;
  isAnimating: boolean;
  color: 'green' | 'yellow' | 'red';
}

// Main animation state
export interface AnimationState {
  currentSequence: AnimationSequence | null;
  queuedSequences: AnimationSequence[];
  spriteAnimations: Record<number, SpriteAnimation>;
  activeEffects: AttackEffect[];
  damageNumbers: DamageNumber[];
  hpBars: Record<number, HPBarAnimation>;
  isAnimating: boolean;
  animationSpeed: number; // 1.0 = normal, 2.0 = 2x speed, etc.
  lastFrameTime: number;
}

// Animation event
export interface AnimationEvent {
  type: 'start' | 'frame' | 'complete' | 'cancel';
  animationId: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

// Sprite position presets
export const SPRITE_POSITIONS = {
  team1: {
    active: { x: 200, y: 300 },
    entry: { x: -100, y: 300 },
    exit: { x: -100, y: 300 },
  },
  team2: {
    active: { x: 600, y: 200 },
    entry: { x: 900, y: 200 },
    exit: { x: 900, y: 200 },
  },
} as const;

// Animation duration constants (in milliseconds)
export const ANIMATION_DURATIONS = {
  POKEMON_ENTRY: 800,
  POKEMON_EXIT: 600,
  ATTACK_WINDUP: 300,
  ATTACK_STRIKE: 200,
  DAMAGE_FLASH: 150,
  HP_BAR_UPDATE: 500,
  FAINT: 1000,
  SWITCH: 800,
  EFFECT_PARTICLE: 600,
} as const;

// Easing functions for animations
export type EasingFunction =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'bounce'
  | 'elastic';

export interface AnimationConfig {
  duration: number;
  easing: EasingFunction;
  delay?: number;
}

