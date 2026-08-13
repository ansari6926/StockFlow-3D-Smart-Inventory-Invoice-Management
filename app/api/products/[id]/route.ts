import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { data, error } = await supabase
      .from('products')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'SKU already exists' }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ data });
  } catch (err) {
    console.error('PATCH /api/products/:id error:', err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      if (error.code === '23503') return NextResponse.json({ error: 'Cannot delete product used in invoices' }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /api/products/:id error:', err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
