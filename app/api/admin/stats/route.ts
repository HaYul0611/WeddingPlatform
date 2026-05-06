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

  try {
    const supabase = getSupabase();

    const [total, newCount, contactedCount, completedCount] = await Promise.all([
      supabase.from('leads').select('id', { count: 'exact', head: true }),
      supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'contacted'),
      supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    ]);

    if (total.error) throw total.error;

    return NextResponse.json({
      success: true,
      data: {
        total:     total.count     ?? 0,
        new:       newCount.count       ?? 0,
        contacted: contactedCount.count ?? 0,
        completed: completedCount.count ?? 0,
      },
    });
  } catch (e) {
    console.error('[Stats API]', e);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
