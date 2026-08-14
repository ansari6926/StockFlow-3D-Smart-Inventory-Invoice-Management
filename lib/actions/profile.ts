'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
}

export async function getProfile(): Promise<{ data?: UserProfile; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('getProfile Supabase error:', error);
      // Return user info with empty display_name if table or row isn't ready
      return {
        data: {
          id: user.id,
          email: user.email || '',
          display_name: (user.user_metadata?.display_name as string) || '',
        },
      };
    }

    if (!data) {
      return {
        data: {
          id: user.id,
          email: user.email || '',
          display_name: (user.user_metadata?.display_name as string) || '',
        },
      };
    }

    return {
      data: {
        id: data.id,
        email: data.email || user.email || '',
        display_name: data.display_name || (user.user_metadata?.display_name as string) || '',
      },
    };
  } catch (err) {
    console.error('getProfile exception:', err);
    return { error: 'Failed to fetch user profile' };
  }
}

export async function updateProfileDisplayName(
  displayName: string
): Promise<{ data?: UserProfile; error?: string }> {
  try {
    const trimmed = displayName.trim();
    if (!trimmed) {
      return { error: 'Display name cannot be empty.' };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // 1. Update user metadata in Supabase Auth
    await supabase.auth.updateUser({
      data: { display_name: trimmed },
    });

    // 2. Upsert into profiles table
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email || '',
          display_name: trimmed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .maybeSingle();

    if (error) {
      console.warn('profiles upsert warning (falling back to auth metadata):', error);
    }

    revalidatePath('/dashboard');
    revalidatePath('/settings');

    return {
      data: {
        id: user.id,
        email: user.email || '',
        display_name: trimmed,
      },
    };
  } catch (err) {
    console.error('updateProfileDisplayName error:', err);
    return { error: 'Failed to update profile display name' };
  }
}
