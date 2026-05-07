// ───────────────────────────────
// Healthcare
// ───────────────────────────────
export type FitnessGoal = 'diet' | 'tone' | 'maintain';
export type ActivityLevel = 'low' | 'medium' | 'high';

export interface BodyInfo {
  height: number;               // cm
  weight: number;               // kg
  goal: FitnessGoal;
  activityLevel: ActivityLevel;
  weddingDday: number;          // 결혼까지 남은 일수
  region: string;               // 활동 지역 (서울, 경기 등)
}

export interface RoutineOutput {
  bmi: number;
  workoutDaysPerWeek: number;
  workoutFocus: string[];
  dietGuidelines: string[];
  recommendedCompanies: HealthcareCompany[];
  disclaimer: string;           // 항상 포함
}

export interface HealthcareCompany {
  id: string;
  name: string;
  type: 'pt' | 'pilates' | 'yoga';
  region: string;
  description: string;
  tags: string[];
  image?: string;
}

// ───────────────────────────────
// Beauty / Medical
// ───────────────────────────────
export type BeautyCategory =
  | 'skincare'
  | 'laser'
  | 'filler'
  | 'lifting'
  | 'diet_medical'
  | 'dental';

export type TimelineWindow =
  | 'over_6months'
  | '3_6months'
  | '1_3months'
  | 'under_1month';

export interface Clinic {
  id: string;
  name: string;
  region: string;
  categories: BeautyCategory[];
  priceRangeLabel: string;      // "50,000 ~ 200,000원" (표시용 문자열)
  priceMin: number;             // 필터용 숫자
  priceMax: number;
  description: string;
  tags: string[];
}

export interface Procedure {
  id: string;
  name: string;
  category: BeautyCategory;
  priceMin: number;
  priceMax: number;
  priceRangeLabel: string;
  recommendedTimeline: TimelineWindow[];  // 이 시술을 고려할 수 있는 시기
  description: string;
  notes: string;                // 일반 정보 고지용
}
