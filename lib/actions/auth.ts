'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LoginSchema } from '@/lib/validations';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
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
    return { error: 'Login failed. Please try again.' };
  }

  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
