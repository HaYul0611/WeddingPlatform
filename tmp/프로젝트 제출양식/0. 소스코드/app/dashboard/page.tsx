'use client';

import { useState, useCallback } from 'react';
import DDayCounter from '@/components/dashboard/DDayCounter';
import TimelineView from '@/components/dashboard/TimelineView';
import CTABanner from '@/components/cta/CTABanner';
import ConsultationModal from '@/components/consultation/ConsultationModal';
import { useConsultation } from '@/hooks/useConsultation';

export default function DashboardPage() {
  const [dday, setDday] = useState<number | null>(null);
  const { isOpen, openModal, closeModal, sourcePage, defaultCategory } = useConsultation();

  const handleDateSet = useCallback(
    (d: number) => {
      setDday(d);
      // 날짜 입력 완료 → CTA 배너 노출만 (자동 모달 X, 너무 공격적)
    },
    [],
  );

  return (
    <>
      <main className="mx-auto max-w-lg space-y-6 px-4 py-8">
        {/* 페이지 타이틀 */}
        <div>
          <h1 className="text-2xl font-bold text-stone-800 break-keep">웨딩 대시보드</h1>
          <p className="mt-1 text-sm text-stone-500 break-keep">
            결혼 예정일을 입력하고 단계별 준비 일정을 확인하세요.
          </p>
        </div>

        {/* D-Day 카운터 */}
        <DDayCounter onDateSet={handleDateSet} />

        {/* 타임라인 — 날짜 입력 후에만 표시 */}
        {dday !== null && (
          <>
            <TimelineView
              dday={dday}
              onCTAClick={() => openModal('dashboard', 'wedding')}
            />

            {/* 날짜 입력 완료 후 CTA 노출 */}
            <CTABanner
              title="웨딩 준비, 전문가와 함께하세요"
              description="입력하신 일정을 바탕으로 더 자세한 안내를 받을 수 있습니다."
              onClickCTA={() => openModal('dashboard', 'wedding')}
            />
          </>
        )}
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
