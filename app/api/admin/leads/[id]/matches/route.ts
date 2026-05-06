/**
 * GET /api/admin/leads/[id]/matches
 *
 * 매칭 로직:
 *   1차: category 일치 (필수)
 *   2차: 예산 범위 겹침 (선택적 필터 - budget이 undecided면 전체)
 *   정렬: budget_min ASC (저렴한 순)
 *   최대 반환: 5건
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidSession } from '../../../auth/route';

// 리드 budget key → 만원 단위 숫자 범위
const BUDGET_RANGE: Record<string, { min: number; max: number }> = {
  under_500:   { min: 0,   max: 50  },
  '500_1000':  { min: 50,  max: 100 },
  '1000_3000': { min: 100, max: 300 },
  over_3000:   { min: 300, max: 99999 },
  undecided:   { min: 0,   max: 99999 },
};

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = req.cookies.get('admin_session')?.value;
  if (!isValidSession(session)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const supabase = getSupabase();

    // 1) 리드 조회
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('category, budget')
      .eq('id', id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const budgetRange = BUDGET_RANGE[lead.budget] ?? BUDGET_RANGE.undecided;

    // 2) 카테고리 일치 업체 조회
    let query = supabase
      .from('companies')
      .select('*')
      .eq('category', lead.category)
      .eq('is_active', true)
      .order('budget_min', { ascending: true })
      .limit(5);

    // 3) 예산 오버랩 필터 (undecided면 스킵)
    if (lead.budget !== 'undecided') {
      // company.budget_min <= lead.budget_max AND company.budget_max >= lead.budget_min
      // null 허용: budget_min/max가 null인 업체도 포함
      query = query
        .or(`budget_min.lte.${budgetRange.max},budget_min.is.null`)
        .or(`budget_max.gte.${budgetRange.min},budget_max.is.null`);
    }

    const { data: companies, error: companyError } = await query;

    if (companyError) {
      console.error('[Matches API]', companyError.message);
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: companies ?? [],
      meta: {
        lead_category: lead.category,
        lead_budget:   lead.budget,
        matched_count: companies?.length ?? 0,
      },
    });
  } catch (e) {
    console.error('[Matches API] Unexpected:', e);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
