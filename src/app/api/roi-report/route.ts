import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/utils/supabase/server';
import { enforceRateLimit } from '@/lib/rateLimit';
import { lookupSchool } from '@/lib/collegeScorecard';
import { researchROIData } from '@/lib/ai/perplexity';

const extractSchoolData = (school: any) => {
  const text = JSON.stringify(school);

  const tuitionMatch = text.match(/(?:tuition|in-state|annual cost)[^\d]*\$?([\d,]+)/i);
  const tuition = tuitionMatch ? parseInt(tuitionMatch[1].replace(/,/g, '')) : null;

  const netMatch = text.match(/net\s*(?:price|cost)[^\d]*\$?([\d,]+)/i);
  const netPrice = netMatch ? parseInt(netMatch[1].replace(/,/g, '')) : tuition;

  const gradMatch = text.match(/(\d+\.?\d*)\s*%\s*grad/i);
  const graduationRate = gradMatch ? parseFloat(gradMatch[1]) : null;

  const acceptMatch = text.match(/(\d+\.?\d*)\s*%\s*accept/i);
  const acceptanceRate = acceptMatch ? parseFloat(acceptMatch[1]) : null;

  const location = school.location || school.city || '';
  const name = (school.name || school.title || '').replace(/\*\*/g, '').trim();

  return { name, location, tuition: netPrice || tuition, graduationRate, acceptanceRate };
};

