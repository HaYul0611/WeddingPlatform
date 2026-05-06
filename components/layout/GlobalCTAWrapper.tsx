'use client';

import { useConsultation } from '@/hooks/useConsultation';
import ConsultationModal from '@/components/consultation/ConsultationModal';

/**
 * layout.tsx(Server Component)에서 FloatingCTA를 렌더링하기 위한 클라이언트 래퍼.
 * 자체 useConsultation 상태를 소유하며, 모든 페이지에 하단 고정 버튼을 제공합니다.
 */
export default function GlobalCTAWrapper() {
  const { isOpen, openModal, closeModal, sourcePage, defaultCategory } = useConsultation();

  return (
    <>
      {/* 모바일 하단 고정 CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
        <div className="border-t border-stone-100 bg-[#FAF8F5]/95 px-4 pb-6 pt-3 backdrop-blur-sm">
          <button
            onClick={() => openModal('floating-cta', 'wedding')}
            className="w-full rounded-2xl bg-rose-500 py-4 text-base font-semibold text-white shadow-md shadow-rose-200/60 transition-all hover:bg-rose-600 active:scale-[0.99]"
          >
            💬 무료 상담 신청
          </button>
        </div>
      </div>

      {/* FloatingCTA 공간 확보용 (모바일) */}
      <div className="h-24 sm:hidden" aria-hidden="true" />

      <ConsultationModal
        isOpen={isOpen}
        onClose={closeModal}
        sourcePage={sourcePage}
        defaultCategory={defaultCategory}
      />
    </>
  );
}
