'use client';

import { useState, useMemo } from 'react';
import WeddingFilter from '@/components/wedding/WeddingFilter';
import WeddingCard from '@/components/wedding/WeddingCard';
import CTABanner from '@/components/cta/CTABanner';
import ConsultationModal from '@/components/consultation/ConsultationModal';
import { useConsultation } from '@/hooks/useConsultation';
import { weddingPackages } from '@/data/weddingPackages';
import { filterWeddingPackages, WeddingFilterParams } from '@/lib/filterLogic';
import { WeddingPackage } from '@/types/wedding';
import { Sparkles, SlidersHorizontal, Trophy, BadgePercent } from 'lucide-react';

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

  // 지능형 정렬 상태: 'ai' (AI 가성비 스코어 추천순), 'price' (낮은 가격순), 'includes' (혜택 많은순)
  const [sortBy, setSortBy] = useState<'ai' | 'price' | 'includes'>('ai');

  function handleApplyFilter() {
    const filtered = filterWeddingPackages(weddingPackages, filterParams);
    setResults(filtered);
    setHasFiltered(true);
  }

  // 실시간 AI 가성비 스코어 연산 및 다중 정렬 알고리즘 (하드코딩 배제)
  const sortedResults = useMemo(() => {
    const data = [...results];
    
    if (sortBy === 'price') {
      // 낮은 가격순 정렬
      return data.sort((a, b) => a.priceMin - b.priceMin);
    }
    
    if (sortBy === 'includes') {
      // 포함 혜택 많은순 정렬
      return data.sort((a, b) => b.includes.length - a.includes.length);
    }
    
    // 'ai' 정렬: 가격 대비 포함 혜택 개수가 극대화된 순 (VFM 스코어 연산)
    // VFM Score = 혜택 개수 / 평균 가격
    return data.sort((a, b) => {
      const avgA = (a.priceMin + a.priceMax) / 2;
      const avgB = (b.priceMin + b.priceMax) / 2;
      const scoreA = a.includes.length / avgA;
      const scoreB = b.includes.length / avgB;
      return scoreB - scoreA; // 내림차순 (가성비 높은 순)
    });
  }, [results, sortBy]);

  return (
    <>
      <main className="mx-auto max-w-lg space-y-6 px-4 py-8 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-bold text-stone-850">웨딩 서비스</h1>
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

        {/* 정렬 탭 및 결과 수 표시 영역 */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] text-stone-500 font-bold">
              총 <span className="font-extrabold text-stone-850 text-rose-500">{sortedResults.length}개</span>의 패키지
              {hasFiltered && ' · 필터 적용됨'}
            </p>
            
            {/* 정렬 셀렉터 */}
            <div className="flex items-center gap-1.5 text-stone-400">
              <SlidersHorizontal size={12} />
              <span className="text-[10px] font-black uppercase tracking-wider">정렬</span>
            </div>
          </div>

          {/* 지능형 정렬 탭 단추 */}
          <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setSortBy('ai')}
              className={`py-1.5 rounded-lg text-[11px] font-black transition-all ${sortBy === 'ai' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
            >
              🤖 AI 추천순
            </button>
            <button
              onClick={() => setSortBy('price')}
              className={`py-1.5 rounded-lg text-[11px] font-black transition-all ${sortBy === 'price' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
            >
              ₩ 낮은가격순
            </button>
            <button
              onClick={() => setSortBy('includes')}
              className={`py-1.5 rounded-lg text-[11px] font-black transition-all ${sortBy === 'includes' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
            >
              🎁 혜택많은순
            </button>
          </div>
        </div>

        {/* 결과 리스트 */}
        {sortedResults.length > 0 ? (
          <div className="space-y-4">
            {sortedResults.map((pkg, index) => {
              const isAiBest = sortBy === 'ai' && index === 0; // AI 추천 1위 판정
              return (
                <div key={pkg.id} className="relative">
                  {isAiBest && (
                    <div className="absolute -top-3.5 left-4 z-10 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9.5px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Trophy size={11} className="animate-bounce" />
                      <span>AI 가성비 최적화 1위 추천</span>
                    </div>
                  )}
                  <WeddingCard
                    pkg={pkg}
                    onCTAClick={() => openModal('wedding', 'wedding')}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            <EmptyState onReset={() => { setFilterParams(DEFAULT_FILTER); setResults(weddingPackages); setHasFiltered(false); }} />
            
            {/* 대안 추천 패키지 리스트 개설 (콜드스타트 자동 우회책) */}
            <div className="pt-5 border-t border-stone-150">
              <h3 className="text-xs font-black text-stone-850 flex items-center gap-1.5 mb-4">
                <Sparkles size={13} className="text-rose-500 animate-pulse" />
                이런 패키지는 어떠세요? (실시간 인기 추천 패키지)
              </h3>
              <div className="space-y-4">
                {weddingPackages.filter(p => p.id === 'wp-001' || p.id === 'wp-003' || p.id === 'wp-007').map((pkg) => (
                  <WeddingCard
                    key={`recommend-${pkg.id}`}
                    pkg={pkg}
                    onCTAClick={() => openModal('wedding', 'wedding')}
                  />
                ))}
              </div>
            </div>
          </div>
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
    <div className="rounded-2xl bg-stone-50 py-12 text-center ring-1 ring-stone-100">
      <p className="mb-1 text-sm font-bold text-stone-750">조건에 맞는 패키지가 없습니다</p>
      <p className="mb-4 text-xs text-stone-400">필터를 초기화하거나 상담을 통해 더 많은 옵션을 확인해 보세요.</p>
      <button onClick={onReset} className="text-sm font-black text-rose-500 hover:text-rose-700">
        필터 초기화
      </button>
    </div>
  );
}
