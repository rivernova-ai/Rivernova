import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { lookupSchool, applyVerifiedData } from '@/lib/collegeScorecard';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user's profile to know international vs domestic
    const { data: profile } = await supabase
      .from('profiles').select('mode').eq('id', user.id).single();
    const isInternational = (profile?.mode || 'international') !== 'domestic';

    // Get all matches that don't yet have College Scorecard data
    const { data: matches } = await supabase
      .from('matches')
      .select('id, school_name, school_data')
      .eq('user_id', user.id);

    if (!matches || matches.length === 0) {
      return NextResponse.json({ enriched: 0, skipped: 0 });
    }

    const toEnrich = matches.filter((m: any) => !m.school_data?.dataSource);

    if (toEnrich.length === 0) {
      return NextResponse.json({ enriched: 0, skipped: matches.length });
    }

    // Run College Scorecard lookups in parallel — all schools at once
    const results = await Promise.allSettled(
      toEnrich.map(async (match: any) => {
        const programName = match.school_data?.programName || '';
        const scorecard = await lookupSchool(match.school_name, supabase, programName);
        if (!scorecard) return null; // school not found (e.g. international school)

        const enrichedData = applyVerifiedData(match.school_data || {}, scorecard, isInternational);

        await supabase
          .from('matches')
          .update({ school_data: enrichedData })
          .eq('id', match.id);

        return match.school_name;
      })
    );

    const enriched = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
    const skipped = matches.length - toEnrich.length;

    console.log(`Backfill complete: ${enriched} enriched, ${skipped} already had data, ${toEnrich.length - enriched} not found in Scorecard`);

    return NextResponse.json({ enriched, skipped, total: matches.length });
  } catch (error: any) {
    console.error('Backfill error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
