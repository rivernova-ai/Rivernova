import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/utils/supabase/server';

const salaryMap: Record<string, number> = {
  "data science": 88000,
  "computer science": 92000,
  "software engineering": 95000,
  "engineering": 78000,
  "electrical engineering": 82000,
  "mechanical engineering": 76000,
  "business": 62000,
  "finance": 68000,
  "accounting": 58000,
  "marketing": 52000,
  "nursing": 70000,
  "healthcare": 65000,
  "biology": 46000,
  "pre-med": 52000,
  "psychology": 42000,
  "education": 44000,
  "communications": 44000,
  "arts": 40000,
  "humanities": 39000,
  "political science": 48000,
  "economics": 62000,
  "default": 52000
};

const majorCities = ["New York", "Los Angeles", "Chicago", "Boston", "Seattle", "San Francisco", "Washington", "Miami", "Philadelphia", "Houston", "Atlanta", "Denver"];

const extractSchoolData = (school: any) => {
  const text = JSON.stringify(school);
  
  // Extract tuition — look for dollar amounts near words like "tuition", "cost", "in-state"
  const tuitionMatch = text.match(/(?:tuition|in-state|annual cost)[^\d]*\$?([\d,]+)/i);
  const tuition = tuitionMatch ? parseInt(tuitionMatch[1].replace(/,/g, '')) : null;

  // Extract net price
  const netMatch = text.match(/net\s*(?:price|cost)[^\d]*\$?([\d,]+)/i);
  const netPrice = netMatch ? parseInt(netMatch[1].replace(/,/g, '')) : tuition;

  // Extract graduation rate
  const gradMatch = text.match(/(\d+\.?\d*)\s*%\s*grad/i);
  const graduationRate = gradMatch ? parseFloat(gradMatch[1]) : null;

  // Extract acceptance rate  
  const acceptMatch = text.match(/(\d+\.?\d*)\s*%\s*accept/i);
  const acceptanceRate = acceptMatch ? parseFloat(acceptMatch[1]) : null;

  // Extract location from school name or location field
  const location = school.location || school.city || '';
  
  // Extract school name — strip all markdown
  const name = (school.name || school.title || '').replace(/\*\*/g, '').trim();

  return { 
    name, 
    location, 
    tuition: netPrice || tuition, 
    graduationRate, 
    acceptanceRate 
  };
};

export async function POST(req: NextRequest) {
  try {
    const { school: rawSchool, gpa, citizenship } = await req.json();
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const extracted = extractSchoolData(rawSchool);
    const { name: schoolName, location: schoolLocation, tuition: tuitionNum, graduationRate } = extracted;

    // 1. Check for existing report
    const { data: existingReport } = await supabase
      .from('roi_reports')
      .select('*')
      .eq('user_id', user.id)
      .eq('school_name', schoolName)
      .single();

    // Get user profile for major
    const { data: profile } = await supabase
      .from('profiles')
      .select('academic_background, budget')
      .eq('id', user.id)
      .single();

    const major = profile?.academic_background?.major?.toLowerCase() || 'default';
    
    if (existingReport && existingReport.major === major) {
      return NextResponse.json(existingReport);
    }

    // 2. Calculations
    let totalPerYear = 0;
    let total4Years = 0;
    let livingCost = 13000; // Mid-size default
    let roi = 0;
    let breakeven = 0;

    if (tuitionNum && !isNaN(tuitionNum)) {
      const cityMatch = majorCities.some(city => schoolLocation?.toLowerCase().includes(city.toLowerCase()));
      if (cityMatch) {
        livingCost = 20000;
      } else if (schoolLocation?.toLowerCase().includes('rural') || schoolLocation?.toLowerCase().includes('town')) {
        livingCost = 8000;
      }

      totalPerYear = tuitionNum + livingCost + 1200;
      total4Years = totalPerYear * 4;
    }

    // Salary mapping
    let matchedSalary = salaryMap.default;
    for (const [key, value] of Object.entries(salaryMap)) {
      if (key !== 'default' && major.includes(key)) {
        matchedSalary = value;
        break;
      }
    }

    const year1 = matchedSalary;
    const year2 = year1 * 1.05;
    const year3 = year1 * 1.10;
    const year4 = year1 * 1.15;
    const year5 = year1 * 1.21;
    const total5yrEarnings = year1 + year2 + year3 + year4 + year5;

    if (total4Years > 0) {
      roi = ((total5yrEarnings - total4Years) / total4Years) * 100;
      breakeven = total4Years / year1;
    }

    // 3. AI Recommendation
    let aiRecommendation = "AI analysis temporarily unavailable";
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        console.log('Calling Claude ROI with model: claude-sonnet-4-20250514');
        console.log('ROI Params:', { schoolName, major, gpa, total4Years, roi });

        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          system: "You are a brutally honest, commission-free college financial advisor. You give direct, specific advice based purely on numbers and student outcomes. You never recommend a school because of prestige — only because of genuine student fit and financial ROI. Keep your response to exactly 3 sentences.",
          messages: [{
            role: "user",
            content: `Student profile: GPA ${gpa}, intended major ${major}, annual budget ${profile?.budget?.max}, citizenship ${citizenship}.
School: ${schoolName} in ${schoolLocation}.
True 4-year cost: ${total4Years > 0 ? '$' + total4Years.toLocaleString() : 'Data unavailable'}.
Estimated ROI score: ${total4Years > 0 ? roi.toFixed(1) + '%' : 'Data unavailable'}.
Break-even: ${total4Years > 0 ? breakeven.toFixed(1) + ' years' : 'Data unavailable'}.
Graduation rate: ${graduationRate || 'Data unavailable'}%.

Give your honest 3-sentence verdict on whether this is a smart choice for this specific student. Be direct. Start with either 'This is a smart choice' or 'Think carefully before choosing this school' — then explain exactly why with the numbers.`
          }]
        });
        
        if (response.content[0].type === 'text') {
          aiRecommendation = response.content[0].text;
          console.log('Claude ROI Response Success');
        }
      } catch (e: any) {
        console.error('CRITICAL: Claude ROI Error:', e);
        console.error('Error Status:', e?.status);
        console.error('Error Message:', e?.message);
        console.error('Error Type:', e?.type);
      }
    } else {
      console.error('ANTHROPIC_API_KEY is missing in ROI route');
    }

    const newReport = {
      user_id: user.id,
      school_name: schoolName,
      total_cost_4yr: total4Years || null,
      roi_score: roi || null,
      breakeven_years: breakeven || null,
      ai_recommendation: aiRecommendation,
      major: major,
      tuition_per_year: tuitionNum || 0,
      living_costs_per_year: livingCost,
      year1_salary: year1,
      year3_salary: year3,
      year5_salary: year5,
    };

    // Store in Supabase
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

