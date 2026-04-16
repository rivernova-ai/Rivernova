import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { researchSchools } from '@/lib/ai/perplexity';
import { synthesizeMatches } from '@/lib/ai/claude';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Step 1: Research schools using Perplexity
    console.log('Researching schools with Perplexity...');
    const researchData = await researchSchools({
      major: academic.major || 'General Studies',
      careerField: career.careerField || 'Various',
      budgetMin: parseInt(budget.min) || 10000,
      budgetMax: parseInt(budget.max) || 50000,
      preferredCountries: location.preferredCountries
        ? location.preferredCountries.split(',').map((c: string) => c.trim())
        : ['United States'],
      mode: profile.mode || 'international',
      gpa: academic.gpa,
      testScores: academic.testScores,
    });

    // Step 2: Synthesize matches using Claude
    console.log('Synthesizing matches with Claude...');
    const matchResults = await synthesizeMatches({
      researchData,
      userProfile: {
        major: academic.major || 'General Studies',
        careerField: career.careerField || 'Various',
        dreamJob: career.dreamJob || 'Professional',
        gpa: academic.gpa,
        testScores: academic.testScores,
        budget: {
          min: parseInt(budget.min) || 10000,
          max: parseInt(budget.max) || 50000,
        },
        preferredCountries: location.preferredCountries
          ? location.preferredCountries.split(',').map((c: string) => c.trim())
          : ['United States'],
        mode: profile.mode || 'international',
      },
    });

    // Step 3: Save matches to database
    const matchesToSave = matchResults.matches.map((match: any) => ({
      user_id: user.id,
      school_name: match.schoolName,
      school_data: match,
      success_probability: match.successProbability,
      reasoning: match.reasoning,
      cost_breakdown: match.costBreakdown,
      citations: match.citations || [],
    }));

    const { error: insertError } = await supabase
      .from('matches')
      .insert(matchesToSave);

    if (insertError) {
      console.error('Error saving matches:', insertError);
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      matches: matchResults.matches,
      count: matchResults.matches.length,
    });
  } catch (error: any) {
    console.error('Error generating matches:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate matches' },
      { status: 500 }
    );
  }
}
