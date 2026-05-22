'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { InvitationTemplate } from '@/types/invitation';
import { GalleryTemplateCard } from '@/components/invite/GalleryTemplateCard';
import SectionRenderer from '@/components/invite/SectionRenderer';
import { TEMPLATE_CATEGORIES } from '@/data/invitation-templates';

interface TemplatePreviewModalProps {
  template: InvitationTemplate;
  onClose: () => void;
}

export default function TemplatePreviewModal({ template, onClose }: TemplatePreviewModalProps) {
  const [showScrollGuide, setShowScrollGuide] = useState(true);

  // ESC 키 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const { theme } = template;

  const isDarkColor = (color: string) => {
    if (!color) return false;
    const hex = color.replace('#', '');
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return (r * 0.299 + g * 0.587 + b * 0.114) < 140;
    } else if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return (r * 0.299 + g * 0.587 + b * 0.114) < 140;
    }
    return false;
  };

  const isDarkBg = isDarkColor(theme.bgColor || '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scroll-mouse-wheel {
          0% { transform: translateY(0); opacity: 0; }
          20% { transform: translateY(0); opacity: 1; }
          80% { transform: translateY(14px); opacity: 1; }
          100% { transform: translateY(14px); opacity: 0; }
        }
      ` }} />
      <div
        className="relative flex flex-col items-center w-auto mx-4 gap-6 rounded-[48px] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
        >
          <svg className="h-4 w-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 스마트폰 프레임 (밝은 테마) */}
        <div className="flex flex-col items-center justify-center mt-2">
          <div 
            className="relative shrink-0 overflow-hidden rounded-[42px] bg-white w-[310px] h-[590px] border-[4px] border-[#1e1e1e]/90 transition-all duration-300"
            style={{
              boxShadow: '0 0 0 1.5px #f4f4f5, 0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 0 4px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Notch 대신 초정밀 다이내믹 아일랜드 (Dynamic Island) 배치 */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-[52px] h-[10.5px] bg-[#121212] rounded-full z-[200] flex items-center justify-end px-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1c1c2e] opacity-80" />
            </div>
            {/* 상태 표시줄 */}
            <div className="absolute top-1.5 left-0 w-full h-8 z-[100] px-6 flex items-center justify-between pointer-events-none">
              <span className={`text-[11px] font-bold mt-1.5 transition-colors ${isDarkBg ? 'text-white' : 'text-stone-900'}`}>14:27</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-colors ${isDarkBg ? 'text-white' : 'text-stone-900'}`}><path d="M5 12.55a11 11 0 0114.08 0 M1.42 9a16 16 0 0121.16 0 M8.53 16.11a6 6 0 016.95 0 M12 20h.01" /></svg>
                <svg width="12" height="12" viewBox="0 0 24 24" className="text-rose-500 fill-current"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
              </div>
            </div>
            {/* 스크롤 가이드 오버레이 */}
            {showScrollGuide && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowScrollGuide(false);
                }}
                className="absolute inset-0 z-[150] flex flex-col items-center justify-center bg-black/65 backdrop-blur-[1px] cursor-pointer select-none transition-all duration-300 animate-fade-in"
              >
                <div
                  className="rounded-full border-[1px] border-white/70 flex justify-center pt-1.5 relative shadow-md"
                  style={{ width: '24px', height: '42px' }}
                >
                  <div
                    className="w-[1.2px] h-[6px] bg-white/90 rounded-full"
                    style={{
                      animation: 'scroll-mouse-wheel 1.8s cubic-bezier(0.25, 1, 0.5, 1) infinite'
                    }}
                  />
                </div>
                <p className="mt-4 text-[13px] font-bold text-white tracking-wide text-center leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  이미지를 스크롤하시면<br />
                  자세히 보실 수 있습니다.
                </p>
              </div>
            )}
            {/* 화면 */}
            <div
              className={`absolute inset-x-0 bottom-0 top-0 pb-6 custom-scrollbar-preview ${showScrollGuide ? 'overflow-hidden' : 'overflow-y-auto'}`}
              style={{
                backgroundColor: theme.bgColor,
                fontFamily: theme.fontFamily,
                color: theme.primaryColor,
              }}
            >
              <div className="pt-10 flex flex-col">
                {template.defaultSections.map((section, idx) => (
                  <div key={idx} className="border-b border-stone-100/30">
                    <SectionRenderer section={section} theme={theme} allSections={template.defaultSections} />
                  </div>
                ))}
              </div>
            </div>
            {/* Home Indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-stone-300/60 rounded-full z-[110]" />
          </div>
        </div>

        {/* CTA 버튼 */}
        <div className="flex w-[310px] gap-2">
          <Link
            href={`/invite/create?template=${template.id}`}
            className="flex-1 rounded-full bg-rose-500 py-3.5 text-center text-[14px] font-bold text-white hover:bg-rose-600 transition-colors shadow-sm"
          >
            이 템플릿으로 만들기 →
          </Link>
        </div>
      </div>
    </div>
  );
}

const SECTION_LABELS = [
  { type: 'cover', label: '메인 이미지 & 커버', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { type: 'greeting', label: '인사말', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
  { type: 'gallery', label: '포토 갤러리', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { type: 'dday', label: 'D-Day 카운트다운', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { type: 'schedule', label: '예식 순서', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { type: 'map', label: '지도 & 오시는 길', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
  { type: 'bankAccount', label: '계좌번호', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { type: 'rsvp', label: 'RSVP 참석 여부', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { type: 'guestbook', label: '방명록', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { type: 'wishlist', label: '위시리스트', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
];

