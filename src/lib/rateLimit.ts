import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

type RateLimitColumn =
  | 'last_search_at'
  | 'last_chat_at'
  | 'last_roi_at'
  | 'last_essay_at'
  | 'last_compare_at';

// Returns a 429 NextResponse if the user is within the cooldown window,
// null if they are allowed through. Also stamps last_X_at on pass.
export async function enforceRateLimit(
  supabase: SupabaseClient,
  userId: string,
  column: RateLimitColumn,
  cooldownMs: number,
  label: string,
): Promise<NextResponse | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select(column)
    .eq('id', userId)
    .single();

  const now = Date.now();
  const timestamp = (profile as Record<string, unknown> | null)?.[column];
  const last = typeof timestamp === 'string' ? new Date(timestamp).getTime() : 0;

  if (now - last < cooldownMs) {
    const secondsLeft = Math.ceil((cooldownMs - (now - last)) / 1000);
    return NextResponse.json(
      { error: `Please wait ${secondsLeft}s before another ${label}.` },
      { status: 429 },
    );
  }

  await supabase
    .from('profiles')
    .update({ [column]: new Date().toISOString() })
    .eq('id', userId);

  return null;
}
