import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/utils/supabase/server';
import { enforceRateLimit } from '@/lib/rateLimit';
import { sanitizeForPrompt } from '@/lib/sanitize';

interface MetricsPayload {
  safety: number;
  social: number;
  local: number;
  roi: number;
}

const clampScore = (v: unknown): number => {
  const n = Number(v);
  return isNaN(n) ? 50 : Math.max(0, Math.min(100, Math.round(n)));
};


export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitResponse = await enforceRateLimit(supabase, user.id, 'last_chat_at', 10_000, 'chat message');
    if (rateLimitResponse) return rateLimitResponse;

    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Cap conversation history to prevent context-window overflow and runaway API spend.
    const cappedMessages = messages.slice(-40);

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const isDeepResearch = context?.type === 'deep-research';
    const safeSchoolName = sanitizeForPrompt(context?.schoolName);
    const safeLocation = sanitizeForPrompt(context?.location);

    // ── DEEP RESEARCH MODE: Perplexity real-time intel ──
    let researchedData = '';
    if (isDeepResearch && safeSchoolName && process.env.PERPLEXITY_API_KEY) {
      try {
        const perpController = new AbortController();
        const perpTimeout = setTimeout(() => perpController.abort(), 8000);
        const perpResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          signal: perpController.signal,
          headers: {
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [
              {
                role: 'system',
                content: 'You are a high-fidelity intelligence researcher. Provide raw, brutally honest, verified real-time data. Focus on student safety, crime rates, campus culture (not marketing), and cost of living.',
              },
              {
                role: 'user',
                content: `Research deep intel for ${safeSchoolName} in ${safeLocation}:
1. Crime & Safety: Recent incidents, areas to avoid, night safety.
2. Student Life Reality: Best clubs, social hierarchy, pressure levels.
3. Local Vibe: Transit, food scene, cost of living for students.
Return a concise data-rich briefing.`,
              },
            ],
            max_tokens: 1200,
            temperature: 0.2,
          }),
        });
        clearTimeout(perpTimeout);
        if (perpResponse.ok) {
          const perpData = await perpResponse.json();
          researchedData = perpData.choices[0].message.content;
        }
      } catch {
        // Perplexity is optional — Claude proceeds without it
      }
    }

    // ── SYSTEM PROMPT ──
    const systemPrompt = `You are a high-level Strategic Education Advisor for Rivernova.
You provide elite, data-backed intelligence to help students make life-changing decisions.
${researchedData ? `\nREAL-TIME INTEL (prioritize this):\n${researchedData}\n` : ''}
${safeSchoolName ? `Focusing on: ${safeSchoolName} (${safeLocation})` : ''}

Rules:
1. Be brutally honest. If a city is dangerous or a school has a toxic culture, say it directly.
2. Use provided real-time intel to back up claims.
3. Keep responses professional, surgical, and actionable.
4. Start deep-research responses with a bold STRATEGIC BRIEFING header.
5. CRITICAL: Always write your complete text briefing FIRST. Only call tools AFTER your full text response is written. Never skip the text.`;

    const anthropicMessages = cappedMessages.map((msg: { role: string; content: string }) => ({
      role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: typeof msg.content === 'string' ? msg.content : '',
    }));

    // ── CALL CLAUDE (tool use for deep-research to get metrics reliably) ──
    const callParams: Parameters<typeof anthropic.messages.create>[0] = {
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: anthropicMessages,
    };

    if (isDeepResearch) {
      (callParams as any).tools = [
        {
          name: 'report_metrics',
          description: 'Call this tool AFTER you have finished writing your complete text briefing. Submit intelligence scores for the school and city.',
          input_schema: {
            type: 'object',
            properties: {
              safety:  { type: 'number', description: 'Campus and city safety (0=very dangerous, 100=very safe)' },
              social:  { type: 'number', description: 'Student social life quality (0=poor, 100=excellent)' },
              local:   { type: 'number', description: 'City livability for students (0=poor, 100=excellent)' },
              roi:     { type: 'number', description: 'Career outcomes and ROI strength (0=poor, 100=excellent)' },
            },
            required: ['safety', 'social', 'local', 'roi'],
          },
        },
      ];
      (callParams as any).tool_choice = { type: 'any' };
    }

    const response = await anthropic.messages.create(callParams) as Awaited<ReturnType<typeof anthropic.messages.create>> & { content: Anthropic.ContentBlock[] };

    // ── EXTRACT TEXT + METRICS FROM RESPONSE BLOCKS ──
    let assistantText = '';
    let metrics: MetricsPayload | null = null;

    for (const block of response.content) {
      if (block.type === 'text') {
        assistantText += block.text;
      } else if (block.type === 'tool_use' && block.name === 'report_metrics') {
        const inp = block.input as Record<string, unknown>;
        metrics = {
          safety: clampScore(inp.safety),
          social: clampScore(inp.social),
          local:  clampScore(inp.local),
          roi:    clampScore(inp.roi),
        };
        console.log('[chat/route] Metrics via tool use:', metrics);
      }
    }

    // If Claude only called the tool and wrote no text, generate a fallback so the chat isn't empty
    if (!assistantText.trim() && metrics && isDeepResearch) {
      assistantText = `## Strategic Briefing: ${context?.schoolName ?? 'This Institution'}\n\nIntelligence analysis complete. Scores reflect real-time data across safety, student social life, local livability, and career ROI. Ask me anything specific about this institution.`;
    }

    return NextResponse.json({ message: assistantText.trim(), metrics });

  } catch (error: unknown) {
    const err = error as { status?: number; error?: { message?: string }; message?: string };
    const detail = err?.error?.message || err?.message || 'Unknown error';
    const status = err?.status;
    console.error('Chat API error:', status, detail);
    return NextResponse.json(
      { error: `${status ? `[${status}] ` : ''}${detail}` },
      { status: 500 }
    );
  }
}
