import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { clientId } = await request.json();

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Check if like exists
    const { data: existingLike, error: fetchError } = await supabase
      .from('photo_drop_likes')
      .select('id')
      .eq('image_id', id)
      .eq('client_id', clientId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingLike) {
      // Remove like
      const { error: deleteError } = await supabase
        .from('photo_drop_likes')
        .delete()
        .eq('id', existingLike.id);
        
      if (deleteError) throw deleteError;
      return NextResponse.json({ success: true, liked: false });
    } else {
      // Add like
      const { error: insertError } = await supabase
        .from('photo_drop_likes')
        .insert({ image_id: id, client_id: clientId });
        
      if (insertError) throw insertError;
      return NextResponse.json({ success: true, liked: true });
    }

  } catch (error: any) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
