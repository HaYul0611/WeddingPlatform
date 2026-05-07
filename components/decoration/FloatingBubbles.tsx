'use client';

import React, { useMemo } from 'react';

/**
 * 위로 떠오르는 비눗방울 애니메이션 컴포넌트
 */
export default function FloatingBubbles() {
  const bubbleCount = 15;

  const bubbles = useMemo(() => {
    return Array.from({ length: bubbleCount }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${15 + Math.random() * 10}s`,
      size: `${15 + Math.random() * 30}px`,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="bubble absolute bottom-[-50px] animate-float-bubble"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.4) 30%, rgba(135, 206, 235, 0.5) 60%, rgba(255, 182, 193, 0.5) 80%)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '50%',
            animationDelay: b.delay,
            animationDuration: b.duration,
            boxShadow: 'inset -5px -5px 10px rgba(255, 255, 255, 0.6), 0 0 15px rgba(255, 255, 255, 0.5), 0 4px 15px rgba(0, 0, 0, 0.1)',
            opacity: 0.9,
            backdropFilter: 'blur(1px)',
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
