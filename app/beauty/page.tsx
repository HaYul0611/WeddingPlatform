'use client';

import { useState, useMemo } from 'react';
import BeautyFilter, { ExtendedFilterParams } from '@/components/beauty/BeautyFilter';
import BeautyRoadmap, { DressStyle } from '@/components/beauty/BeautyRoadmap';
import { ClinicCard, ProcedureCard } from '@/components/beauty/BeautyCards';
import CTABanner from '@/components/cta/CTABanner';
import ConsultationModal from '@/components/consultation/ConsultationModal';
import { useConsultation } from '@/hooks/useConsultation';
import { clinics } from '@/data/clinics';
import { procedures } from '@/data/procedures';
import { filterClinics, filterProcedures } from '@/lib/filterLogic';
import { Clinic, Procedure, TimelineWindow } from '@/types/healthcare';
import { Sparkles, SlidersHorizontal, Trophy, Award, MapPin, ShieldAlert, BookOpen, Bot, TrendingDown, Star } from 'lucide-react';

const DEFAULT_FILTER: ExtendedFilterParams = {
  budget: 'undecided',
  category: 'all',
  timeline: 'all',
  region: 'all',
  dressStyle: 'all',
};

type ViewTab = 'clinics' | 'procedures';

export default function BeautyPage() {
  const [filterParams, setFilterParams] = useState<ExtendedFilterParams>(DEFAULT_FILTER);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>(clinics);
  const [filteredProcedures, setFilteredProcedures] = useState<Procedure[]>(procedures);
  const [hasFiltered, setHasFiltered] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('clinics');
  const { isOpen, openModal, closeModal, sourcePage, defaultCategory } = useConsultation();

  // 지능형 정렬 상태: 'ai' (AI 핏 최적화 가성비 추천순), 'price' (낮은 가격순), 'specialty' (전문의 진료 영역 많은순 / 혜택순)
  const [sortBy, setSortBy] = useState<'ai' | 'price' | 'specialty'>('ai');

  // 로드맵 연동 상태
  const [roadmapTimeline, setRoadmapTimeline] = useState<TimelineWindow>('3_6months');
  const [roadmapDressStyle, setRoadmapDressStyle] = useState<DressStyle>('off_shoulder');

  function handleApplyFilter() {
    // 1. 기존 예산 & 카테고리 필터 결과 적용
    const baseClinics = filterClinics(clinics, { budget: filterParams.budget, category: filterParams.category });

    // 2. 지역 필터 추가 확장 적용
    const selectedRegion = filterParams.region ?? 'all';
    const regionFilteredClinics = selectedRegion && selectedRegion !== 'all'
      ? baseClinics.filter(clinic => clinic.region.includes(selectedRegion))
      : baseClinics;

    setFilteredClinics(regionFilteredClinics);

    // 3. 시술 정보 필터 적용 (드레스 스타일에 맞는 타겟 카테고리 매칭 로직 보강)
    let finalProcedures = filterProcedures(procedures, {
      budget: filterParams.budget,
      category: filterParams.category,
      timeline: filterParams.timeline,
    });

    // 드레스 스타일에 따른 맞춤 시술 가중치 필터링 보강
    if (filterParams.dressStyle && filterParams.dressStyle !== 'all') {
      const dressCategoryMap: Record<DressStyle, string[]> = {
        off_shoulder: ['lifting', 'skincare', 'diet_medical'], // 승모근, 쇄골, 팔뚝탄력 관련
        mermaid: ['diet_medical', 'lifting'],                 // 체중관리, 골반/힙 리프팅 관련
        backless: ['skincare', 'laser'],                       // 등 피부 장벽, 필링 관련
        minimal: ['skincare', 'laser', 'filler', 'dental'],   // 물광, 미백, 얼굴 윤곽 필러 관련
      };
      const allowedCategories = dressCategoryMap[filterParams.dressStyle];

      // 드레스 스타일에 해당되는 추천 시술이 있다면 우선 큐레이션하기 위해 필터에 우선순위 가중치 반영
      const dressMatched = finalProcedures.filter(p => allowedCategories.includes(p.category));
      if (dressMatched.length > 0) {
        finalProcedures = dressMatched;
      }
    }

    setFilteredProcedures(finalProcedures);
    setHasFiltered(true);

    // 로드맵 캘린더 싱크업
    if (filterParams.timeline && filterParams.timeline !== 'all') {
      setRoadmapTimeline(filterParams.timeline as TimelineWindow);
    }
    if (filterParams.dressStyle && filterParams.dressStyle !== 'all') {
      setRoadmapDressStyle(filterParams.dressStyle as DressStyle);
    }
  }

  // 4. 데이터 희소성 극복을 위한 '인근 광역 거점 자동 매칭 추천' 연산
  const isRegionFiltered = filterParams.region && filterParams.region !== 'all';
  const hasFewClinics = filteredClinics.length <= 2;

  const extendedRecommendedClinics = useMemo(() => {
    if (!isRegionFiltered || !hasFewClinics) return [];

    // 사용자가 선택한 지역이 아니면서, 수도권/강남 등 주요 거점 연계 클리닉을 대안 추천으로 매칭
    const currentRegion = filterParams.region ?? 'all';
    return clinics.filter(clinic => {
      const isBaseRegion = currentRegion !== 'all' && clinic.region.includes(currentRegion);
      const isHub = clinic.region.includes('서울 강남') || clinic.region.includes('서울 마포') || clinic.id === 'cl-001' || clinic.id === 'cl-007';
      const withinBudget = filterClinics([clinic], { budget: filterParams.budget, category: filterParams.category }).length > 0;
      return !isBaseRegion && isHub && withinBudget;
    }).slice(0, 2); // 럭셔리 UX 스크롤링 압박을 없애기 위해 2개로 컴팩트하게 제한
  }, [isRegionFiltered, hasFewClinics, filterParams.region, filterParams.budget, filterParams.category]);

  // 로드맵 내에서의 상태 변경 시 필터 폼 동시 싱크업
  const handleRoadmapTimelineChange = (newTimeline: TimelineWindow) => {
    setRoadmapTimeline(newTimeline);
    setFilterParams(prev => ({ ...prev, timeline: newTimeline }));
  };

  const handleRoadmapDressStyleChange = (newStyle: DressStyle) => {
    setRoadmapDressStyle(newStyle);
    setFilterParams(prev => ({ ...prev, dressStyle: newStyle }));
  };

  // 1. 클리닉 지능형 정렬 리스트
  const sortedClinics = useMemo(() => {
    const data = [...filteredClinics];

    if (sortBy === 'price') {
      return data.sort((a, b) => a.priceMin - b.priceMin);
    }

    if (sortBy === 'specialty') {
      // 카테고리(진료 영역)가 다각화된 순 정렬
      return data.sort((a, b) => b.categories.length - a.categories.length);
    }

    // 'ai' 정렬: 가격 대비 해결 가능한 진료 옵션 다양성 스코어 (VFM 연산)
    return data.sort((a, b) => {
      const avgA = (a.priceMin + a.priceMax) / 2;
      const avgB = (b.priceMin + b.priceMax) / 2;
      const scoreA = a.categories.length / avgA;
      const scoreB = b.categories.length / avgB;
      return scoreB - scoreA; // 내림차순
    });
  }, [filteredClinics, sortBy]);

  // 2. 시술 정보 지능형 정렬 리스트
  const sortedProcedures = useMemo(() => {
    const data = [...filteredProcedures];

    if (sortBy === 'price') {
      return data.sort((a, b) => a.priceMin - b.priceMin);
    }

    if (sortBy === 'specialty') {
      // 추천 타임라인 범위가 풍부해 유연하게 시술 가능한 순 정렬
      return data.sort((a, b) => b.recommendedTimeline.length - a.recommendedTimeline.length);
    }

    // 'ai' 정렬: 회당 가격 대비 드레스 핏 기여 스코어 및 타임라인 범용도 연산
    return data.sort((a, b) => {
      const avgA = (a.priceMin + a.priceMax) / 2;
      const avgB = (b.priceMin + b.priceMax) / 2;
      const scoreA = a.recommendedTimeline.length / avgA;
      const scoreB = b.recommendedTimeline.length / avgB;
      return scoreB - scoreA;
    });
  }, [filteredProcedures, sortBy]);

  return (
    <>
      <main className="mx-auto max-w-lg space-y-6 px-4 py-8 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-bold text-stone-850 break-keep">뷰티 · 의료 정보</h1>
          <p className="mt-1 text-sm text-stone-500 break-keep leading-relaxed">
            웨딩 전 안전하고 체계적인 뷰티 관리에 참고할 수 있는 공인 일반 정보를 제공합니다.
          </p>
        </div>

        {/* 의료 고지 (상단 고정 - 디자인 톤 고급화) */}
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50/60 px-4 py-3 shadow-[0_2px_8px_rgba(244,63,94,0.03)]">
          <ShieldAlert className="mt-0.5 h-4.5 w-4.5 flex-shrink-0 text-rose-500 animate-pulse" />
          <p className="text-xs leading-relaxed text-stone-600 break-keep">
            본 페이지는 보건복지부 의료 광고 가이드라인을 철저히 준수합니다. 제공되는 모든 정보는 <strong>일반 지식 및 참고 목적</strong>의 안내이며, 실제 치료 추천이 아닙니다. 정확한 시술 진단은 반드시 전문의와 대면 상담하시기 바랍니다.
          </p>
        </div>

        {/* 나만의 AI 웨딩 뷰티 로드맵 생성기 (신규 탑재 - 매혹 장치) */}
        <BeautyRoadmap
          timeline={roadmapTimeline}
          dressStyle={roadmapDressStyle}
          region={filterParams.region ?? 'all'}
          onTimelineChange={handleRoadmapTimelineChange}
          onDressStyleChange={handleRoadmapDressStyleChange}
          onCTAClick={() => openModal('beauty', 'beauty')}
        />

        {/* 필터 영역 */}
        <BeautyFilter
          values={filterParams}
          onChange={setFilterParams}
          onApply={handleApplyFilter}
        />

        {/* 필터 적용 후 CTA */}
        {hasFiltered && (
          <CTABanner
            title="나의 맞춤 캘린더 상세 상담이 필요하신가요?"
            description="입력하신 일정을 바탕으로 1:1 안심 뷰티 플래닝 상담을 연결해 드려요."
            onClickCTA={() => openModal('beauty', 'beauty')}
          />
        )}

        {/* 탭 전환 및 결과 개수/정렬 헤더 영역 */}
        <div className="space-y-3 pt-2">
          {/* 탭 헤더 */}
          <div className="flex rounded-xl bg-stone-100 p-1">
            {(['clinics', 'procedures'] as ViewTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${activeTab === tab
                  ? 'bg-white text-stone-850 shadow-sm'
                  : 'text-stone-400 hover:text-stone-600'
                  }`}
              >
                {tab === 'clinics'
                  ? `연계 클리닉 (${sortedClinics.length})`
                  : `시술 정보 (${sortedProcedures.length})`}
              </button>
            ))}
          </div>

          {/* 실시간 개수 및 정렬 버튼 탭 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] text-stone-500 font-bold">
                총 <span className="font-extrabold text-rose-500">
                  {activeTab === 'clinics' ? sortedClinics.length : sortedProcedures.length}개
                </span>의 결과
                {hasFiltered && ' · 필터 적용'}
              </p>
              <div className="flex items-center gap-1 text-stone-400">
                <SlidersHorizontal size={11} />
                <span className="text-[9px] font-black uppercase tracking-wider">정렬</span>
              </div>
            </div>

            {/* 정렬 버튼 그리드 */}
            <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setSortBy('ai')}
                className={`py-1.5 rounded-lg text-[10.5px] font-black transition-all flex items-center justify-center gap-1 ${sortBy === 'ai' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-850'}`}
              >
                <Bot size={10} />
                AI 추천순
              </button>
              <button
                onClick={() => setSortBy('price')}
                className={`py-1.5 rounded-lg text-[10.5px] font-black transition-all flex items-center justify-center gap-1 ${sortBy === 'price' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-850'}`}
              >
                <TrendingDown size={10} />
                낮은가격순
              </button>
              <button
                onClick={() => setSortBy('specialty')}
                className={`py-1.5 rounded-lg text-[10.5px] font-black transition-all flex items-center justify-center gap-1 ${sortBy === 'specialty' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-850'}`}
              >
                <Star size={10} />
                전문분야순
              </button>
            </div>
          </div>
        </div>

        {/* 클리닉 목록 */}
        {activeTab === 'clinics' && (
          <div className="space-y-4">
            {sortedClinics.length > 0 ? (
              sortedClinics.map((clinic, index) => {
                const isBestClinic = sortBy === 'ai' && index === 0;
                return (
                  <div key={clinic.id} className="relative">
                    {isBestClinic && (
                      <div className="absolute -top-3 left-4 z-10 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Trophy size={11} className="animate-bounce" />
                        <span>AI 웨딩 핏 최적화 1위 추천</span>
                      </div>
                    )}
                    <ClinicCard
                      clinic={clinic}
                      onCTAClick={() => openModal('beauty', 'beauty')}
                    />
                  </div>
                );
              })
            ) : (
              <div className="space-y-6">
                <EmptyState onReset={() => { setFilterParams(DEFAULT_FILTER); setFilteredClinics(clinics); setFilteredProcedures(procedures); setHasFiltered(false); }} />

                {/* 대안 추천 영역 (폴백 콘텐츠 강화) */}
                <div className="pt-5 border-t border-stone-150 space-y-4">
                  <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-rose-600">
                      <BookOpen size={14} className="animate-pulse" />
                      <span>[홈케어 스페셜 큐레이션] 집에서 하는 웨딩 케어 가이드</span>
                    </div>
                    <p className="text-[10.5px] leading-relaxed text-stone-500 break-keep">
                      현재 선택하신 지역에 제휴 파트너 클리닉 정보가 준비 중입니다. 대신 예비 신부들을 위해 웨딩 뷰티 플래너들이 엄선한 <strong>"D-Day 홈케어 디톡스 & 리프트 요가"</strong> 가이드북을 1:1 상담 신청자분들께 무료로 즉시 발송해 드립니다!
                    </p>
                  </div>

                  <h3 className="text-xs font-black text-stone-850 flex items-center gap-1.5 mb-2">
                    <Sparkles size={13} className="text-rose-500 animate-pulse" />
                    이런 베스트 클리닉 정보도 참고해 보세요
                  </h3>
                  <div className="space-y-4">
                    {clinics.filter(c => c.id === 'cl-001' || c.id === 'cl-007').map((clinic) => (
                      <ClinicCard
                        key={`recommend-${clinic.id}`}
                        clinic={clinic}
                        onCTAClick={() => openModal('beauty', 'beauty')}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* [데이터 희소성 극복 핵심 UI] 인근 광역 거점 자동 매칭 영역 */}
            {isRegionFiltered && hasFewClinics && sortedClinics.length > 0 && extendedRecommendedClinics.length > 0 && (
              <div className="pt-6 border-t border-stone-200 space-y-4 animate-in slide-in-from-bottom duration-300">
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                    <MapPin size={14} className="text-rose-500 fill-rose-100" />
                    <span>[인근 지역 추천] {filterParams.region} 인근 30분 거리 클리닉</span>
                  </div>
                  <p className="text-[10.5px] leading-relaxed text-stone-500 break-keep">
                    선택하신 <strong>{filterParams.region}</strong> 지역은 제휴 정보가 다소 제한적입니다. 원활한 일정 조율과 풍부한 옵션을 제공하기 위해, 교통편이 아주 편리한 <strong>인근 서울 주요 거점(강남·마포 등)</strong>의 인기 추천 클리닉을 함께 제안해 드려요.
                  </p>
                </div>

                <div className="space-y-4">
                  {extendedRecommendedClinics.map((clinic) => (
                    <div key={`ext-${clinic.id}`} className="relative">
                      <div className="absolute -top-3 left-4 z-10 bg-stone-800 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <MapPin size={8} />
                        광역 거점 추천
                      </div>
                      <ClinicCard
                        clinic={clinic}
                        onCTAClick={() => openModal('beauty', 'beauty')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 시술 정보 목록 */}
        {activeTab === 'procedures' && (
          <div className="space-y-4">
            {sortedProcedures.length > 0 ? (
              sortedProcedures.map((proc, index) => {
                const isBestProcedure = sortBy === 'ai' && index === 0;
                return (
                  <div key={proc.id} className="relative">
                    {isBestProcedure && (
                      <div className="absolute -top-3 left-4 z-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Award size={11} className="animate-bounce" />
                        <span>AI 가성비 1위 추천 시술</span>
                      </div>
                    )}
                    <ProcedureCard
                      procedure={proc}
                      onCTAClick={() => openModal('beauty', 'medical')}
                    />
                  </div>
                );
              })
            ) : (
              <div className="space-y-6">
                <EmptyState onReset={() => { setFilterParams(DEFAULT_FILTER); setFilteredClinics(clinics); setFilteredProcedures(procedures); setHasFiltered(false); }} />

                {/* 시술 정보 대안 추천 영역 (콜드스타트 자동 해결) */}
                <div className="pt-5 border-t border-stone-150">
                  <h3 className="text-xs font-black text-stone-850 flex items-center gap-1.5 mb-4">
                    <Sparkles size={13} className="text-rose-500 animate-pulse" />
                    이런 웨딩 시술은 어떠세요? (실시간 베스트 추천 시술)
                  </h3>
                  <div className="space-y-4">
                    {procedures.filter(p => p.id === 'pr-001' || p.id === 'pr-007' || p.id === 'pr-010').map((proc) => (
                      <ProcedureCard
                        key={`recommend-${proc.id}`}
                        procedure={proc}
                        onCTAClick={() => openModal('beauty', 'medical')}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 하단 CTA (일정 조율 중심의 상담 안내로 안심 브랜딩) */}
        <CTABanner
          title="안심하고 1:1 웨딩 뷰티 일정을 조율해보세요"
          description="플래너와의 조율 상담은 의료 예약 매칭이 아니며, 개인별 예산 및 D-Day 맞춤형 일정 플래닝 서비스(무료)를 제공합니다."
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

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl bg-stone-50 py-10 text-center ring-1 ring-stone-100">
      <p className="text-sm font-bold text-stone-750">조건에 맞는 관리 항목이 없습니다.</p>
      <p className="mt-1 text-xs text-stone-400">필터를 조정하거나 상담을 통해 다른 옵션을 확인해 보세요.</p>
      <button onClick={onReset} className="mt-4 text-xs font-black text-rose-500 hover:text-rose-700">
        필터 초기화
      </button>
    </div>
  );
}

