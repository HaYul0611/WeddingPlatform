/**
 * GET /api/admin/companies
 * Query params:
 *   category  (all | wedding | beauty | healthcare | medical)
 *   is_active (true | false | all, default: true)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidSession } from '../auth/route';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  if (!isValidSession(session)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const category  = searchParams.get('category')  ?? 'all';
  const activeFilter = searchParams.get('is_active') ?? 'true';

  try {
    let query = getSupabase()
      .from('companies')
      .select('*')
      .order('name', { ascending: true });

    if (category !== 'all')    query = query.eq('category', category);
    if (activeFilter !== 'all') query = query.eq('is_active', activeFilter === 'true');

    const { data, error } = await query;

    if (error) {
      console.error('[Companies API]', error.message);
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('[Companies API] Unexpected:', e);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
