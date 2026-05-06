'use client';

import { Clinic, Procedure } from '@/types/healthcare';

const CATEGORY_LABEL: Record<string, string> = {
  skincare:     '스킨케어',
  laser:        '레이저',
  filler:       '필러',
  lifting:      '리프팅',
  diet_medical: '체중관리',
  dental:       '치과',
};

const TIMELINE_LABEL: Record<string, string> = {
  over_6months: '6개월 이상 전',
  '3_6months':  '3~6개월 전',
  '1_3months':  '1~3개월 전',
  under_1month: '1개월 이내',
};

// ───────────────────────────────
// ClinicCard
// ───────────────────────────────
interface ClinicCardProps {
  clinic: Clinic;
  onCTAClick: () => void;
}

export function ClinicCard({ clinic, onCTAClick }: ClinicCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {clinic.categories.map((c) => (
          <span key={c} className="rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-medium text-pink-500">
            {CATEGORY_LABEL[c]}
          </span>
        ))}
      </div>

      <p className="mb-0.5 text-xs text-stone-400">{clinic.region}</p>
      <h3 className="mb-2 text-base font-semibold text-stone-800">{clinic.name}</h3>
      <p className="mb-3 text-sm font-medium text-rose-500">{clinic.priceRangeLabel}</p>
      <p className="mb-4 text-xs leading-relaxed text-stone-400">{clinic.description}</p>

      {/* 정보 고지 */}
      <p className="mb-4 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-400">
        ℹ 이 정보는 일반적인 안내 목적으로 제공되며, 의료 추천이 아닙니다.
      </p>

      <button
        onClick={onCTAClick}
        className="w-full rounded-xl border border-rose-300 py-2.5 text-sm font-semibold text-rose-500 transition-all hover:bg-rose-50"
      >
        상담 문의하기
      </button>
    </div>
  );
}

// ───────────────────────────────
// ProcedureCard
// ───────────────────────────────
interface ProcedureCardProps {
  procedure: Procedure;
  onCTAClick: () => void;
}

export function ProcedureCard({ procedure, onCTAClick }: ProcedureCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-medium text-pink-500">
          {CATEGORY_LABEL[procedure.category]}
        </span>
      </div>

      <h3 className="mb-1 text-base font-semibold text-stone-800">{procedure.name}</h3>
      <p className="mb-3 text-sm font-medium text-rose-500">{procedure.priceRangeLabel}</p>

      {/* 권장 타임라인 */}
      <div className="mb-3">
        <p className="mb-1.5 text-xs text-stone-400">고려할 수 있는 시기</p>
        <div className="flex flex-wrap gap-1.5">
          {procedure.recommendedTimeline.map((t) => (
            <span key={t} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-600">
              {TIMELINE_LABEL[t]}
            </span>
          ))}
        </div>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-stone-500">{procedure.description}</p>

      {/* 면책 고지 */}
      <p className="mb-4 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-400">
        ⚠ {procedure.notes}
      </p>

      <button
        onClick={onCTAClick}
        className="w-full rounded-xl border border-rose-300 py-2.5 text-sm font-semibold text-rose-500 transition-all hover:bg-rose-50"
      >
        상담 문의하기
      </button>
    </div>
  );
}
