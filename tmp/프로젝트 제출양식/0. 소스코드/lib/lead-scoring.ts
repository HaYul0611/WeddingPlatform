import type { Lead, BudgetKey } from '@/types/crm';

// ─────────────────────────────────────────
// 배점표
// ─────────────────────────────────────────
const BUDGET_SCORE: Record<BudgetKey, number> = {
  '1000_3000': 25, // 고예산 → 전환 가능성 높음
  over_3000:   22,
  '500_1000':  20,
  under_500:   12,
  undecided:    8,
};

const SOURCE_SCORE: Record<string, number> = {
  hero:                25,
  'landing-bottom':    24,
  'feature-웨딩':      22,
  'feature-뷰티':      22,
  'feature-건강관리':  22,
  'feature-의료':      20,
  dashboard:           18,
  wedding:             18,
  beauty:              18,
  healthcare:          18,
  'consultation-page': 15,
  'floating-cta':      14,
  header:              13,
  global:              10,
};

// ─────────────────────────────────────────
// 점수 계산
// ─────────────────────────────────────────
export function calcLeadScore(lead: Lead): number {
  let score = 0;

  // 1) 예산 적합도 (0~25)
  score += BUDGET_SCORE[lead.budget] ?? 8;

  // 2) 메시지 내용 (0~25)
  const msg = (lead.message ?? '').trim();
  if (msg.length > 50) score += 25;
  else if (msg.length > 10) score += 18;
  else if (msg.length > 0) score += 10;
  else score += 5;

  // 3) 유입 경로 (0~25)
  score += SOURCE_SCORE[lead.source_page] ?? 10;

  // 4) 신선도 — 접수 시간 기준 (0~25)
  const ageHours = (Date.now() - new Date(lead.created_at).getTime()) / 3600000;
  if (ageHours < 24)   score += 25;
  else if (ageHours < 72)  score += 20;
  else if (ageHours < 168) score += 15;
  else if (ageHours < 720) score += 10;
  else score += 5;

  return Math.min(100, Math.max(0, score));
}

// ─────────────────────────────────────────
// 점수 라벨 / 색상
// ─────────────────────────────────────────
export function getScoreConfig(score: number): {
  label: string;
  color: string;
  bg: string;
  bar: string;
} {
  if (score >= 80) return { label: '최우선',  color: 'text-emerald-700', bg: 'bg-emerald-50', bar: 'bg-emerald-500' };
  if (score >= 60) return { label: '우선',    color: 'text-blue-700',    bg: 'bg-blue-50',    bar: 'bg-blue-500'    };
  if (score >= 40) return { label: '보통',    color: 'text-amber-700',   bg: 'bg-amber-50',   bar: 'bg-amber-500'   };
  return              { label: '낮음',    color: 'text-slate-500',   bg: 'bg-slate-50',   bar: 'bg-slate-400'   };
}
