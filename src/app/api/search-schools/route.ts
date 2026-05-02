import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { major, budget, location, gpa, goals } = await request.json();

    if (!major) {
      return NextResponse.json({ error: 'Major is required' }, { status: 400 });
    }

    // Check if API key exists
    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('PERPLEXITY_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Build search prompt — demands strict JSON output
    const prompt = `You are a school research expert. Research universities matching this student profile:

STUDENT PROFILE:
- Intended Major: ${major}
- Budget: ${budget || 'Not specified'}
- Preferred Location: ${location || 'Any'}
- GPA: ${gpa || 'Not specified'}
- Career Goals: ${goals || 'Not specified'}

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY a valid JSON object. No markdown, no explanatory text, no disclaimers, no footnotes, no limitations sections.
2. Do NOT include any text before or after the JSON.
3. Do NOT wrap the JSON in markdown code fences.
4. Every school must be a real, accredited university or college.
5. Provide 10-15 schools.

Respond with EXACTLY this JSON structure and nothing else:
{
  "schools": [
    {
      "name": "University Name",
      "location": "City, State",
      "program": "Degree program name",
      "tuition_instate": 15000,
      "net_price": 12000,
      "acceptance_rate": 83.2,
      "graduation_rate": 45.5,
      "gpa_minimum": 2.5,
      "scholarship_info": "description",
      "match_score": 78
    }
  ]
}

FIELD RULES:
- "name": Full official university name. REQUIRED.
- "location": City and state. REQUIRED.
- "program": Specific program name for the student's major. REQUIRED.
- "tuition_instate": Annual in-state tuition as a number (no $ sign). Use 0 if unknown.
- "net_price": Average net price after aid as a number. Use 0 if unknown.
- "acceptance_rate": Percentage as a number (e.g., 83.2 not "83.2%"). Use 0 if unknown.
- "graduation_rate": Percentage as a number. Use 0 if unknown.
- "gpa_minimum": Minimum GPA as a decimal number. Use 0 if unknown.
- "scholarship_info": Brief scholarship description.
- "match_score": A calculated match score from 1-100 based on the student's profile fit.

Use the most recent data available (2024-2025). Respond with the JSON object ONLY.`;

    console.log('Calling Perplexity API for school search...');

    // Call Perplexity API
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
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
            content: 'You are a data API that returns ONLY valid JSON. Never include explanatory text, disclaimers, limitations, footnotes, or markdown formatting. Your entire response must be a single valid JSON object.',
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
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error('Perplexity API error:', perplexityResponse.status, errorText);
      return NextResponse.json(
        { error: `Perplexity API error: ${perplexityResponse.status}` },
        { status: 500 }
      );
    }

    const data = await perplexityResponse.json();
    const rawContent = data.choices[0].message.content;
    const citations = data.citations || [];

    console.log('Raw Perplexity response length:', rawContent.length);

    // Extract JSON from the response (handle cases where AI wraps in markdown code fences)
    let jsonString = rawContent.trim();

    // Strip markdown code fences if present
    const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1].trim();
    }

    // Find the JSON object boundaries
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      console.error('No valid JSON object found in Perplexity response');
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
      console.error('Attempted to parse:', jsonString.substring(0, 500));
      return NextResponse.json(
        { error: 'AI returned malformed data. Please try again.' },
        { status: 502 }
      );
    }

    // Validate the shape
    const schools = parsedData.schools;
    if (!Array.isArray(schools) || schools.length === 0) {
      console.error('No schools array found in parsed data');
      return NextResponse.json(
        { error: 'AI did not return any school recommendations. Please try again.' },
        { status: 502 }
      );
    }

    console.log(`Successfully parsed ${schools.length} schools from Perplexity`);

    return NextResponse.json({
      schools,
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
