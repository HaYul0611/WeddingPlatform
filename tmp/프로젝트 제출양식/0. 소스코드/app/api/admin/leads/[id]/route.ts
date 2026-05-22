import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidSession } from '@/lib/auth';

const VALID_STATUSES = ['new', 'contacted', 'completed'] as const;
type Status = typeof VALID_STATUSES[number];

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = req.cookies.get('admin_session')?.value;
  if (!isValidSession(session)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Missing lead id' },
      { status: 400 },
    );
  }

  const { status: toStatus } = await req.json();
  if (!VALID_STATUSES.includes(toStatus as Status)) {
    return NextResponse.json(
      { success: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 },
    );
  }

  const supabase = getSupabase();

  // 1) 기존 상태 및 업체 식별자 조회 (이력 기록용)
  const { data: oldLead, error: fetchError } = await supabase
    .from('leads')
    .select('status, company_id')
    .eq('id', id)
    .single();

  if (fetchError || !oldLead) {
    return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
  }

  const fromStatus = oldLead.status;
  const companyId = oldLead.company_id;

  // 2) 상태 업데이트
  const { error: updateError } = await supabase
    .from('leads')
    .update({ status: toStatus })
    .eq('id', id);

  if (updateError) {
    console.error('[Status Update Error]', updateError.message);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }

  // 3) 활동 이력 자동 기록 (SaaS 완성도 향상)
  if (fromStatus !== toStatus) {
    await supabase.from('lead_activities').insert([{
      lead_id: id,
      company_id: companyId,
      action: 'status_change',
      from_status: fromStatus,
      to_status: toStatus,
      note: `상태 변경: ${fromStatus} → ${toStatus}`,
    }]);
  }

  return NextResponse.json({ success: true });
}
