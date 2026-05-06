/**
 * GET /api/admin/leads
 *
 * Query params:
 *   page     (default: 1)
 *   pageSize (default: 20)
 *   category (all | wedding | healthcare | beauty | medical)
 *   status   (all | new | contacted | completed)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidSession } from '../auth/route';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  // 인증 검증
  const session = req.cookies.get('admin_session')?.value;
  if (!isValidSession(session)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page     = Math.max(1, Number(searchParams.get('page')     ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 20)));
  const category = searchParams.get('category') ?? 'all';
  const status   = searchParams.get('status')   ?? 'all';

  const from = (page - 1) * pageSize;
  const to   = from + pageSize - 1;

  try {
    const supabase = getSupabase();

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (category !== 'all') query = query.eq('category', category);
    if (status   !== 'all') query = query.eq('status',   status);

    const { data, count, error } = await query;

    if (error) {
      console.error('[Admin Leads API]', error.message);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('[Admin Leads API] Unexpected:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
