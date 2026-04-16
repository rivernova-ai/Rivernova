'use server';

import { anthropic } from '@ai-sdk/anthropic';
import { createPerplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';
import { createClient } from '@/utils/supabase/server';

const perplexity = createPerplexity({
  apiKey: process.env.PERPLEXITY_API_KEY || '',
});

export async function getApplications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('applications')
    .select('*, matches(*)')
    .order('created_at', { ascending: false });

  return data || [];
}

export async function submitApplication(formData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // 1. Save Application to DB
  const { data: application, error } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      mode: formData.mode,
      field_of_interest: formData.fieldOfInterest,
      budget: formData.budget,
      location_pref: formData.locationPref,
      career_goals: formData.careerGoals,
      current_edu: formData.currentEdu,
    })
    .select()
    .single();

  if (error) throw error;

  // 2. Step 1: Perplexity Research using form data
  const { text: researchResult } = await generateText({
    model: perplexity('sonar-pro'),
    prompt: `Research 15-20 top-tier zero-commission or high-ROI schools and programs for the following profile. 
    Focus on ${formData.mode} opportunities in ${formData.locationPref}.
    Find data on: Name, Location, Est. Tuition, ROI (salary/outcomes in 3-5 years), and why it is a transparent/unbiased choice.
    
    Field of Interest: ${formData.fieldOfInterest}
    Current Education: ${formData.currentEdu}
    Budget/Year: ${formData.budget}
    Career Goals: ${formData.careerGoals}`,
  });

  // 3. Step 2: Claude Synthesis & Ranking
  const { text: finalMatchesJson } = await generateText({
    model: anthropic('claude-3-5-sonnet-20240620'),
    prompt: `You are the lead Rivernova Match Architect. Based on the following raw research provided, synthesize 10 ranked school matches for ${formData.mode} mode.
    
    Research Findings:
    ${researchResult}
    
    CRITICAL REQUIREMENTS:
    1. Output MUST be an array of JSON objects.
    2. Each object must have: name, location, tuition, roi, matchScore (0-100), reasoning, and category (e.g., 'Target', 'Reach', 'Safety').
    3. Ensure the reasoning explicitly mentions why this is a 'Zero-Commission' or high-transparency match.
    4. Focus on long-term ROI as requested in goals: ${formData.careerGoals}.`,
  });

  // 4. Parse & Save Matches
  let matches = [];
  try {
    const jsonStr = finalMatchesJson.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    matches = Array.isArray(parsed) ? parsed : (parsed.matches || []);

    if (matches.length > 0) {
      const matchesWithAppId = matches.map((m: any) => ({
        application_id: application.id,
        name: m.name,
        location: m.location,
        tuition: m.tuition,
        roi: m.roi,
        match_score: m.matchScore,
        reasoning: m.reasoning,
        category: m.category,
        citations: [], // Store the citations for proof
      }));

      await supabase.from('matches').insert(matchesWithAppId);
    }
  } catch (e) {
    console.error('Failed to parse Claude matches:', e);
  }

  return { applicationId: application.id, matches, citations: [] };
}
