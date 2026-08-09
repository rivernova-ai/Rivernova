import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { lookupSchool } from '@/lib/collegeScorecard';

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { matchId, schoolName, programName, location, isInternational } = await request.json();
    if (!matchId || !schoolName) {
      return NextResponse.json({ error: 'matchId and schoolName required' }, { status: 400 });
    }

    // Verify the match belongs to this user
    const { data: match } = await supabase
      .from('matches').select('id, school_data').eq('id', matchId).eq('user_id', user.id).single();
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

    // Layer 1: College Scorecard — verified government numbers
    const scorecard = await lookupSchool(schoolName, supabase, programName);
    const isIntl = isInternational !== false; // default to international
    const isPublic = scorecard?.ownership === 1;
    const scorecardFields: Record<string, any> = {};
    if (scorecard) {
      const tuition = isIntl
        ? (scorecard.tuitionOutOfState ?? scorecard.tuitionInState)
        : (scorecard.tuitionInState ?? scorecard.tuitionOutOfState);
      const netPrice = isPublic ? scorecard.netPricePublic : scorecard.netPricePrivate;

      if (scorecard.admissionRate !== null)
        scorecardFields.admissionRate = `${(scorecard.admissionRate * 100).toFixed(1)}%`;
      if (scorecard.completionRate !== null)
        scorecardFields.graduationRate = `${(scorecard.completionRate * 100).toFixed(1)}%`;
      if (tuition !== null) {
        const existing = match.school_data || {};
        scorecardFields.costBreakdown = {
          ...(existing.costBreakdown || {}),
          tuition,
          total: tuition + (existing.costBreakdown?.living || 0),
        };
      }
      if (netPrice !== null)
        scorecardFields.netPrice = `$${netPrice.toLocaleString()}`;
      if (scorecard.medianEarnings10yr !== null) {
        scorecardFields.avgSalary = `$${scorecard.medianEarnings10yr.toLocaleString()}`;
        scorecardFields.median_earnings_10yr = scorecard.medianEarnings10yr;
      }
      scorecardFields.unitId = scorecard.unitId;
      scorecardFields.dataSource = `College Scorecard ${scorecard.dataYear}`;
    }

    // Layer 2: Claude Haiku — ranking, deadline, test policy (not in Scorecard)
    const prompt = `You are a US university data expert. Provide accurate information for this school.

School: ${schoolName}
Program: ${programName || 'General'}
Location: ${location || 'USA'}

CRITICAL RANKING RULE: US News publishes TWO separate lists:
1. National Universities (research-focused: MIT, Stanford, state flagships, etc.)
2. Regional Universities (teaching-focused: broken into North, South, Midwest, West)

Many mid-tier state schools are on the REGIONAL list, NOT the national list.
Example: San Jose State University = "#4 Regional Universities West (US News)" NOT a National Universities rank.
Always check which list a school actually appears on. Never assign a National Universities rank to a Regional school.

Return ONLY valid JSON (no markdown):
{
  "ranking": "Exact US News ranking with list type, e.g. '#4 Regional Universities West (US News 2025)' or '#105-#109 National Universities (US News 2025)'. NEVER N/A.",
  "deadline": "Exact application deadline, e.g. 'November 30' or 'Rolling'",
  "deadline_type": "Early Decision / Early Action / Regular Decision / Rolling",
  "test_policy": "Test-Required or Test-Optional or Test-Free",
  "stemOpt": "Yes if STEM OPT eligible for this program, No if not, Check with DSO if uncertain",
  "employmentRate": "Employment rate for graduates e.g. '87%', omit if truly unknown"
}`;

    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse enrichment response');
    const aiFields = JSON.parse(jsonMatch[0]);

    // Build per-field source map so UI can show confidence labels
    const sourceName = scorecard
      ? (scorecard.source === 'perplexity' ? `Perplexity live search ${scorecard.dataYear}` : `College Scorecard ${scorecard.dataYear}`)
      : null;

    const dataSources = {
      ...(match.school_data?.dataSources || {}),
      // AI-generated fields — Claude Haiku from training memory
      ...(aiFields.ranking     && { ranking:     'AI estimated — verify at usnews.com' }),
      ...(aiFields.deadline    && { deadline:     'AI estimated — verify on school website' }),
      ...(aiFields.test_policy && { testPolicy:   'AI estimated — verify on school website' }),
      ...(aiFields.stemOpt     && { stemOpt:      'AI estimated — verify with your DSO' }),
      // Overwrite with verified source where Scorecard/Perplexity covered the field
      ...(sourceName && scorecardFields.admissionRate && { admissionRate: sourceName }),
      ...(sourceName && scorecardFields.graduationRate && { graduationRate: sourceName }),
      ...(sourceName && scorecardFields.costBreakdown  && { tuition: sourceName }),
      ...(sourceName && scorecardFields.avgSalary      && { avgSalary: sourceName }),
      ...(sourceName && scorecardFields.netPrice       && { netPrice: sourceName }),
    };

    // Merge: Scorecard numbers override AI, AI fills gaps Scorecard can't cover
    const enriched = { ...aiFields, ...scorecardFields, dataSources };

    // Persist merged data back to Supabase
    const updatedSchoolData = { ...(match.school_data || {}), ...enriched };
    await supabase.from('matches').update({ school_data: updatedSchoolData }).eq('id', matchId);

    return NextResponse.json({ success: true, enriched });
  } catch (error: any) {
    console.error('School enrich error:', error);
    return NextResponse.json({ error: error.message || 'Enrichment failed' }, { status: 500 });
  }
}
