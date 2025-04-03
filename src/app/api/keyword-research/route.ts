import { NextRequest, NextResponse } from 'next/server';
import { fillPromptTemplate } from '@/lib/ai/prompt-templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, industry, audience } = body;

    // Fill the prompt template
    const messages = fillPromptTemplate('keyword-research', {
      keywords,
      industry,
      audience,
      additionalContext: 'IMPORTANT: Your response must be ONLY a valid JSON array of objects with the following properties: keyword, searchVolume, difficulty, intent, competition, seasonality, relatedKeywords, recommendation. The seasonality field should indicate when the keyword is most popular during the year (e.g., "Year-round", "Summer months", "December-January", "Q4", etc.). The relatedKeywords field should contain 3-5 related keywords or phrases separated by commas. Do not include any explanations, markdown formatting, or any text outside the JSON array. The response should start with [ and end with ] and be valid JSON that can be parsed directly with JSON.parse().',
    });

    if (!messages) {
      return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 400 });
    }

    // Use the dedicated keyword research API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai/keyword-research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: false,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `API request failed with status ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in keyword research API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
