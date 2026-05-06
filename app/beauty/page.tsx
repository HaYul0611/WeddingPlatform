'use client';

import { useState } from 'react';
import BeautyFilter from '@/components/beauty/BeautyFilter';
import { ClinicCard, ProcedureCard } from '@/components/beauty/BeautyCards';
import CTABanner from '@/components/cta/CTABanner';
import ConsultationModal from '@/components/consultation/ConsultationModal';
import { useConsultation } from '@/hooks/useConsultation';
import { clinics } from '@/data/clinics';
import { procedures } from '@/data/procedures';
import { filterClinics, filterProcedures, ProcedureFilterParams } from '@/lib/filterLogic';
import { Clinic, Procedure } from '@/types/healthcare';

const DEFAULT_FILTER: ProcedureFilterParams = {
  budget: 'undecided',
  category: 'all',
  timeline: 'all',
};

type ViewTab = 'clinics' | 'procedures';

export default function BeautyPage() {
  const [filterParams, setFilterParams] = useState<ProcedureFilterParams>(DEFAULT_FILTER);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>(clinics);
  const [filteredProcedures, setFilteredProcedures] = useState<Procedure[]>(procedures);
  const [hasFiltered, setHasFiltered] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('clinics');
  const { isOpen, openModal, closeModal, sourcePage, defaultCategory } = useConsultation();

  function handleApplyFilter() {
    setFilteredClinics(filterClinics(clinics, { budget: filterParams.budget, category: filterParams.category }));
    setFilteredProcedures(filterProcedures(procedures, filterParams));
    setHasFiltered(true);
  }

  return (
    <>
      <main className="mx-auto max-w-lg space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">뷰티 · 의료 정보</h1>
          <p className="mt-1 text-sm text-stone-500">
            웨딩 전 뷰티 관리에 참고할 수 있는 일반 정보를 제공합니다.
          </p>
        </div>

        {/* 의료 고지 (상단 고정) */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs leading-relaxed text-amber-700">
            ⚠ 이 페이지의 모든 정보는 <strong>일반적인 안내 목적</strong>으로만 제공됩니다.
            의료 진단이나 치료 추천이 아니며, 시술 여부는 반드시 전문의와 상담하시기 바랍니다.
          </p>
        </div>

        <BeautyFilter
          values={filterParams}
          onChange={setFilterParams}
          onApply={handleApplyFilter}
        />

        {/* 필터 적용 후 CTA */}
        {hasFiltered && (
          <CTABanner
            title="더 자세한 정보가 필요하신가요?"
            description="선택하신 조건을 바탕으로 전문가 상담을 받을 수 있습니다."
            onClickCTA={() => openModal('beauty', 'beauty')}
          />
        )}

        {/* 탭 전환 */}
        <div className="flex rounded-xl bg-stone-100 p-1">
          {(['clinics', 'procedures'] as ViewTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {tab === 'clinics' ? `클리닉 (${filteredClinics.length})` : `시술 정보 (${filteredProcedures.length})`}
            </button>
          ))}
        </div>

        {/* 클리닉 목록 */}
        {activeTab === 'clinics' && (
          <div className="space-y-4">
            {filteredClinics.length > 0 ? (
              filteredClinics.map((clinic) => (
                <ClinicCard
                  key={clinic.id}
                  clinic={clinic}
                  onCTAClick={() => openModal('beauty', 'beauty')}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        )}

        {/* 시술 정보 목록 */}
        {activeTab === 'procedures' && (
          <div className="space-y-4">
            {filteredProcedures.length > 0 ? (
              filteredProcedures.map((proc) => (
                <ProcedureCard
                  key={proc.id}
                  procedure={proc}
                  onCTAClick={() => openModal('beauty', 'medical')}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        )}

        {/* 하단 CTA */}
        <CTABanner
          title="웨딩 전 전문가 상담을 받아보세요"
          description="입력하신 조건을 바탕으로 더 자세한 안내를 받을 수 있습니다."
          onClickCTA={() => openModal('beauty', 'beauty')}
          variant="bold"
        />
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

function EmptyState() {
  return (
    <div className="rounded-2xl bg-stone-50 py-10 text-center">
      <p className="text-sm text-stone-500">선택하신 조건에 맞는 항목이 없습니다.</p>
      <p className="mt-1 text-xs text-stone-400">필터를 조정하거나 상담을 통해 확인해 보세요.</p>
    </div>
  );
}
