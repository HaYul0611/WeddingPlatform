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
            backgroundColor: p.id % 2 === 0 ? '#ffd7e6' : '#fff0f5', // 부드러운 핑크톤
            borderRadius: '10% 90% 10% 90% / 10% 90% 10% 90%', // 더 자연스러운 꽃잎 모양
            opacity: 0.7,
            filter: 'blur(0.3px)',
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotation})`,
          } as React.CSSProperties}
        />
      ))}

      {/* 바닥에 쌓여있는 정적 꽃잎들 (쌓인 효과 연출) */}
      <div className="absolute bottom-[-10px] left-0 w-full flex justify-around opacity-40">
        {[...Array(15)].map((_, i) => (
          <div
            key={`piled-${i}`}
            className="h-3 w-4"
            style={{
              backgroundColor: i % 3 === 0 ? '#ffd7e6' : '#fff0f5',
              borderRadius: '10% 90% 10% 90%',
              transform: `rotate(${i * 45}deg) translateY(${Math.random() * 20}px)`,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
