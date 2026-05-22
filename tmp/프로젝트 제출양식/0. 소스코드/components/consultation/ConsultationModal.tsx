'use client';

import { useEffect, useCallback } from 'react';
import { ConsultationCategory } from '@/types/consultation';
import ConsultationForm from './ConsultationForm';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePage: string;
  defaultCategory?: ConsultationCategory;
}

export default function ConsultationModal({
  isOpen,
  onClose,
  sourcePage,
  defaultCategory,
}: ConsultationModalProps) {
  // ───────────────────────────────
  // ESC 키 닫기 + body scroll lock
  // ───────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="상담 신청"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel
          - 모바일: 하단 시트 (bottom sheet)
          - sm 이상: 중앙 카드
      */}
      <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        {/* 모바일 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-stone-200" />
        </div>

        {/* 닫기 버튼 */}
        <div className="flex items-center justify-between px-6 pt-4 pb-0 sm:pt-6">
          <div /> {/* spacer */}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors hover:bg-stone-200"
            aria-label="닫기"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 폼 콘텐츠 */}
        <div className="max-h-[85vh] overflow-y-auto overscroll-contain px-6 pb-8 sm:pb-8">
          <ConsultationForm
            sourcePage={sourcePage}
            defaultCategory={defaultCategory}
            onSuccess={onClose}
          />
        </div>
      </div>
    </div>
  );
}
