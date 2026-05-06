import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidSession } from '../../auth/route';

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

  const { status } = await req.json();
  if (!VALID_STATUSES.includes(status as Status)) {
    return NextResponse.json(
      { success: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 },
    );
  }

  const { error } = await getSupabase()
    .from('leads')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('[Status Update]', error.message);
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
