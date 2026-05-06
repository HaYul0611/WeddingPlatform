export type LeadStatus   = 'new' | 'contacted' | 'completed';
export type LeadCategory = 'wedding' | 'beauty' | 'healthcare' | 'medical';
export type BudgetKey    = 'undecided' | 'under_500' | '500_1000' | '1000_3000' | 'over_3000';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  category: LeadCategory;
  budget: BudgetKey;
  message?: string;
  source_page: string;
  created_at: string;
  status: LeadStatus;
}

export interface Company {
  id: string;
  name: string;
  category: LeadCategory;
  phone: string | null;
  kakao_link: string | null;
  description: string | null;
  region: string | null;
  budget_min: number | null;
  budget_max: number | null;
  rating: number | null;
  review_count: number | null;
  is_active: boolean;
  created_at: string;
}

export interface StatsData {
  total: number;
  new: number;
  contacted: number;
  completed: number;
}

export interface PaginatedLeads {
  data: Lead[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LeadFilters {
  status: LeadStatus | 'all';
  category: LeadCategory | 'all';
  search: string;
}
