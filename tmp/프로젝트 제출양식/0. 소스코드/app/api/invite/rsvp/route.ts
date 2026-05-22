import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// POST /api/invite/rsvp  — RSVP 제출
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invitationId, name, phone, attendance, guestCount, meal, message } = body;

    if (!invitationId || !name || !attendance) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.from('rsvp_responses').insert([{
      invitation_id: invitationId,
      name,
      phone: phone ?? null,
      attendance,
      guest_count: guestCount ?? 1,
      meal: meal ?? null,
      message: message ?? null,
      submitted_at: new Date().toISOString(),
    }]).select('id').single();

    if (error) {
      console.error('[RSVP]', error.message);
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (e) {
    console.error('[RSVP]', e);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

// GET /api/invite/rsvp?invitationId=xxx  — RSVP 목록 조회 (관리자용)
export async function GET(req: NextRequest) {
  const invitationId = req.nextUrl.searchParams.get('invitationId');
  if (!invitationId) {
    return NextResponse.json({ success: false, error: 'invitationId required' }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from('rsvp_responses')
    .select('*')
    .eq('invitation_id', invitationId)
    .order('submitted_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}
