import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get('invitationId');

    if (!invitationId) {
      return NextResponse.json({ error: 'invitationId is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    
    // 1. Get images
    const { data: images, error: imagesError } = await supabase
      .from('photo_drop_images')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false });

    if (imagesError) throw imagesError;

    // 2. Get likes counts
    const { data: likes, error: likesError } = await supabase
      .from('photo_drop_likes')
      .select('image_id, client_id');
      
    if (likesError) throw likesError;

    // 3. Get comments count
    const { data: comments, error: commentsError } = await supabase
      .from('photo_drop_comments')
      .select('image_id, id');

    if (commentsError) throw commentsError;

    // Aggregate data
    const aggregatedImages = images.map((img: any) => {
      const imgLikes = likes.filter((l: any) => l.image_id === img.id);
      const imgComments = comments.filter((c: any) => c.image_id === img.id);
      return {
        ...img,
        likesCount: imgLikes.length,
        likedByClients: imgLikes.map((l: any) => l.client_id),
        commentsCount: imgComments.length
      };
    });

    return NextResponse.json({ images: aggregatedImages });
  } catch (error: any) {
    console.error('Error fetching photo drop images:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { invitationId, url, uploaderName } = await request.json();

    if (!invitationId || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('photo_drop_images')
      .insert({
        invitation_id: invitationId,
        url,
        uploader_name: uploaderName || '익명 하객',
        view_count: 0
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ image: data });
  } catch (error: any) {
    console.error('Error uploading photo drop image:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
