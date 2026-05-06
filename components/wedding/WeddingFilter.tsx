'use client';

import { WeddingFilterParams } from '@/lib/filterLogic';
import { BudgetRange } from '@/types/consultation';
import { WeddingStyle, WeddingRegion } from '@/types/wedding';

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

export default function WeddingFilter({ values, onChange, onApply }: WeddingFilterProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
      <h3 className="mb-4 text-sm font-semibold text-stone-700">필터</h3>

      <div className="space-y-4">
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

        {/* 지역 */}
        <FilterRow label="지역">
          <ChipGroup
            options={REGION_OPTIONS}
            selected={values.region ?? 'all'}
            onSelect={(v) => onChange({ ...values, region: v as WeddingRegion | 'all' })}
          />
        </FilterRow>

        <button
          onClick={onApply}
          className="w-full rounded-xl bg-stone-800 py-3 text-sm font-semibold text-white hover:bg-stone-700 transition-colors"
        >
          필터 적용
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
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
            selected === opt.value
              ? 'border-rose-400 bg-rose-50 text-rose-600'
              : 'border-stone-200 text-stone-500 hover:border-rose-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
