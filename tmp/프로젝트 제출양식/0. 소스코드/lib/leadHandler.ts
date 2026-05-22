import { LeadData, ConsultationCategory, BudgetRange } from '@/types/consultation';

// ───────────────────────────────
// 리드 생성
// ───────────────────────────────
export function createLead(
  fields: Omit<LeadData, 'id' | 'timestamp'>,
): LeadData {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...fields,
  };
}

// ───────────────────────────────
// 리드 제출 → POST /api/lead
// ───────────────────────────────
export async function submitLead(lead: LeadData): Promise<{ success: boolean }> {
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });

    if (!res.ok) {
      console.error('[Lead API] Non-2xx response:', res.status);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('[Lead Submit Error]', error);
    return { success: false };
  }
}

// ───────────────────────────────
// 저장된 리드 조회 (디버깅용)
// ───────────────────────────────
export function getLocalLeads(): LeadData[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem('wcp_leads');
    return raw ? (JSON.parse(raw) as LeadData[]) : [];
  } catch {
    return [];
  }
}

// ───────────────────────────────
// 폼 기본값 생성 헬퍼
// ───────────────────────────────
export function createDefaultFormValues(
  sourcePage: string,
  category?: ConsultationCategory,
): Partial<LeadData> {
  return {
    sourcePage,
    category: category ?? 'wedding',
    budget: 'undecided' as BudgetRange,
    message: '',
  };
}
