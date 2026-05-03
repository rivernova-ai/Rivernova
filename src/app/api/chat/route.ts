import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    const { messages, userProfile, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    let researchedData = '';
    
    // ── DEEP RESEARCH MODE (Perplexity Integration) ──
    if (context?.type === 'deep-research' && process.env.PERPLEXITY_API_KEY) {
      console.log('DEEP RESEARCH MODE: Calling Perplexity for real-time intel...');
      try {
        const perpResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [{
              role: 'system',
              content: 'You are a high-fidelity intelligence researcher. Provide raw, brutally honest, and verified real-time data. Focus on student safety, crime rates in specific neighborhoods, campus culture (not marketing fluff), and actual cost of living for students. Be specific with names of neighborhoods and clubs.'
            }, {
              role: 'user',
              content: `Research deep intel for ${context.schoolName} in ${context.location}. 
              1. Detailed Crime & Safety: Recent incidents, areas to avoid near campus, and night safety sentiment.
              2. Student Life Reality: Best clubs, social hierarchy, pressure levels, and "hidden gem" spots.
              3. Local Vibe: Public transit efficiency for students and the actual local food/nightlife scene.
              Return a concise but data-rich briefing.`
            }],
            max_tokens: 1500,
            temperature: 0.2,
          }),
        });

        if (perpResponse.ok) {
          const perpData = await perpResponse.json();
          researchedData = perpData.choices[0].message.content;
          console.log('Perplexity Research Success');
        }
      } catch (err) {
        console.error('Perplexity research failed:', err);
      }
    }

    // ── CLAUDE SYNTHESIS ──
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const systemPrompt = `You are a high-level Strategic Education Advisor for Rivernova. 
    You provide elite, data-backed intelligence to help students make life-changing decisions.
    
    ${researchedData ? `REAL-TIME INTEL FOUND (Prioritize this data):
    ${researchedData}` : ''}

    ${context?.schoolName ? `Focusing on: ${context.schoolName} (${context.location})` : ''}
    
    Rules:
    1. Be brutally honest. If a city is dangerous or a school has a toxic culture, say it directly.
    2. Use the provided real-time intel to back up your claims.
    3. Keep responses professional, surgical, and actionable.
    4. Start deep-research responses with a bold 'STRATEGIC BRIEFING' header.
    5. At the very end of your response, if you have enough data, provide a JSON block for visualization using exactly this format on its own line:
       [METRICS: {"safety": number, "social": number, "local": number, "roi": number}]
       Numbers should be 1-100 based on your analysis.`;

    const anthropicMessages = messages.map((msg: any) => ({
      role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content,
    }));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({
      message: assistantMessage,
      usage: response.usage,
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process chat request' }, { status: 500 });
  }
}
