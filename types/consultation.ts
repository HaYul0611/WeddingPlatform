export type ConsultationCategory =
  | 'wedding'
  | 'healthcare'
  | 'beauty'
  | 'medical';

export type BudgetRange =
  | 'under_500'      // 50만원 미만
  | '500_1000'       // 50~100만원
  | '1000_3000'      // 100~300만원
  | 'over_3000'      // 300만원 이상
  | 'undecided';

export interface LeadData {
  id: string;                     // crypto.randomUUID()
  timestamp: string;              // ISO 8601
  sourcePage: string;             // 어느 페이지에서 제출됐는지
  category: ConsultationCategory;
  name: string;
  phone: string;
  budget: BudgetRange;
  message?: string;
}
