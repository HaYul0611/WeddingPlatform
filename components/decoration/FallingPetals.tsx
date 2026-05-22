'use client';

import React, { useMemo } from 'react';

/**
 * 흩날리는 꽃잎 애니메이션 컴포넌트
 * 부모 컨테이너(relative) 내부에 꽃잎이 떨어져 쌓이는 연출을 합니다.
 */
export default function FallingPetals() {
  // 꽃잎 개수 설정
  const petalCount = 20;

  const petals = useMemo(() => {
    return Array.from({ length: petalCount }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${10 + Math.random() * 15}s`,
      size: `${10 + Math.random() * 15}px`,
      rotation: `${Math.random() * 360}deg`,
      sway: `${Math.random() * 40 - 20}px`,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden select-none">
      {petals.map((p) => (
        <div
          key={p.id}
          className="petal absolute top-[-20px] animate-fall-petal"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: 0.8,
            filter: 'drop-shadow(0px 2px 4px rgba(255, 192, 203, 0.4))',
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotation})`,
            backgroundImage: p.id % 2 === 0 
              ? "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 50 100 C 75 75, 95 60, 90 25 C 85 10, 65 10, 50 25 C 35 10, 15 10, 10 25 C 5 60, 25 75, 50 100 Z' fill='%23ffd7e6' /%3E%3C/svg%3E\")"
              : "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 50 100 C 75 75, 95 60, 90 25 C 85 10, 65 10, 50 25 C 35 10, 15 10, 10 25 C 5 60, 25 75, 50 100 Z' fill='%23fff0f5' /%3E%3C/svg%3E\")",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          } as React.CSSProperties}
        />
      ))}

      {/* 바닥에 쌓여있는 정적 꽃잎들 (쌓인 효과 연출) */}
      <div className="absolute bottom-[-10px] left-0 w-full flex justify-around opacity-60">
        {[...Array(15)].map((_, i) => (
          <div
            key={`piled-${i}`}
            className="h-4 w-4"
            style={{
              transform: `rotate(${i * 45}deg) translateY(${Math.random() * 20}px) scaleY(0.6)`, // 바닥에 누운 느낌
              filter: 'drop-shadow(0px 1px 2px rgba(255, 192, 203, 0.3)) blur(0.5px)',
              backgroundImage: i % 3 === 0 
                ? "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 50 100 C 75 75, 95 60, 90 25 C 85 10, 65 10, 50 25 C 35 10, 15 10, 10 25 C 5 60, 25 75, 50 100 Z' fill='%23ffd7e6' /%3E%3C/svg%3E\")"
                : "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 50 100 C 75 75, 95 60, 90 25 C 85 10, 65 10, 50 25 C 35 10, 15 10, 10 25 C 5 60, 25 75, 50 100 Z' fill='%23fff0f5' /%3E%3C/svg%3E\")",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          />
        ))}
      </div>
    </div>
  );
}
