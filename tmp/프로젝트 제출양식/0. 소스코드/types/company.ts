export type CompanyCategory = 'wedding' | 'beauty' | 'healthcare' | 'medical';

export interface Company {
  id: string;
  name: string;
  category: CompanyCategory;
  phone: string | null;
  kakao_link: string | null;
  description: string | null;
  region: string | null;
  budget_min: number | null;   // 만원 단위
  budget_max: number | null;
  is_active: boolean;
  created_at: string;
}
