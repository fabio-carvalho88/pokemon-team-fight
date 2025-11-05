import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import {
  updateFrameTime,
  updateHPBars,
  updateDamageNumbers,
  updateAttackEffects,
  setAnimationSpeed,
} from '../../store/slices/battles/animationSlice';

/**
 * Hook for managing battle animations
 */
export const useBattleAnimation = () => {
  const dispatch = useDispatch();
  const animationState = useSelector((state: RootState) => state.animation);

  // Animation loop using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) * animationState.animationSpeed;
      lastTime = currentTime;

      // Update frame time
      dispatch(updateFrameTime(currentTime));

      // Update all animations
      dispatch(updateHPBars(deltaTime));
      dispatch(updateDamageNumbers(currentTime));
      dispatch(updateAttackEffects(currentTime));

      animationFrameId = requestAnimationFrame(animate);
    };

    if (animationState.isAnimating) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [animationState.isAnimating, animationState.animationSpeed, dispatch]);

  const changeAnimationSpeed = useCallback(
    (speed: number) => {
      dispatch(setAnimationSpeed(speed));
    },
    [dispatch]
  );

  return {
    animationState,
    changeAnimationSpeed,
    spriteAnimations: animationState.spriteAnimations,
    hpBars: animationState.hpBars,
    damageNumbers: animationState.damageNumbers,
    activeEffects: animationState.activeEffects,
    isAnimating: animationState.isAnimating,
    animationSpeed: animationState.animationSpeed,
  };
};

