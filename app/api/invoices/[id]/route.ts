import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*, product:products(*))')
      .eq('id', id)
      .single();

    if (error) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (err) {
    console.error('GET /api/invoices/:id error:', err);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}
