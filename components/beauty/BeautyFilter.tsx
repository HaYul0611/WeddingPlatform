'use client';

import { ProcedureFilterParams } from '@/lib/filterLogic';
import { BudgetRange } from '@/types/consultation';
import { BeautyCategory, TimelineWindow } from '@/types/healthcare';
import { DressStyle } from './BeautyRoadmap';

export interface ExtendedFilterParams extends ProcedureFilterParams {
  region?: string;
  dressStyle?: DressStyle | 'all';
}

interface BeautyFilterProps {
  values: ExtendedFilterParams;
  onChange: (params: ExtendedFilterParams) => void;
  onApply: () => void;
}

const CATEGORY_OPTIONS: { value: BeautyCategory | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'skincare', label: '스킨케어' },
  { value: 'laser', label: '레이저' },
  { value: 'filler', label: '필러' },
  { value: 'lifting', label: '리프팅' },
  { value: 'diet_medical', label: '체중관리' },
  { value: 'dental', label: '치과' },
];

const BUDGET_OPTIONS: { value: BudgetRange; label: string }[] = [
  { value: 'undecided', label: '전체' },
  { value: 'under_500', label: '50만원 미만' },
  { value: '500_1000', label: '50~100만원' },
  { value: '1000_3000', label: '100~300만원' },
  { value: 'over_3000', label: '300만원 이상' },
];

const TIMELINE_OPTIONS: { value: TimelineWindow | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'over_6months', label: '6개월 이상' },
  { value: '3_6months', label: '3~6개월' },
  { value: '1_3months', label: '1~3개월' },
  { value: 'under_1month', label: '1개월 미만' },
];

const REGION_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: '서울', label: '서울' },
  { value: '경기', label: '경기' },
  { value: '부산', label: '부산' },
  { value: '대구', label: '대구' },
  { value: '기타', label: '기타' },
];

const DRESS_OPTIONS: { value: DressStyle | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'off_shoulder', label: '오프숄더' },
  { value: 'mermaid', label: '머메이드' },
  { value: 'backless', label: '백리스' },
  { value: 'minimal', label: '미니멀' },
];

export default function BeautyFilter({ values, onChange, onApply }: BeautyFilterProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100 animate-in fade-in duration-300">
      <h3 className="mb-4 text-sm font-semibold text-stone-700">필터</h3>

      <div className="space-y-4">
        {/* 분야 */}
        <div>
          <p className="mb-2 text-xs font-semibold text-stone-400">분야</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={values.category === opt.value || (!values.category && opt.value === 'all')}
                onSelect={() => onChange({ ...values, category: opt.value as BeautyCategory | 'all' })}
              />
            ))}
          </div>
        </div>

        {/* 희망 지역 필터 (신규 통합) */}
        <div>
          <p className="mb-2 text-xs font-semibold text-stone-400">희망 지역</p>
          <div className="flex flex-wrap gap-2">
            {REGION_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={values.region === opt.value || (!values.region && opt.value === 'all')}
                onSelect={() => onChange({ ...values, region: opt.value })}
              />
            ))}
          </div>
        </div>

        {/* 예산 */}
        <div>
          <p className="mb-2 text-xs font-semibold text-stone-400">예산</p>
          <div className="flex flex-wrap gap-2">
            {BUDGET_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={values.budget === opt.value || (!values.budget && opt.value === 'undecided')}
                onSelect={() => onChange({ ...values, budget: opt.value })}
              />
            ))}
          </div>
        </div>

        {/* 타임라인 */}
        <div>
          <p className="mb-2 text-xs font-semibold text-stone-400">결혼까지 남은 기간</p>
          <div className="flex flex-wrap gap-2">
            {TIMELINE_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={values.timeline === opt.value || (!values.timeline && opt.value === 'all')}
                onSelect={() => onChange({ ...values, timeline: opt.value as TimelineWindow | 'all' })}
              />
            ))}
          </div>
        </div>

        {/* 드레스 스타일 필터 (신규 통합) */}
        <div>
          <p className="mb-2 text-xs font-semibold text-stone-400">웨딩드레스 스타일</p>
          <div className="flex flex-wrap gap-2">
            {DRESS_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={values.dressStyle === opt.value || (!values.dressStyle && opt.value === 'all')}
                onSelect={() => onChange({ ...values, dressStyle: opt.value as DressStyle | 'all' })}
              />
            ))}
          </div>
        </div>

        <button
          onClick={onApply}
          className="w-full rounded-xl bg-stone-850 py-3 text-sm font-semibold text-white hover:bg-stone-750 transition-colors shadow-sm"
        >
          조건 필터 적용
        </button>
      </div>
    </div>
  );
}

function Chip({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${selected
          ? 'border-rose-400 bg-rose-50 text-rose-600 font-bold'
          : 'border-stone-200 text-stone-500 hover:border-rose-200'
        }`}
    >
      {label}
    </button>
  );
}

