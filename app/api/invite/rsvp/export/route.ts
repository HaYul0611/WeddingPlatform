/**
 * GET /api/invite/rsvp/export?invitationId=xxx
 * RSVP 응답을 CSV로 내보내기
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(req: NextRequest) {
  const invitationId = req.nextUrl.searchParams.get('invitationId');
  if (!invitationId) {
    return new NextResponse('invitationId required', { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from('rsvp_responses')
    .select('*')
    .eq('invitation_id', invitationId)
    .order('submitted_at', { ascending: true });

  if (error || !data) {
    return new NextResponse('Database error', { status: 500 });
  }

  // BOM + CSV
  const BOM = '\uFEFF';
  const header = ['이름', '연락처', '참석 여부', '인원', '식사', '메시지', '제출 시각'];
  const rows = data.map((r) => [
    r.name,
    r.phone ?? '',
    r.attendance === 'attending' ? '참석' : r.attendance === 'notAttending' ? '불참' : '미정',
    r.guest_count ?? 1,
    r.meal ?? '',
    r.message ?? '',
    new Date(r.submitted_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
  ]);

  const csvContent =
    BOM +
    [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rsvp_${invitationId}.csv"`,
    },
  });
}
