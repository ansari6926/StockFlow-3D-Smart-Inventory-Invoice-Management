'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CreateInvoiceSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { TAX_RATE_PCT } from '@/lib/constants';
import type { Invoice, CreateInvoiceInput } from '@/lib/types';

export async function getInvoices(): Promise<{ data?: Invoice[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*, product:products(*))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data as Invoice[] };
  } catch (err) {
    console.error('getInvoices error:', err);
    return { error: 'Failed to fetch invoices' };
  }
}

export async function getInvoiceById(id: string): Promise<{ data?: Invoice; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*, product:products(*))')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data: data as Invoice };
  } catch {
    return { error: 'Invoice not found' };
  }
}

export async function createInvoice(
  input: CreateInvoiceInput
): Promise<{ data?: { invoice_id: string; invoice_number: string; total: number }; error?: string }> {
  try {
    // Validate input
    const parsed = CreateInvoiceSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // Use admin client to call RPC (bypasses RLS for atomic operation)
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
      // Parse server-side validation errors
      const msg = error.message || '';
      if (msg.includes('INSUFFICIENT_STOCK:')) {
        return { error: msg.replace('INSUFFICIENT_STOCK: ', '') };
      }
      if (msg.includes('VALIDATION_ERROR:')) {
        return { error: msg.replace('VALIDATION_ERROR: ', '') };
      }
      if (msg.includes('PRODUCT_NOT_FOUND:')) {
        return { error: msg.replace('PRODUCT_NOT_FOUND: ', '') };
      }
      throw error;
    }

    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    revalidatePath('/inventory');
    return { data: data as { invoice_id: string; invoice_number: string; total: number } };
  } catch (err) {
    console.error('createInvoice error:', err);
    return { error: 'Failed to create invoice. Please try again.' };
  }
}

export async function cancelInvoice(
  invoiceId: string
): Promise<{ data?: { status: string; message: string }; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const admin = createAdminClient();
    const { data, error } = await (admin as any).rpc('cancel_invoice', {
      p_invoice_id: invoiceId,
      p_user_id: user.id,
    });

    if (error) {
      const msg = error.message || '';
      if (msg.includes('ALREADY_CANCELLED:')) {
        return { error: 'This invoice has already been cancelled.' };
      }
      if (msg.includes('NOT_FOUND:')) {
        return { error: 'Invoice not found.' };
      }
      throw error;
    }

    revalidatePath('/invoices');
    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath('/dashboard');
    revalidatePath('/inventory');
    return { data: data as { status: string; message: string } };
  } catch (err) {
    console.error('cancelInvoice error:', err);
    return { error: 'Failed to cancel invoice. Please try again.' };
  }
}

export async function getDashboardStats() {
  try {
    const supabase = await createClient();

    const [productsRes, invoicesRes] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('invoices').select('*, invoice_items(*)').order('created_at', { ascending: false }),
    ]);

    if (productsRes.error) throw productsRes.error;
    if (invoicesRes.error) throw invoicesRes.error;

    const products = productsRes.data;
    const invoices = invoicesRes.data;

    const totalProducts = products.length;
    const totalUnits = products.reduce((sum: number, p: {stock_quantity: number}) => sum + p.stock_quantity, 0);
    const lowStockProducts = products.filter((p: {stock_quantity: number; reorder_threshold: number}) => p.stock_quantity <= p.reorder_threshold);
    const paidInvoices = invoices.filter((inv: {status: string}) => inv.status === 'PAID');
    const totalRevenue = paidInvoices.reduce((sum: number, inv: {total: number}) => sum + Number(inv.total), 0);

    return {
      data: {
        totalProducts,
        totalUnits,
        lowStockCount: lowStockProducts.length,
        totalInvoices: invoices.length,
        totalRevenue,
        recentInvoices: invoices.slice(0, 5),
        lowStockProducts: lowStockProducts.slice(0, 5),
      },
    };
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return { error: 'Failed to fetch dashboard stats' };
  }
}
