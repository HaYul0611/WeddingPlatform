'use client';

import { useState } from 'react';
import WeddingFilter from '@/components/wedding/WeddingFilter';
import WeddingCard from '@/components/wedding/WeddingCard';
import CTABanner from '@/components/cta/CTABanner';
import ConsultationModal from '@/components/consultation/ConsultationModal';
import { useConsultation } from '@/hooks/useConsultation';
import { weddingPackages } from '@/data/weddingPackages';
import { filterWeddingPackages, WeddingFilterParams } from '@/lib/filterLogic';
import { WeddingPackage } from '@/types/wedding';

const DEFAULT_FILTER: WeddingFilterParams = {
  budget: 'undecided',
  style: 'all',
  region: 'all',
};

export default function WeddingPage() {
  const [filterParams, setFilterParams] = useState<WeddingFilterParams>(DEFAULT_FILTER);
  const [results, setResults] = useState<WeddingPackage[]>(weddingPackages);
  const [hasFiltered, setHasFiltered] = useState(false);
  const { isOpen, openModal, closeModal, sourcePage, defaultCategory } = useConsultation();

  function handleApplyFilter() {
    const filtered = filterWeddingPackages(weddingPackages, filterParams);
    setResults(filtered);
    setHasFiltered(true);
    // 필터 적용 후 CTA 배너 노출 (자동 모달은 UX 방해 → 배너로 대체)
  }

  return (
    <>
      <main className="mx-auto max-w-lg space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">웨딩 서비스</h1>
          <p className="mt-1 text-sm text-stone-500">
            조건에 맞는 웨딩 패키지를 확인해 보세요.
          </p>
        </div>

        <WeddingFilter
          values={filterParams}
          onChange={setFilterParams}
          onApply={handleApplyFilter}
        />

        {/* 필터 적용 후 CTA 배너 */}
        {hasFiltered && (
          <CTABanner
            title="마음에 드는 패키지를 찾으셨나요?"
            description="선택하신 조건을 바탕으로 더 자세한 안내를 받을 수 있습니다."
            onClickCTA={() => openModal('wedding', 'wedding')}
          />
        )}

        {/* 결과 수 */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-500">
            <span className="font-semibold text-stone-800">{results.length}개</span>의 패키지
            {hasFiltered && ' · 선택하신 조건 기준'}
          </p>
        </div>

        {/* 결과 리스트 */}
        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((pkg) => (
              <WeddingCard
                key={pkg.id}
                pkg={pkg}
                onCTAClick={() => openModal('wedding', 'wedding')}
              />
            ))}
          </div>
        ) : (
          <EmptyState onReset={() => { setFilterParams(DEFAULT_FILTER); setResults(weddingPackages); setHasFiltered(false); }} />
        )}

        {/* 하단 CTA (항상 노출) */}
        <CTABanner
          title="원하시는 패키지가 없으신가요?"
          description="상담을 통해 더 다양한 옵션을 안내받을 수 있습니다."
          onClickCTA={() => openModal('wedding', 'wedding')}
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

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl bg-stone-50 py-12 text-center">
      <p className="mb-1 text-sm font-semibold text-stone-600">조건에 맞는 패키지가 없습니다</p>
      <p className="mb-4 text-xs text-stone-400">필터를 초기화하거나 상담을 통해 더 많은 옵션을 확인해 보세요.</p>
      <button onClick={onReset} className="text-sm font-semibold text-rose-500 hover:text-rose-700">
        필터 초기화
      </button>
    </div>
  );
}
