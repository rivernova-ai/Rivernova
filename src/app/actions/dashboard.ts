'use server';

import { createClient } from '@/utils/supabase/server';

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No profile found
    console.error('Error fetching profile:', error.message);
    return null;
  }

  return profile;
}
