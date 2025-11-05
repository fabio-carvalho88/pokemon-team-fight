import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  AnimationState,
  AnimationSequence,
  SpriteAnimation,
  AttackEffect,
  DamageNumber,
  AnimationType,
} from '../../../types/animation';
import { SPRITE_POSITIONS } from '../../../types/animation';

const initialState: AnimationState = {
  currentSequence: null,
  queuedSequences: [],
  spriteAnimations: {},
  activeEffects: [],
  damageNumbers: [],
  hpBars: {},
  isAnimating: false,
  animationSpeed: 1.0,
  lastFrameTime: 0,
};

const animationSlice = createSlice({
  name: 'animation',
  initialState,
  reducers: {
    // Sprite animations
    initializeSprite: (
      state,
      action: PayloadAction<{
        pokemonId: number;
        teamSide: 'team1' | 'team2';
      }>
    ) => {
      const { pokemonId, teamSide } = action.payload;
      const positions =
        SPRITE_POSITIONS[teamSide as keyof typeof SPRITE_POSITIONS];

      state.spriteAnimations[pokemonId] = {
        pokemonId,
        teamSide,
        currentAnimation: 'IDLE',
        position: { ...positions.entry },
        scale: 1,
        opacity: 0,
        rotation: 0,
        isVisible: false,
      };
    },

    updateSpriteAnimation: (
      state,
      action: PayloadAction<{
        pokemonId: number;
        animation: AnimationType;
      }>
    ) => {
      const { pokemonId, animation } = action.payload;
      if (state.spriteAnimations[pokemonId]) {
        state.spriteAnimations[pokemonId].currentAnimation = animation;
      }
    },

    updateSpritePosition: (
      state,
      action: PayloadAction<{
        pokemonId: number;
        position: { x: number; y: number };
      }>
    ) => {
      const { pokemonId, position } = action.payload;
      if (state.spriteAnimations[pokemonId]) {
        state.spriteAnimations[pokemonId].position = position;
      }
    },

    updateSpriteProperties: (
      state,
      action: PayloadAction<{
        pokemonId: number;
        properties: Partial<SpriteAnimation>;
      }>
    ) => {
      const { pokemonId, properties } = action.payload;
      if (state.spriteAnimations[pokemonId]) {
        state.spriteAnimations[pokemonId] = {
          ...state.spriteAnimations[pokemonId],
          ...properties,
        };
      }
    },

    // Animation sequences
    queueSequence: (state, action: PayloadAction<AnimationSequence>) => {
      state.queuedSequences.push(action.payload);
      if (!state.currentSequence) {
        state.currentSequence = state.queuedSequences.shift() || null;
        state.isAnimating = true;
      }
    },

    advanceSequence: (state) => {
      if (state.currentSequence) {
        state.currentSequence.currentFrameIndex++;
        if (state.currentSequence.currentFrameIndex >= state.currentSequence.frames.length) {
          // Sequence complete
          if (state.currentSequence.loop) {
            state.currentSequence.currentFrameIndex = 0;
          } else {
            state.currentSequence.status = 'completed';
            // Move to next sequence
            state.currentSequence = state.queuedSequences.shift() || null;
            if (!state.currentSequence) {
              state.isAnimating = false;
            }
          }
        }
      }
    },

    completeSequence: (state) => {
      if (state.currentSequence) {
        state.currentSequence.status = 'completed';
        state.currentSequence = state.queuedSequences.shift() || null;
        if (!state.currentSequence) {
          state.isAnimating = false;
        }
      }
    },

    clearSequences: (state) => {
      state.currentSequence = null;
      state.queuedSequences = [];
      state.isAnimating = false;
    },

    // Attack effects
    addAttackEffect: (state, action: PayloadAction<AttackEffect>) => {
      state.activeEffects.push(action.payload);
    },

    updateAttackEffects: (state, action: PayloadAction<number>) => {
      const currentTime = action.payload;
      state.activeEffects = state.activeEffects.filter((effect) => {
        const elapsed = currentTime - effect.startTime;
        return elapsed < effect.duration;
      });
    },

    clearAttackEffects: (state) => {
      state.activeEffects = [];
    },

    // Damage numbers
    addDamageNumber: (state, action: PayloadAction<DamageNumber>) => {
      state.damageNumbers.push(action.payload);
    },

    updateDamageNumbers: (state, action: PayloadAction<number>) => {
      const currentTime = action.payload;
      state.damageNumbers = state.damageNumbers
        .map((dmg) => {
          const elapsed = currentTime - dmg.startTime;
          const progress = elapsed / dmg.duration;

          if (progress >= 1) return null;

          return {
            ...dmg,
            position: {
              x: dmg.position.x + dmg.velocity.x,
              y: dmg.position.y + dmg.velocity.y,
            },
            velocity: {
              x: dmg.velocity.x,
              y: dmg.velocity.y + 0.5, // Gravity
            },
            opacity: Math.max(0, 1 - progress),
            scale: 1 + progress * 0.5,
          };
        })
        .filter((dmg): dmg is DamageNumber => dmg !== null);
    },

    clearDamageNumbers: (state) => {
      state.damageNumbers = [];
    },

    // HP bars
    initializeHPBar: (
      state,
      action: PayloadAction<{
        pokemonId: number;
        maxHp: number;
        currentHp: number;
      }>
    ) => {
      const { pokemonId, maxHp, currentHp } = action.payload;
      const hpPercent = (currentHp / maxHp) * 100;
      state.hpBars[pokemonId] = {
        pokemonId,
        currentValue: currentHp,
        targetValue: currentHp,
        maxValue: maxHp,
        animationProgress: 1,
        isAnimating: false,
        color: hpPercent > 50 ? 'green' : hpPercent > 20 ? 'yellow' : 'red',
      };
    },

    updateHPTarget: (
      state,
      action: PayloadAction<{
        pokemonId: number;
        targetHp: number;
      }>
    ) => {
      const { pokemonId, targetHp } = action.payload;
      if (state.hpBars[pokemonId]) {
        state.hpBars[pokemonId].targetValue = targetHp;
        state.hpBars[pokemonId].isAnimating = true;
        state.hpBars[pokemonId].animationProgress = 0;
      }
    },

    updateHPBars: (state, action: PayloadAction<number>) => {
      const deltaTime = action.payload;
      Object.values(state.hpBars).forEach((hpBar) => {
        if (hpBar.isAnimating) {
          hpBar.animationProgress = Math.min(1, hpBar.animationProgress + deltaTime / 500);

          // Interpolate HP value
          const startValue = hpBar.currentValue;
          const targetValue = hpBar.targetValue;
          hpBar.currentValue = Math.round(
            startValue + (targetValue - startValue) * hpBar.animationProgress
          );

          // Update color
          const hpPercent = (hpBar.currentValue / hpBar.maxValue) * 100;
          hpBar.color = hpPercent > 50 ? 'green' : hpPercent > 20 ? 'yellow' : 'red';

          if (hpBar.animationProgress >= 1) {
            hpBar.isAnimating = false;
            hpBar.currentValue = targetValue;
          }
        }
      });
    },

    // Animation controls
    setAnimationSpeed: (state, action: PayloadAction<number>) => {
      state.animationSpeed = Math.max(0.1, Math.min(5, action.payload));
    },

    pauseAnimations: (state) => {
      if (state.currentSequence) {
        state.currentSequence.status = 'paused';
      }
    },

    resumeAnimations: (state) => {
      if (state.currentSequence && state.currentSequence.status === 'paused') {
        state.currentSequence.status = 'playing';
      }
    },

    updateFrameTime: (state, action: PayloadAction<number>) => {
      state.lastFrameTime = action.payload;
    },

    // Reset all animations
    resetAnimations: (state) => {
      state.currentSequence = null;
      state.queuedSequences = [];
      state.activeEffects = [];
      state.damageNumbers = [];
      state.isAnimating = false;
    },
  },
});

export const {
  initializeSprite,
  updateSpriteAnimation,
  updateSpritePosition,
  updateSpriteProperties,
  queueSequence,
  advanceSequence,
  completeSequence,
  clearSequences,
  addAttackEffect,
  updateAttackEffects,
  clearAttackEffects,
  addDamageNumber,
  updateDamageNumbers,
  clearDamageNumbers,
  initializeHPBar,
  updateHPTarget,
  updateHPBars,
  setAnimationSpeed,
  pauseAnimations,
  resumeAnimations,
  updateFrameTime,
  resetAnimations,
} = animationSlice.actions;

export default animationSlice.reducer;

