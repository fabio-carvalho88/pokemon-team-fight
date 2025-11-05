import { useBattleAnimation } from '../../hooks/battle/useBattleAnimation';

export function AnimationLayer() {
  const { damageNumbers, activeEffects } = useBattleAnimation();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Damage Numbers */}
      {damageNumbers.map((dmg) => (
        <div
          key={dmg.id}
          className={`absolute text-4xl font-bold transition-all ${
            dmg.isCritical ? 'text-red-600 animate-pulse' : 'text-white'
          }`}
          style={{
            left: dmg.position.x,
            top: dmg.position.y,
            opacity: dmg.opacity,
            transform: `scale(${dmg.scale})`,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          {dmg.isCritical && '⚡'}
          {dmg.value}
          {dmg.isCritical && '!'}
        </div>
      ))}

      {/* Attack Effects */}
      {activeEffects.map((effect) => {
        const progress =
          (Date.now() - effect.startTime) / effect.duration;
        const isActive = progress < 1;

        if (!isActive) return null;

        return (
          <div key={effect.id}>
            {/* Simple effect visualization */}
            {effect.effectType === 'physical' && (
              <div
                className="absolute w-16 h-16 rounded-full animate-ping"
                style={{
                  left: effect.targetPosition.x - 32,
                  top: effect.targetPosition.y - 32,
                  backgroundColor: effect.color,
                  opacity: 1 - progress,
                }}
              />
            )}
            {effect.effectType === 'special' && (
              <div
                className="absolute w-24 h-24 rounded-full animate-pulse"
                style={{
                  left: effect.targetPosition.x - 48,
                  top: effect.targetPosition.y - 48,
                  background: `radial-gradient(circle, ${effect.color}, transparent)`,
                  opacity: 1 - progress,
                }}
              />
            )}

            {/* Projectile animation */}
            <div
              className="absolute w-8 h-8 rounded-full"
              style={{
                left:
                  effect.sourcePosition.x +
                  (effect.targetPosition.x - effect.sourcePosition.x) * progress,
                top:
                  effect.sourcePosition.y +
                  (effect.targetPosition.y - effect.sourcePosition.y) * progress,
                backgroundColor: effect.color,
                boxShadow: `0 0 20px ${effect.color}`,
                opacity: 1 - progress,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

