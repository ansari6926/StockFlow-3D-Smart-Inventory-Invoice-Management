'use server';

import { createClient } from '@/lib/supabase/server';
import { ProductSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import type { Product, ProductFormInput } from '@/lib/types';

export async function getProducts(): Promise<{ data?: Product[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data as Product[] };
  } catch (err) {
    console.error('getProducts error:', err);
    return { error: 'Failed to fetch products' };
  }
}

export async function getProductById(id: string): Promise<{ data?: Product; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data: data as Product };
  } catch {
    return { error: 'Product not found' };
  }
}

export async function createProduct(input: ProductFormInput): Promise<{ data?: Product; error?: string }> {
  try {
    const parsed = ProductSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { error: `SKU "${input.sku}" already exists. Please use a unique SKU.` };
      }
      throw error;
    }

    revalidatePath('/inventory');
    revalidatePath('/dashboard');
    return { data: data as Product };
  } catch (err) {
    console.error('createProduct error:', err);
    return { error: 'Failed to create product' };
  }
}

export async function updateProduct(
  id: string,
  input: Partial<ProductFormInput>
): Promise<{ data?: Product; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { error: `SKU already exists. Please use a unique SKU.` };
      }
      throw error;
    }

    revalidatePath('/inventory');
    revalidatePath('/dashboard');
    return { data: data as Product };
  } catch (err) {
    console.error('updateProduct error:', err);
    return { error: 'Failed to update product' };
  }
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '23503') {
        return { error: 'Cannot delete product that has been used in invoices' };
      }
      throw error;
    }

    revalidatePath('/inventory');
    revalidatePath('/dashboard');
    return {};
  } catch (err) {
    console.error('deleteProduct error:', err);
    return { error: 'Failed to delete product' };
  }
}
