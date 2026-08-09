import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { enforceRateLimit } from '@/lib/rateLimit';
import { researchSchools } from '@/lib/ai/perplexity';
import { synthesizeMatches } from '@/lib/ai/claude';
import { lookupSchool, applyVerifiedData } from '@/lib/collegeScorecard';
import { normalizeQualification } from '@/lib/qualificationNormalizer';
import { DEFAULT_BUDGET_MIN, DEFAULT_BUDGET_MAX } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitResponse = await enforceRateLimit(supabase, user.id, 'last_search_at', 60_000, 'match generation');
    if (rateLimitResponse) return rateLimitResponse;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Extract profile data
    const academic = profile.academic_background || {};
    const career = profile.career_goals || {};
    const budget = profile.budget || {};
    const location = profile.location_preferences || {};

    // Build structured qualification context from the student's credentials
    const qualContext = normalizeQualification(academic);
    const preferredCountries: string[] = Array.isArray(location.preferredCountries)
      ? location.preferredCountries
      : location.preferredCountries
        ? location.preferredCountries.split(',').map((c: string) => c.trim())
        : ['United States'];

    // Step 1: Research schools using Perplexity (returns live facts + raw text)
    console.log('Researching schools with Perplexity...');
    const { rawText, schools: verifiedFacts } = await researchSchools({
      major: academic.major || 'General Studies',
      careerField: career.careerField || 'Various',
      budgetMin: parseInt(budget.min) || DEFAULT_BUDGET_MIN,
      budgetMax: parseInt(budget.max) || DEFAULT_BUDGET_MAX,
      preferredCountries,
      mode: profile.mode || 'international',
      gpa: academic.gpa,
      qualificationContext: qualContext.aiPromptDescription,
    });

    // Step 2: Synthesize matches using Claude (verified facts are passed as locked ground truth)
    console.log('Synthesizing matches with Claude...');
    const matchResults = await synthesizeMatches({
      researchData: rawText,
      verifiedFacts,
      userProfile: {
        major: academic.major || 'General Studies',
        careerField: career.careerField || 'Various',
        dreamJob: career.dreamJob || 'Professional',
        gpa: academic.gpa,
        qualificationContext: qualContext.aiPromptDescription,
        budget: {
          min: parseInt(budget.min) || DEFAULT_BUDGET_MIN,
          max: parseInt(budget.max) || DEFAULT_BUDGET_MAX,
        },
        preferredCountries,
        mode: profile.mode || 'international',
      },
    });

    // Step 3: Overwrite AI-guessed numbers with College Scorecard verified data
    console.log('Enriching matches with College Scorecard data...');
    const isInternational = (profile.mode || 'international') === 'international';
    const enrichedMatches = await Promise.all(
      matchResults.matches.map(async (match: any) => {
        try {
          const scorecard = await lookupSchool(match.schoolName, supabase, match.programName);
          if (scorecard) {
            return applyVerifiedData(match, scorecard, isInternational);
          }
        } catch (err) {
          console.error(`Scorecard lookup failed for ${match.schoolName}:`, err);
        }
        return match;
      })
    );

    // Step 4: Save matches to database
    const matchesToSave = enrichedMatches.map((match: any) => ({
      user_id: user.id,
      school_name: match.schoolName,
      school_data: match,
      success_probability: match.successProbability,
      reasoning: match.reasoning,
      cost_breakdown: match.costBreakdown,
      citations: match.citations || [],
    }));

    await supabase.from('matches').delete().eq('user_id', user.id);

    const { error: insertError } = await supabase
      .from('matches')
      .insert(matchesToSave);

    if (insertError) {
      console.error('Error saving matches:', insertError);
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      matches: enrichedMatches,
      count: enrichedMatches.length,
    });
  } catch (error: any) {
    console.error('Error generating matches:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate matches' },
      { status: 500 }
    );
  }
}
