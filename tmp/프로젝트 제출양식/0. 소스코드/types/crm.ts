export type LeadStatus = 'new' | 'qualified' | 'matched' | 'contacted' | 'completed' | 'lost';
export type LeadCategory = 'wedding' | 'beauty' | 'healthcare' | 'medical';
export type BudgetKey = 'undecided' | 'under_500' | '500_1000' | '1000_3000' | 'over_3000';

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

export interface ActivityLog {
  id: string;
  lead_id: string;
  action: 'status_change' | 'matched' | 'note_added';
  from_status?: LeadStatus;
  to_status?: LeadStatus;
  note?: string;
  created_at: string;
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
  qualified: number;
  matched: number;
  contacted: number;
  completed: number;
  lost: number;
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
