'use server';

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { createClient } from '@/utils/supabase/server';

export async function generateApplicationOutline(schoolName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  const { text: outline } = await generateText({
    model: anthropic('claude-3-5-sonnet-20240620'),
    system: `You are the Rivernova Application Architect. Your goal is to help students start their applications with zero bias.`,
    prompt: `Generate a comprehensive application starter kit for ${schoolName}.
    
    Student Profile:
    - Major: ${profile.major}
    - GPA: ${profile.gpa}
    - Career Goals: ${profile.careerGoals}
    
    The starter kit must include:
    1. A "Why this School" essay outline (3 bullet points).
    2. A "Personal Statement" hook based on the student's career goals.
    3. A checklist of 3 specific documents this student likely needs (e.g., transcripts, specific visa forms).
    
    Format the response as a clean, structured outline with clear headings.`,
  });

  return outline;
}
