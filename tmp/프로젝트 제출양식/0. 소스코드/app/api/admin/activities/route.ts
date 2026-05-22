import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSessionData } from '@/lib/auth';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  const { isValid, companyId } = getSessionData(session);

  if (!isValid || !companyId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();

    // 1. 활동 내역 조회 (lead_id 포함)
    const { data: activities, error: activityError } = await supabase
      .from('lead_activities')
      .select('id, lead_id, action, note, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (activityError) {
      console.error('[Activities API]', activityError.message);
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    // 2. 고객 성함 정보 일괄 조회
    const leadIds = Array.from(new Set(activities.map((a: any) => a.lead_id).filter(Boolean)));
    const { data: leads } = await supabase
      .from('leads')
      .select('id, name')
      .in('id', leadIds);

    const leadMap = new Map(leads?.map((l: any) => [l.id, l.name]) || []);

    // 3. 데이터 변환 및 병합
    const formattedData = activities.map((item: any) => {
      let type: 'status' | 'message' | 'new_lead' = 'status';
      if (item.action === 'status_change') type = 'status';
      else if (item.action === 'note_added') type = 'message';

      return {
        id: item.id,
        type,
        user: leadMap.get(item.lead_id) || '알 수 없음',
        action: item.note,
        time: formatRelativeTime(new Date(item.created_at)),
      };
    });

    return NextResponse.json({ success: true, data: formattedData });
  } catch (err) {
    console.error('[Activities API] Unexpected:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}일 전`;

  return date.toLocaleDateString('ko-KR');
}
