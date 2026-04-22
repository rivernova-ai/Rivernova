import { NextRequest, NextResponse } from 'next/server';
import { cleanAIText } from '@/lib/utils';

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

    // Build search prompt
    const prompt = `You are a school research expert. Research and provide detailed information about universities that match this student profile:

STUDENT PROFILE:
- Intended Major: ${major}
- Budget: ${budget || 'Not specified'}
- Preferred Location: ${location || 'Any'}
- GPA: ${gpa || 'Not specified'}
- Career Goals: ${goals || 'Not specified'}

Please provide:
1. 10-15 universities that match this profile
2. For each school, include:
   - School name and location
   - Specific program name for ${major}
   - Annual tuition cost
   - Admission requirements (GPA, test scores)
   - Program ranking or reputation
   - Scholarship opportunities
   - Graduate employment rate and average starting salary
   - Key highlights (research opportunities, facilities, faculty)
   - Application deadlines

Focus on recent data (2023-2024) and provide accurate, verifiable information with sources.

Format the response clearly with school names as headers and organized information.`;

    console.log('Calling Perplexity API...');

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
            content: 'You are a helpful education research assistant that provides accurate, up-to-date information about universities and programs.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 4000,
        temperature: 0.2,
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
    const results = cleanAIText(data.choices[0].message.content);
    const citations = data.citations || [];

    // Add citations to results
    let finalResults = results;
    if (citations.length > 0) {
      finalResults += '\n\n---\n\nSOURCES:\n';
      citations.forEach((citation: string, idx: number) => {
        finalResults += `[${idx + 1}] ${citation}\n`;
      });
    }

    return NextResponse.json({
      results: finalResults,
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
