'use client';

import { useState, useEffect } from 'react';
import BodyInfoForm from '@/components/healthcare/BodyInfoForm';
import RoutineDisplay from '@/components/healthcare/RoutineDisplay';
import CTABanner from '@/components/cta/CTABanner';
import ConsultationModal from '@/components/consultation/ConsultationModal';
import { useConsultation } from '@/hooks/useConsultation';
import { generateRoutine } from '@/lib/routineGenerator';
import { BodyInfo, RoutineOutput } from '@/types/healthcare';

export default function HealthcarePage() {
  const [routine, setRoutine] = useState<RoutineOutput | null>(null);
  const { isOpen, openModal, closeModal, sourcePage, defaultCategory } = useConsultation();

  // 루틴 생성 후 3초 뒤 자동 모달 오픈
  useEffect(() => {
    if (!routine) return;
    const timer = setTimeout(() => {
      openModal('healthcare', 'healthcare');
    }, 3000);
    return () => clearTimeout(timer);
  }, [routine, openModal]);

  function handleFormSubmit(info: BodyInfo) {
    const result = generateRoutine(info);
    setRoutine(result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <main className="mx-auto max-w-lg space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 break-keep">건강 관리</h1>
          <p className="mt-1 text-sm text-stone-500 break-keep">
            입력하신 정보를 바탕으로 일반적인 건강 관리 안내를 제공합니다.
          </p>
        </div>

        {/* 루틴 결과 — 생성 후 상단에 표시 */}
        {routine && (
          <>
            <RoutineDisplay routine={routine} />

            {/* 루틴 생성 완료 후 CTA 노출 */}
            <CTABanner
              title="더 구체적인 관리가 필요하신가요?"
              description="전문가와의 상담을 통해 입력하신 목표에 맞는 안내를 받을 수 있습니다."
              buttonLabel="전문가 상담 신청"
              onClickCTA={() => openModal('healthcare', 'healthcare')}
              variant="bold"
            />

            <button
              onClick={() => setRoutine(null)}
              className="w-full rounded-xl border border-stone-200 py-3 text-sm font-semibold text-stone-500 hover:bg-stone-50"
            >
              다시 입력하기
            </button>
          </>
        )}

        {/* 폼 — 결과 없을 때만 표시 */}
        {!routine && <BodyInfoForm onSubmit={handleFormSubmit} />}
      </main>

      <ConsultationModal
        isOpen={isOpen}
        onClose={closeModal}
        sourcePage={sourcePage}
        defaultCategory={defaultCategory}
      />
    </>
  );
}
