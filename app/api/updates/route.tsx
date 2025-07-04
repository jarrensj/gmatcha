import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClerkSupabaseClient(req);
  let query = supabase
    .from('standupupdates')
    .select('id, text, date, created_at, updated_at, user_id')
    .eq('user_id', userId);

  if (startDate && endDate) {
    query = query.gte('date', startDate).lte('date', endDate);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { text, date } = body;
  if (!text || !date) {
    return NextResponse.json(
      { error: 'text and date are required' },
      { status: 400 }
    );
  }

  const supabase = await createClerkSupabaseClient(req);
  
  const { data: existingUpdate } = await supabase
    .from('standupupdates')
    .select('id')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (existingUpdate) {
    return NextResponse.json(
      { error: 'An update already exists for this date' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('standupupdates')
    .insert([{
      text,
      user_id: userId,
      date,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id, text, date } = body;
  if (!id || !text || !date) {
    return NextResponse.json(
      { error: 'id, text, and date are required' },
      { status: 400 }
    );
  }

  const supabase = await createClerkSupabaseClient(req);
  const { error } = await supabase
    .from('standupupdates')
    .update({
      text,
      date,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const supabase = await createClerkSupabaseClient(req);
  const { error } = await supabase
    .from('standupupdates')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