export async function POST(req: NextRequest) {
  try {
    const { school: rawSchool, gpa, citizenship } = await req.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rateLimitResponse = await enforceRateLimit(supabase, user.id, 'last_roi_at', 60_000, 'ROI report');
    if (rateLimitResponse) return rateLimitResponse;

    const extracted = extractSchoolData(rawSchool);
    const { name: schoolName, location: schoolLocation, tuition: tuitionNum, graduationRate } = extracted;

    const { data: profile } = await supabase
      .from('profiles')
      .select('academic_background, budget')
      .eq('id', user.id)
      .single();

    const major = profile?.academic_background?.major || 'General Studies';

    // Return cached report if it exists for this school + major combination
    const { data: existingReport } = await supabase
      .from('roi_reports')
      .select('*')
      .eq('user_id', user.id)
      .eq('school_name', schoolName)
      .single();

    if (existingReport && existingReport.major === major.toLowerCase()) {
      return NextResponse.json(existingReport);
    }

    // ── Step 1: Get salary from College Scorecard (real, school-specific data) ──
    let medianSalary: number | null = null;
    let salarySource = '';
    let livingCostPerYear: number | null = null;
    let livingCostSource = '';

    const scorecard = await lookupSchool(schoolName, supabase);
    if (scorecard?.medianEarnings10yr) {
      medianSalary = scorecard.medianEarnings10yr;
      salarySource = `College Scorecard — ${schoolName} median earnings 10 years after enrollment`;
    }

    // ── Step 2: Perplexity fills what College Scorecard doesn't have ──
    // Always call Perplexity for living cost (Scorecard doesn't have this).
    // Also call for salary if Scorecard had nothing (international schools, etc.).
    const needsSalary = medianSalary === null;
    const roiLive = await researchROIData(schoolName, major, schoolLocation);

    if (needsSalary && roiLive.medianSalary) {
      medianSalary = roiLive.medianSalary;
      salarySource = roiLive.salarySource;
    }
    if (roiLive.livingCostPerYear) {
      livingCostPerYear = roiLive.livingCostPerYear;
      livingCostSource = roiLive.livingCostSource;
    }

    // ── Step 3: Calculate ROI ──
    const annualTuition = tuitionNum || 0;
    // If Perplexity found a living cost, use it. Otherwise flag as unknown.
    const livingCost = livingCostPerYear ?? null;
    const annualBooks = 1200; // IPEDS standard books/supplies estimate — minor, not salary-scale
    const totalPerYear = annualTuition + (livingCost ?? 0) + annualBooks;
    const total4Years = totalPerYear * 4;

    let roi: number | null = null;
    let breakeven: number | null = null;
    const warnings: string[] = [];

    if (!medianSalary) {
      warnings.push('Graduate salary data unavailable for this school and major — ROI estimate omitted.');
    }
    if (!livingCost) {
      warnings.push('Living cost data unavailable for this location — cost estimate may be incomplete.');
    }

    if (medianSalary && total4Years > 0) {
      // 5-year earnings projection — noted as estimate in the report
      const year1 = medianSalary;
      const year2 = year1 * 1.05;
      const year3 = year1 * 1.10;
      const year4 = year1 * 1.15;
      const year5 = year1 * 1.21;
      const total5yrEarnings = year1 + year2 + year3 + year4 + year5;

      roi = ((total5yrEarnings - total4Years) / total4Years) * 100;

      // Breakeven: take-home minus living expenses
      // Tax rate and salary growth are estimates — disclosed in warnings
      const effectiveTakeHome = year1 * 0.72;
      const annualSurplus = effectiveTakeHome - (livingCost ?? 18000);
      if (annualSurplus > 0) breakeven = total4Years / annualSurplus;

      warnings.push(
        'Salary growth (5%/year) and tax rate (28% effective) are national averages used as estimates — actual figures vary by location, employer, and year.',
      );
    }

    // ── Step 4: Claude analysis ──
    let aiRecommendation = 'AI analysis temporarily unavailable';
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 200,
          system: 'You are a brutally honest, commission-free college financial advisor. You give direct, specific advice based purely on numbers and student outcomes. You never recommend a school because of prestige — only because of genuine student fit and financial ROI. Keep your response to exactly 3 sentences.',
          messages: [{
            role: 'user',
            content: `Student profile: GPA ${gpa}, intended major ${major}, annual budget ${profile?.budget?.max}, citizenship ${citizenship}.
School: ${schoolName} in ${schoolLocation}.
True 4-year cost: ${total4Years > 0 ? '$' + total4Years.toLocaleString() : 'Data unavailable'}.
Salary data source: ${salarySource || 'unavailable'}.
Median salary (${salarySource ? 'real data' : 'unavailable'}): ${medianSalary ? '$' + medianSalary.toLocaleString() : 'unknown'}.
Living cost source: ${livingCostSource || 'unavailable'}.
Estimated ROI: ${roi !== null ? roi.toFixed(1) + '%' : 'Data unavailable'}.
Break-even: ${breakeven !== null ? breakeven.toFixed(1) + ' years' : 'Data unavailable'}.
Graduation rate: ${graduationRate || 'Data unavailable'}%.

Give your honest 3-sentence verdict on whether this is a smart choice for this specific student. Be direct. Start with either 'This is a smart choice' or 'Think carefully before choosing this school' — then explain exactly why with the numbers.`,
          }],
        });

        if (response.content[0].type === 'text') {
          aiRecommendation = response.content[0].text;
        }
      } catch (e: any) {
        console.error('Claude ROI Error:', e?.message);
      }
    }

    const newReport = {
      user_id: user.id,
      school_name: schoolName,
      total_cost_4yr: total4Years || null,
      roi_score: roi ?? null,
      breakeven_years: breakeven ?? null,
      ai_recommendation: aiRecommendation,
      data_warning: warnings.length > 0 ? warnings.join(' ') : null,
      major: major.toLowerCase(),
      tuition_per_year: tuitionNum || 0,
      living_costs_per_year: livingCost ?? 0,
      year1_salary: medianSalary ?? null,
      year3_salary: medianSalary ? medianSalary * 1.10 : null,
      year5_salary: medianSalary ? medianSalary * 1.21 : null,
      salary_source: salarySource || null,
      living_cost_source: livingCostSource || null,
    };

    const { data: savedReport, error: saveError } = await supabase
      .from('roi_reports')
      .upsert(newReport)
      .select()
      .single();

    if (saveError) console.error('Save error:', saveError);

    return NextResponse.json(savedReport || newReport);

  } catch (error: any) {
    console.error('ROI Report Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
