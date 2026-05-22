/**
 * GET  /api/admin/leads/[id]/activity  → 활동 이력 조회
 * POST /api/admin/leads/[id]/activity  → 활동 기록 추가 (status_change 자동 기록용)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidSession } from '@/lib/auth';

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

  const { data, error } = await getSupabase()
    .from('lead_activities')
    .select('*')
    .eq('lead_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = req.cookies.get('admin_session')?.value;
  if (!isValidSession(session)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const { error } = await getSupabase()
    .from('lead_activities')
    .insert([{
      lead_id:     params.id,
      action:      body.action,
      from_status: body.from_status ?? null,
      to_status:   body.to_status   ?? null,
      note:        body.note        ?? null,
    }]);

  if (error) {
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
