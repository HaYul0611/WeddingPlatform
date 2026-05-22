'use client';

import { useState } from 'react';
import { WeddingFilterParams } from '@/lib/filterLogic';
import { BudgetRange } from '@/types/consultation';
import { WeddingStyle, WeddingRegion } from '@/types/wedding';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface WeddingFilterProps {
  values: WeddingFilterParams;
  onChange: (params: WeddingFilterParams) => void;
  onApply: () => void;
}

const BUDGET_OPTIONS: { value: BudgetRange | 'all'; label: string }[] = [
  { value: 'undecided', label: '전체' },
  { value: 'under_500', label: '50만원 미만' },
  { value: '500_1000',  label: '50~100만원' },
  { value: '1000_3000', label: '100~300만원' },
  { value: 'over_3000', label: '300만원 이상' },
];

const STYLE_OPTIONS: { value: WeddingStyle | 'all'; label: string }[] = [
  { value: 'all',     label: '전체' },
  { value: 'modern',  label: '모던' },
  { value: 'classic', label: '클래식' },
  { value: 'garden',  label: '가든' },
  { value: 'minimal', label: '미니멀' },
];

const REGION_OPTIONS: { value: WeddingRegion | 'all'; label: string }[] = [
  { value: 'all',      label: '전체' },
  { value: 'seoul',    label: '서울' },
  { value: 'gyeonggi', label: '경기' },
  { value: 'busan',    label: '부산' },
  { value: 'daegu',    label: '대구' },
  { value: 'other',    label: '기타' },
];

// 대한민국 대표 거점 좌표 정의 (유클리드 최단거리 매칭용)
const REGION_COORDINATES: Record<Exclude<WeddingRegion, 'all'>, { lat: number; lng: number; name: string }> = {
  seoul:    { lat: 37.5665, lng: 126.9780, name: '서울' },
  gyeonggi: { lat: 37.2750, lng: 127.0090, name: '경기' },
  busan:    { lat: 35.1796, lng: 129.0756, name: '부산' },
  daegu:    { lat: 35.8714, lng: 128.6014, name: '대구' },
  other:    { lat: 36.5000, lng: 128.0000, name: '기타' }, // 임의 중심지
};

export default function WeddingFilter({ values, onChange, onApply }: WeddingFilterProps) {
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'searching' | 'success' | 'error'>('idle');
  const [gpsMessage, setGpsMessage] = useState('');

  // GPS 실시간 내 위치 거리연산 매칭 함수 (유료 API 필요 없이 100% 무료 작동)
  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsMessage('이 브라우저는 GPS를 지원하지 않습니다.');
      return;
    }

    setGpsStatus('searching');
    setGpsMessage('위치 측정 중...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // 가장 거리가 가까운 거점 도시 찾기
        let closestRegion: WeddingRegion = 'other';
        let minDistance = Infinity;

        Object.entries(REGION_COORDINATES).forEach(([regionKey, coords]) => {
          // 피타고라스 직선 거리 연산 (유클리드 기하학)
          const distance = Math.sqrt(
            Math.pow(latitude - coords.lat, 2) + Math.pow(longitude - coords.lng, 2)
          );

          if (distance < minDistance) {
            minDistance = distance;
            closestRegion = regionKey as WeddingRegion;
          }
        });

        // 만약 최단거리가 1.5도(약 150km) 이상 떨어져 있다면 '기타'로 귀속
        if (minDistance > 1.5) {
          closestRegion = 'other';
        }

        // 해당 지역으로 자동 활성화 처리
        onChange({ ...values, region: closestRegion });
        setGpsStatus('success');
        setGpsMessage(`내 위치 판정: ${REGION_COORDINATES[closestRegion as Exclude<WeddingRegion, 'all'>]?.name || '기타'}`);
        
        // 3초 후 메세지 초기화
        setTimeout(() => {
          setGpsStatus('idle');
          setGpsMessage('');
        }, 3000);
      },
      (error) => {
        setGpsStatus('error');
        if (error.code === error.PERMISSION_DENIED) {
          setGpsMessage('위치 권한이 거부되었습니다.');
        } else {
          setGpsMessage('위치 측정에 실패했습니다.');
        }
        setTimeout(() => setGpsStatus('idle'), 3000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100 animate-in fade-in duration-300">
      <h3 className="mb-4 text-sm font-bold text-stone-850">필터</h3>

      <div className="space-y-5">
        {/* 예산 */}
        <FilterRow label="예산">
          <ChipGroup
            options={BUDGET_OPTIONS}
            selected={values.budget ?? 'undecided'}
            onSelect={(v) => onChange({ ...values, budget: v as BudgetRange })}
          />
        </FilterRow>

        {/* 스타일 */}
        <FilterRow label="스타일">
          <ChipGroup
            options={STYLE_OPTIONS}
            selected={values.style ?? 'all'}
            onSelect={(v) => onChange({ ...values, style: v as WeddingStyle | 'all' })}
          />
        </FilterRow>

        {/* 지역 (GPS 실시간 내 위치 버튼 우측에 예쁘게 신설) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-stone-400">지역</p>
            
            {/* GPS 내 위치 자동 매칭 스위치 */}
            <button
              type="button"
              onClick={handleGPSLocation}
              disabled={gpsStatus === 'searching'}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-black transition-all ${
                gpsStatus === 'searching' 
                  ? 'bg-stone-100 text-stone-400' 
                  : gpsStatus === 'success'
                  ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200/50'
                  : gpsStatus === 'error'
                  ? 'bg-stone-50 text-stone-500 ring-1 ring-stone-200/50'
                  : 'bg-stone-900 text-white hover:bg-stone-800 shadow-sm active:scale-95'
              }`}
            >
              {gpsStatus === 'searching' ? (
                <Loader2 size={12} className="animate-spin text-stone-400" />
              ) : (
                <Navigation size={11} className={gpsStatus === 'success' ? 'animate-bounce' : ''} />
              )}
              <span>{gpsMessage || '📍 내 위치 기준'}</span>
            </button>
          </div>

          <ChipGroup
            options={REGION_OPTIONS}
            selected={values.region ?? 'all'}
            onSelect={(v) => onChange({ ...values, region: v as WeddingRegion | 'all' })}
          />
        </div>

        <button
          onClick={onApply}
          className="w-full rounded-xl bg-stone-900 py-3.5 text-sm font-bold text-white hover:bg-stone-800 transition-colors shadow-md active:scale-[0.99] flex items-center justify-center gap-1.5"
        >
          <MapPin size={14} />
          <span>조건 필터 적용</span>
        </button>
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-stone-400">{label}</p>
      {children}
    </div>
  );
}

function ChipGroup<T extends string>({
  options, selected, onSelect,
}: {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
            selected === opt.value
              ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-sm'
              : 'border-stone-200 text-stone-500 hover:border-rose-300 hover:text-stone-750'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
