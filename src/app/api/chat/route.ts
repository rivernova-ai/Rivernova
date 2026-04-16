import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    const { messages, userProfile } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log('Using API key:', process.env.ANTHROPIC_API_KEY.substring(0, 20) + '...');

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build system prompt with user context
    const systemPrompt = `You are an AI education advisor for Rivernova, a platform helping students find their perfect schools. 

${userProfile ? `Student Profile:
- Major: ${userProfile.academic_background?.major || 'Not specified'}
- GPA: ${userProfile.academic_background?.gpa || 'Not specified'}
- Budget: ${userProfile.budget?.min && userProfile.budget?.max ? `$${userProfile.budget.min}-$${userProfile.budget.max}` : 'Not specified'}
- Preferred Location: ${userProfile.location_preferences?.preferredCountries || 'Not specified'}
- Career Goals: ${userProfile.career_goals?.dreamJob || userProfile.career_goals?.careerField || 'Not specified'}
` : ''}

Your role:
- Help students with school selection, application strategies, and education planning
- Provide personalized advice based on their profile
- Answer questions about programs, scholarships, admissions, and career paths
- Be encouraging, supportive, and informative
- Keep responses concise and actionable

Always maintain a friendly, professional tone and focus on helping students achieve their educational goals.`;

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    console.log('Calling Claude API with model: claude-sonnet-4-20250514');

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    return NextResponse.json({
      message: assistantMessage,
      usage: response.usage,
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Better error message for model not found
    if (error.status === 404 && error.error?.error?.type === 'not_found_error') {
      return NextResponse.json(
        { error: 'Claude model not available. Please check your Anthropic API key has model access enabled and credits available at console.anthropic.com' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
