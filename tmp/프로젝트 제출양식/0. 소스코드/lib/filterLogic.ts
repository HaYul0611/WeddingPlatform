import { WeddingPackage, WeddingStyle, WeddingRegion } from '@/types/wedding';
import { Clinic, Procedure, BeautyCategory, TimelineWindow } from '@/types/healthcare';
import { BudgetRange } from '@/types/consultation';

// ───────────────────────────────
// Budget Range → 숫자 변환
// ───────────────────────────────
const BUDGET_MAP: Record<BudgetRange, { min: number; max: number }> = {
  under_500: { min: 0, max: 500000 },
  '500_1000': { min: 500000, max: 1000000 },
  '1000_3000': { min: 1000000, max: 3000000 },
  over_3000: { min: 3000000, max: Infinity },
  undecided: { min: 0, max: Infinity },
};

// ───────────────────────────────
// Wedding Package 필터
// ───────────────────────────────
export interface WeddingFilterParams {
  budget?: BudgetRange;
  style?: WeddingStyle | 'all';
  region?: WeddingRegion | 'all';
}

export function filterWeddingPackages(
  packages: WeddingPackage[],
  params: WeddingFilterParams,
): WeddingPackage[] {
  const { budget, style, region } = params;
  const budgetRange = budget ? BUDGET_MAP[budget] : BUDGET_MAP.undecided;

  return packages.filter((pkg) => {
    const withinBudget =
      pkg.priceMin <= budgetRange.max && pkg.priceMax >= budgetRange.min;

    const matchesStyle = !style || style === 'all' || pkg.style === style;

    const matchesRegion = !region || region === 'all' || pkg.region === region;

    return withinBudget && matchesStyle && matchesRegion;
  });
}

// ───────────────────────────────
// Clinic 필터
// ───────────────────────────────
export interface ClinicFilterParams {
  budget?: BudgetRange;
  category?: BeautyCategory | 'all';
}

export function filterClinics(
  clinics: Clinic[],
  params: ClinicFilterParams,
): Clinic[] {
  const { budget, category } = params;
  const budgetRange = budget ? BUDGET_MAP[budget] : BUDGET_MAP.undecided;

  return clinics.filter((clinic) => {
    const withinBudget =
      clinic.priceMin <= budgetRange.max && clinic.priceMax >= budgetRange.min;

    const matchesCategory =
      !category ||
      category === 'all' ||
      clinic.categories.includes(category);

    return withinBudget && matchesCategory;
  });
}

// ───────────────────────────────
// Procedure 필터
// ───────────────────────────────
export interface ProcedureFilterParams {
  budget?: BudgetRange;
  category?: BeautyCategory | 'all';
  timeline?: TimelineWindow | 'all';
}

export function filterProcedures(
  procedures: Procedure[],
  params: ProcedureFilterParams,
): Procedure[] {
  const { budget, category, timeline } = params;
  const budgetRange = budget ? BUDGET_MAP[budget] : BUDGET_MAP.undecided;

  return procedures.filter((proc) => {
    const withinBudget =
      proc.priceMin <= budgetRange.max && proc.priceMax >= budgetRange.min;

    const matchesCategory =
      !category || category === 'all' || proc.category === category;

    const matchesTimeline =
      !timeline ||
      timeline === 'all' ||
      proc.recommendedTimeline.includes(timeline);

    return withinBudget && matchesCategory && matchesTimeline;
  });
}

// ───────────────────────────────
// 결과 없을 때 빈 상태 체크 유틸
// ───────────────────────────────
export function hasResults<T>(items: T[]): boolean {
  return items.length > 0;
}
