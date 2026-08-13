import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const { data, error } = await (admin as any).rpc('cancel_invoice', {
      p_invoice_id: id,
      p_user_id: user.id,
    });

    if (error) {
      const msg = error.message || '';
      if (msg.includes('ALREADY_CANCELLED:')) return NextResponse.json({ error: 'Invoice already cancelled' }, { status: 409 });
      if (msg.includes('NOT_FOUND:')) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      throw error;
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('POST /api/invoices/:id/cancel error:', err);
    return NextResponse.json({ error: 'Failed to cancel invoice' }, { status: 500 });
  }
}
