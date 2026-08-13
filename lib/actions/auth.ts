'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LoginSchema, SignUpSchema } from '@/lib/validations';

export async function login(formData: FormData) {
  try {
    const supabase = await createClient();

    const rawData = {
      email: (formData.get('email') as string) || '',
      password: (formData.get('password') as string) || '',
    };

    const parsed = LoginSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Invalid email or password. Please try again.' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Please verify your email before signing in.' };
      }
      return { error: error.message };
    }

    redirect('/dashboard');
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') {
      throw err;
    }
    console.error('login server action error:', err);
    return { error: err?.message || 'Failed to sign in. Please try again.' };
  }
}

export async function signUp(formData: FormData, originUrl?: string) {
  try {
    const supabase = await createClient();

    const rawData = {
      email: (formData.get('email') as string) || '',
      password: (formData.get('password') as string) || '',
      confirmPassword: (formData.get('confirmPassword') as string) || '',
    };

    const parsed = SignUpSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const origin =
      originUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://stock-flow-3-d-smart-inventory-invoice-management-plvhulakc.vercel.app';

    const redirectTo = `${origin}/auth/callback`;

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      if (error.message.includes('User already registered') || error.message.includes('already exists')) {
        return { error: 'This email is already registered. Please sign in.' };
      }
      return { error: error.message };
    }

    if (data.user && !data.session) {
      return {
        success: true,
        requiresEmailVerification: true,
        email: parsed.data.email,
        message: "We've sent a confirmation link to your email address. Please verify your email before signing in.",
      };
    }

    if (data.session) {
      redirect('/dashboard');
    }

    return {
      success: true,
      requiresEmailVerification: true,
      email: parsed.data.email,
      message: 'Check your email for a confirmation link.',
    };
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') {
      throw err;
    }
    console.error('signUp server action error:', err);
    return { error: err?.message || 'Failed to create account. Please try again.' };
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function getUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.error('getUser error:', err);
    return null;
  }
}
