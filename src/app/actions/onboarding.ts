'use server';

import { createClient } from '@/utils/supabase/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { sanitizeForPrompt } from '@/lib/sanitize';

export async function completeOnboarding(profileData: any) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  // Generate a concise profile summary using Claude
  // This summary is crucial for feeding into Perplexity for school research
  const { text: summary } = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    prompt: `Analyze the following student profile and generate a highly technical, context-rich 3-sentence summary that captures their academic background, career ambitions, and financial/geographic constraints. This summary will be used to research the best school matches.

    Major: ${sanitizeForPrompt(profileData.major)}
    GPA: ${sanitizeForPrompt(profileData.gpa)}
    Mode: ${sanitizeForPrompt(profileData.mode)}
    Target Location: ${sanitizeForPrompt(profileData.targetLocation)}
    Budget: ${sanitizeForPrompt(profileData.budget)}
    Career Goals: ${sanitizeForPrompt(profileData.careerGoals) || 'Not specified'}`,
  });

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      major: profileData.major,
      gpa: profileData.gpa,
      mode: profileData.mode,
      target_location: profileData.targetLocation,
      budget_range: profileData.budget,
      profile_summary: summary,
      is_onboarded: true,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error saving profile:', error.message);
    throw new Error('Failed to save profile');
  }

  return { success: true, summary };
}
