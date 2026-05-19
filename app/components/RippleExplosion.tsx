import React, { useEffect, useMemo, useState } from 'react';

interface RippleExplosionProps {
  isActive: boolean;
  originX: number;
  originY: number;
  containerWidth?: number;
  containerHeight?: number;
  color?: string;
  duration?: number;
  onComplete?: () => void;
}

export const RippleExplosion: React.FC<RippleExplosionProps> = ({
  isActive,
  originX,
  originY,
  containerWidth,
  containerHeight,
  color = 'rgba(0, 255, 0, 0.6)',
  duration = 1000,
  onComplete,
}) => {
  const [animate, setAnimate] = useState(false);

  const width = containerWidth ?? window.innerWidth;
  const height = containerHeight ?? window.innerHeight;

  // Calculate max distance to cover the parent container
  const maxDistance = useMemo(() => {
    return Math.max(
      Math.sqrt(originX ** 2 + originY ** 2),
      Math.sqrt((width - originX) ** 2 + originY ** 2),
      Math.sqrt(originX ** 2 + (height - originY) ** 2),
      Math.sqrt((width - originX) ** 2 + (height - originY) ** 2)
    );
  }, [originX, originY, width, height]);

  // 50 = half of initial ripple size
  const maxScale = (maxDistance / 50) * 2;

  useEffect(() => {
    if (isActive) {
      setAnimate(false);

      // Force reflow so animation restarts
      requestAnimationFrame(() => {
        setAnimate(true);
      });

      const timer = setTimeout(() => {
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  const rippleStyle = (
    scaleMultiplier: number,
    opacityValue: number
  ): React.CSSProperties => ({
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: '50%',
    backgroundColor: color,
    left: originX - 50,
    top: originY - 50,
    pointerEvents: 'none',

    transform: animate
      ? `scale(${maxScale * scaleMultiplier})`
      : 'scale(0)',

    opacity: animate ? 0 : opacityValue,

    transition: `
      transform ${duration}ms ease-out,
      opacity ${duration}ms ease-out
    `,
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Outer ripple */}
      <div style={rippleStyle(1.05, 0.6)} />

      {/* Middle ripple */}
      <div style={rippleStyle(1.0, 0.3)} />

      {/* Inner ripple */}
      <div style={rippleStyle(0.95, 0.1)} />
    </div>
  );
};