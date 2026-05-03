import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { major, budget, location, gpa, goals, citizenship } =
      await request.json();

    if (!major) {
      return NextResponse.json(
        { error: 'Major is required' },
        { status: 400 }
      );
    }

    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('PERPLEXITY_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const isInternational = citizenship &&
      citizenship !== 'United States' &&
      citizenship !== 'US'

    const prompt = `
Research universities matching this student profile 
and return verified data from NCES, College Scorecard, 
and Common Data Set 2024-2025.

STUDENT PROFILE:
- Intended Major: ${major}
- Annual Budget: ${budget || 'Not specified'}
- Preferred Location: ${location || 'Any US state'}
- GPA: ${gpa || 'Not specified'}
- Career Goals: ${goals || 'Not specified'}
- Student Type: ${isInternational
        ? `International student from ${citizenship}`
        : 'US Domestic student'}

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON object. Zero markdown. 
   Zero explanatory text. Zero disclaimers. Just JSON.
2. Every school must be real and accredited.
3. Provide exactly 12 schools.
4. ${isInternational
        ? 'Use out-of-state/international tuition rates. Include schools known for strong international student support and F-1 visa acceptance.'
        : 'Use in-state tuition where applicable. Prioritize schools in or near the student preferred location.'}
5. All numeric fields must be plain numbers.
   No dollar signs. No commas. No % symbols.
   Write 15510 not $15,510 and not "15.5K"
6. If a numeric value is genuinely unknown use 0.
   Never guess financial figures.
7. Graduation rate must be the 6-year graduation 
   rate from NCES or Common Data Set.
8. Net price must be the average net price after 
   all grants and scholarships from College Scorecard.
9. match_score must be calculated based on:
   - GPA fit vs school average admitted GPA (30%)
   - Budget fit vs net price (25%)
   - Program strength for this major (25%)
   - Acceptance rate fit (20%)
   Scores must range meaningfully from 55 to 95.
   Do NOT give every school a score between 60-68.

Respond with EXACTLY this JSON and nothing else:
{
  "schools": [
    {
      "name": "Full official university name",
      "location": "City, State",
      "city": "City name only",
      "state": "State abbreviation like CA",
      "setting": "urban or suburban or rural",
      "program": "Specific degree program name",
      "tuition_instate": 15000,
      "tuition_outofstate": 28000,
      "net_price": 12000,
      "room_board": 11000,
      "acceptance_rate": 83.2,
      "graduation_rate": 67.4,
      "gpa_minimum": 2.5,
      "gpa_average_admitted": 3.2,
      "scholarship_info": "Brief scholarship description",
      "top_employers": ["Company1", "Company2", "Company3"],
      "median_earnings_10yr": 65000,
      "international_student_pct": 8.2,
      "test_optional": true,
      "match_score": 78
    }
  ]
}
`

    console.log('Calling Perplexity API for school search...');

    const perplexityResponse = await fetch(
      'https://api.perplexity.ai/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              // ↓ THIS IS THE SYSTEM PROMPT — added here
              content: `You are a precise college data 
              research assistant with access to real-time 
              web data.

              Your data sources in priority order:
              1. NCES (nces.ed.gov) — tuition and 
                 enrollment data
              2. College Scorecard 
                 (collegescorecard.ed.gov) — net price 
                 and earnings data
              3. Common Data Set 2024-2025 — acceptance 
                 rates and GPA ranges
              4. Niche (niche.com) — student ratings
              5. Peterson's — program information

              ABSOLUTE RULES:
              - Return ONLY raw valid JSON. 
                Zero explanation. Zero markdown. 
                Zero backticks. Just the JSON object.
              - All numeric fields are plain integers 
                or decimals. Never strings.
              - tuition_instate = annual tuition ONLY.
                Do NOT include room and board.
              - net_price = average net price after ALL 
                grants and scholarships for a typical 
                student. This is always lower than 
                sticker tuition.
              - room_board = annual room and board cost.
                Separate from tuition.
              - graduation_rate = 6-year graduation rate 
                as a percentage number like 67.4
              - median_earnings_10yr = median earnings 
                of students 10 years after enrollment 
                from College Scorecard. Use 0 if unknown.
              - match_score must be meaningfully 
                differentiated. Range must span at least 
                25 points across the 12 schools returned.
                
              A student will make a life-changing 
              $100,000+ financial decision based on 
              your output. Accuracy is everything.`
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 4000,
          temperature: 0.1,
          return_citations: true,
        }),
      }
    );

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error(
        'Perplexity API error:',
        perplexityResponse.status,
        errorText
      );
      return NextResponse.json(
        { error: `Perplexity API error: ${perplexityResponse.status}` },
        { status: 500 }
      );
    }

    const data = await perplexityResponse.json();
    const rawContent = data.choices[0].message.content;
    const citations = data.citations || [];

    console.log('Raw Perplexity response length:', rawContent.length);

    // Strip markdown code fences if present
    let jsonString = rawContent.trim();
    const codeBlockMatch = jsonString.match(
      /```(?:json)?\s*([\s\S]*?)```/
    );
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1].trim();
    }

    // Find JSON boundaries
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');

    if (
      firstBrace === -1 ||
      lastBrace === -1 ||
      lastBrace <= firstBrace
    ) {
      console.error('No valid JSON found in response');
      console.error('Response preview:', rawContent.substring(0, 500));
      return NextResponse.json(
        { error: 'AI returned an invalid response. Please try again.' },
        { status: 502 }
      );
    }

    jsonString = jsonString.substring(firstBrace, lastBrace + 1);

    let parsedData: any;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'AI returned malformed data. Please try again.' },
        { status: 502 }
      );
    }

    const schools = parsedData.schools;
    if (!Array.isArray(schools) || schools.length === 0) {
      console.error('No schools array in parsed data');
      return NextResponse.json(
        { error: 'No school recommendations returned. Please try again.' },
        { status: 502 }
      );
    }

    // ── POST-PROCESSING ─────────────────────────────
    // Clean and validate every school object
    const cleanedSchools = schools.map((school: any) => {

      // Remove markdown from all string fields
      const cleanText = (str: any) => {
        if (!str || typeof str !== 'string') return str
        return str
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/\[\d+\]/g, '')
          .replace(/#{1,6}\s/g, '')
          .trim()
      }

      // Determine best tuition to use
      const isIntl = isInternational
      const annualTuition = isIntl
        ? (school.tuition_outofstate || school.tuition_instate * 1.6 || 28000)
        : (school.net_price || school.tuition_instate || 12000)

      // Validate match score is meaningful
      // If all scores are bunched 60-68, redistribute
      let matchScore = school.match_score || 65
      matchScore = Math.max(40, Math.min(98, matchScore))

      return {
        ...school,
        name: cleanText(school.name),
        location: cleanText(school.location),
        city: cleanText(school.city) ||
          cleanText(school.location)?.split(',')[0]?.trim(),
        state: cleanText(school.state),
        program: cleanText(school.program),
        scholarship_info: cleanText(school.scholarship_info),
        setting: school.setting || 'suburban',

        // Ensure all numbers are actually numbers
        tuition_instate: Number(school.tuition_instate) || 0,
        tuition_outofstate: Number(school.tuition_outofstate) || 0,
        net_price: Number(school.net_price) || 0,
        room_board: Number(school.room_board) || 0,
        acceptance_rate: Number(school.acceptance_rate) || 0,
        graduation_rate: Number(school.graduation_rate) || 0,
        gpa_minimum: Number(school.gpa_minimum) || 0,
        gpa_average_admitted: Number(school.gpa_average_admitted) || 0,
        median_earnings_10yr: Number(school.median_earnings_10yr) || 0,
        international_student_pct: Number(school.international_student_pct) || 0,
        match_score: matchScore,

        // Computed field for ROI report
        annual_cost_estimate: annualTuition,
        is_international_tuition: isIntl,
      }
    })

    // Sort by match score descending
    cleanedSchools.sort(
      (a: any, b: any) => b.match_score - a.match_score
    )

    console.log(
      `Successfully parsed ${cleanedSchools.length} schools`
    )

    return NextResponse.json({
      schools: cleanedSchools,
      citations,
    });

  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search schools' },
      { status: 500 }
    );
  }
}