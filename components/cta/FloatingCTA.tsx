'use client';

import { ConsultationCategory } from '@/types/consultation';
import { useConsultation } from '@/hooks/useConsultation';
import ConsultationModal from '@/components/consultation/ConsultationModal';

interface FloatingCTAProps {
  sourcePage: string;
  defaultCategory?: ConsultationCategory;
}

/**
 * 모바일 화면 하단에 고정되는 CTA 버튼.
 * layout.tsx에 삽입하면 모든 페이지에서 노출됩니다.
 */
export default function FloatingCTA({ sourcePage, defaultCategory }: FloatingCTAProps) {
  const { isOpen, openModal, closeModal, sourcePage: modalSource, defaultCategory: modalCategory } =
    useConsultation();

  return (
    <>
      {/* 하단 안전 영역 확보용 spacer (모바일) */}
      <div className="h-20 sm:hidden" aria-hidden="true" />

      {/* 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-safe sm:hidden">
        <div className="mx-auto max-w-lg pb-4">
          <button
            type="button"
            onClick={() => openModal(sourcePage, defaultCategory)}
            className="w-full rounded-2xl bg-rose-500 py-4 text-base font-semibold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-600 active:scale-[0.99]"
          >
            💬 무료 상담 신청
          </button>
        </div>
      </div>

      <ConsultationModal
        isOpen={isOpen}
        onClose={closeModal}
        sourcePage={modalSource}
        defaultCategory={modalCategory}
      />
    </>
  );
}
