import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CreateInvoiceSchema } from '@/lib/validations';
import { TAX_RATE_PCT } from '@/lib/constants';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*, product:products(*))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err) {
    console.error('GET /api/invoices error:', err);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = CreateInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await (admin as any).rpc('create_invoice', {
      p_customer_name: parsed.data.customer_name,
      p_items: parsed.data.items,
      p_discount_pct: parsed.data.discount_pct,
      p_tax_pct: TAX_RATE_PCT,
      p_notes: parsed.data.notes || '',
      p_created_by: user.id,
    });

    if (error) {
      const msg = error.message || '';
      if (msg.includes('INSUFFICIENT_STOCK:')) return NextResponse.json({ error: msg.replace('INSUFFICIENT_STOCK: ', '') }, { status: 422 });
      if (msg.includes('VALIDATION_ERROR:')) return NextResponse.json({ error: msg.replace('VALIDATION_ERROR: ', '') }, { status: 400 });
      if (msg.includes('PRODUCT_NOT_FOUND:')) return NextResponse.json({ error: msg.replace('PRODUCT_NOT_FOUND: ', '') }, { status: 404 });
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('POST /api/invoices error:', err);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
