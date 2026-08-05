import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { enforceRateLimit } from '@/lib/rateLimit';
import { sanitizeForPrompt } from '@/lib/sanitize';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Auth and rate-limit before touching the request body.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitResponse = await enforceRateLimit(supabase, user.id, 'last_essay_at', 60_000, 'essay generation');
    if (rateLimitResponse) return rateLimitResponse;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const { answers } = await request.json();

    if (!answers || !answers.q1 || !answers.q2 || !answers.q3 || !answers.q4 || !answers.q5) {
      return NextResponse.json(
        { error: 'All questions must be answered' },
        { status: 400 },
      );
    }

    // Sanitize all five answers — strip prompt-escape chars, cap at 2000 chars each.
    const q1 = sanitizeForPrompt(answers.q1, 2000);
    const q2 = sanitizeForPrompt(answers.q2, 2000);
    const q3 = sanitizeForPrompt(answers.q3, 2000);
    const q4 = sanitizeForPrompt(answers.q4, 2000);
    const q5 = sanitizeForPrompt(answers.q5, 2000);

    const prompt = `You are a former Harvard admissions officer helping a student identify their strongest Common App essay angle. Analyze the student's responses and provide:

1. Their single strongest essay topic and why it will stand out
2. The exact opening sentence they should write
3. Three essay approaches they must AVOID because they are overused
4. How this essay angle fits their target schools

Be direct, specific, and honest.

STUDENT RESPONSES:

Q1: Describe 3 experiences that changed how you think about the world
${q1}

Q2: What do you want to study and why? Be specific.
${q2}

Q3: What's something about you that your transcript and grades cannot show?
${q3}

Q4: What do you do on a Saturday with zero obligations?
${q4}

Q5: What problem in the world makes you angry enough to want to fix it?
${q5}

Provide your analysis in a clear, structured format with these exact sections:

YOUR STRONGEST ESSAY ANGLE:
[Identify the single most compelling topic from their responses and explain why it will stand out to admissions officers]

YOUR OPENING SENTENCE:
[Write the exact first sentence they should use to hook the reader]

THREE APPROACHES TO AVOID:
1. [First overused approach and why]
2. [Second overused approach and why]
3. [Third overused approach and why]

HOW THIS FITS YOUR TARGET SCHOOLS:
[Explain how this essay angle aligns with what top universities are looking for]

EXECUTION TIPS:
[3-4 specific tips on how to write this essay effectively]`;

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      prompt,
      temperature: 0.7,
    });

    return NextResponse.json({ strategy: text });
  } catch (error) {
    console.error('Essay generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate essay strategy' },
      { status: 500 },
    );
  }
}
