'use client';

import { ReactNode } from 'react';

interface PhoneMockupProps {
  children: ReactNode;
  scale?: number;
}

export function GalleryPhoneMockup({ children, scale = 1 }: PhoneMockupProps) {
  return (
    <div
      className="relative mx-auto select-none"
      style={{
        width: `${210 * scale}px`,
        height: `${380 * scale}px`,
      }}
    >
      {/* 📱 초슬림 3D 글래스 아이폰 목업 쉘 (Moiitee Premium Style) */}
      <div
        className="absolute inset-0 rounded-[36px] bg-white transition-all duration-300 border-[3.5px] border-[#1e1e1e]/90"
        style={{
          boxShadow: `
            0 0 0 1.5px #f4f4f5, 
            0 15px 35px -10px rgba(0, 0, 0, 0.16), 
            0 5px 15px -5px rgba(0, 0, 0, 0.08),
            inset 0 0 4px rgba(0, 0, 0, 0.05)
          `,
        }}
      >
        {/* 📸 다이내믹 아일랜드 (Dynamic Island) */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[42px] h-[9px] bg-[#121212] rounded-full z-30 flex items-center justify-end px-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          {/* 미세한 조도 센서/카메라 렌즈 빔 */}
          <div className="w-1.5 h-1.5 rounded-full bg-[#1c1c2e] opacity-80" />
        </div>

        {/* 🔊 수화기 스피커 슬릿 */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-stone-700/60 z-30 rounded-full" />

        {/* 🎬 액정 스크린 이너 글래스 */}
        <div className="absolute inset-[3.5px] rounded-[31px] overflow-hidden bg-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] z-20">
          {children}
        </div>

        {/* 🎛️ 하단 스와이프 홈 바 (Home Indicator) */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-14 h-[3.5px] bg-[#1e1e1e]/20 rounded-full z-30 pointer-events-none" />
      </div>
    </div>
  );
}
