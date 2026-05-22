import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyNewLead } from '@/lib/notifier';
import { calcLeadScore } from '@/lib/lead-scoring';
import type { Lead, LeadCategory, LeadStatus, BudgetKey } from '@/types/crm';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, category, budget, message, sourcePage, timestamp, companyId = 'main' } = body;

    // 1) 스코어 계산
    const tempLead: Lead = {
      id: 'temp',
      name,
      phone,
      category: category as LeadCategory,
      budget: budget as BudgetKey,
      message: message ?? '',
      source_page: sourcePage,
      created_at: timestamp,
      status: 'new' as LeadStatus,
    };
    const score = calcLeadScore(tempLead);

    // 2) DB 저장
    const supabase = getSupabase();
    const { data: leadData, error: dbError } = await supabase
      .from('leads')
      .insert([{
        name,
        phone,
        category,
        budget,
        message: message ?? '',
        source_page: sourcePage,
        created_at: timestamp,
        status: 'new',
        score: score,
        company_id: companyId // 업체 식별자 할당
      }])
      .select()
      .single();

    if (dbError) {
      console.error('[Lead API] DB Error:', dbError.message);
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    const leadId = leadData.id;

    // 3) 활동 이력 생성 (이모지 제거 버전)
    await supabase.from('lead_activities').insert([{
      lead_id: String(leadId),
      company_id: companyId,
      action: 'status_change',
      to_status: 'new',
      note: '새로운 소중한 인연이 닿았습니다. 상담 준비를 시작합니다.'
    }]);

    // 4) 실시간 알림 발송
    await notifyNewLead({
      name,
      phone,
      category,
      budget,
      message: message ?? '',
      sourcePage,
    });

    // 5) 알림톡 발송 완료 이력 (시연용 연출, 이모지 제거)
    await supabase.from('lead_activities').insert([{
      lead_id: String(leadId),
      company_id: companyId,
      action: 'note_added',
      note: `${name} 고객님께 '웨딩케어 맞춤 안내' 알림톡이 성공적으로 전달되었습니다.`
    }]);

    return NextResponse.json({ success: true, id: leadId }, { status: 201 });
  } catch (error: any) {
    console.error('[Lead API] Unexpected Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
