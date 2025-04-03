import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ModelTier } from '@/lib/ai/litellm-config';

// Define the request body structure
interface EmbeddingsRequest {
  input: string | string[];
  model: string;
  provider?: string;
  base_url?: string;
  api_key?: string;
}

// Define the response structure
interface EmbeddingsResponse {
  data: {
    embedding: number[];
    index: number;
    object: string;
  }[];
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// Function to get user tier from Supabase
async function getUserTier(userId: string): Promise<string> {
  if (!userId) return ModelTier.FREE;

  const supabase = createClient();

  // Get user profile with subscription information
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user tier:', error);
    return ModelTier.FREE;
  }

  return data.subscription_tier || ModelTier.FREE;
}

// Function to track token usage
async function trackTokenUsage(
  userId: string,
  model: string,
  promptTokens: number
): Promise<void> {
  if (!userId) return;

  const supabase = createClient();

  // Insert usage record
  const { error } = await supabase.from('token_usage').insert({
    user_id: userId,
    model,
    prompt_tokens: promptTokens,
    completion_tokens: 0, // No completion tokens for embeddings
    total_tokens: promptTokens,
    timestamp: new Date().toISOString(),
  });

  if (error) {
    console.error('Error tracking token usage:', error);
  }
}

// Function to check if user has exceeded their token limit
async function hasExceededTokenLimit(userId: string, tier: string): Promise<boolean> {
  if (!userId) return false;

  const supabase = createClient();

  // Get current month's usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('token_usage')
    .select('total_tokens')
    .eq('user_id', userId)
    .gte('timestamp', startOfMonth.toISOString());

  if (error) {
    console.error('Error checking token limit:', error);
    return false;
  }

  // Calculate total tokens used this month
  const totalTokens = data.reduce((sum, record) => sum + record.total_tokens, 0);

  // Define limits based on tier
  const limits = {
    [ModelTier.FREE]: 50000, // 50k tokens for free tier
    [ModelTier.STANDARD]: 500000, // 500k tokens for standard tier
    [ModelTier.PREMIUM]: 5000000, // 5M tokens for premium tier
  };

  const limit = limits[tier as keyof typeof limits] || limits[ModelTier.FREE];

  return totalTokens >= limit;
}

// Main handler for embeddings
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body: EmbeddingsRequest = await request.json();

    // Get user information from session
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Get user tier
    const userTier = await getUserTier(userId || '');

    // Check if user has exceeded their token limit
    if (userId && await hasExceededTokenLimit(userId, userTier)) {
      return NextResponse.json(
        { error: 'Token limit exceeded for this month' },
        { status: 429 }
      );
    }

    // Prepare the request to the LLM provider
    let apiUrl: string;
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    let requestBody = { ...body };

    // Handle different model providers
    if (body.provider === 'ollama') {
      // Ollama (local)
      apiUrl = body.base_url ? `${body.base_url}/api/embeddings` : 'http://localhost:11434/api/embeddings';
      // Ollama doesn't need auth headers
    } else if (body.provider === 'together') {
      // Together.ai
      apiUrl = 'https://api.together.xyz/v1/embeddings';
      const apiKey = body.api_key || process.env.TOGETHER_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Together API key not configured' },
          { status: 500 }
        );
      }
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (body.provider === 'openrouter') {
      // OpenRouter
      apiUrl = 'https://openrouter.ai/api/v1/embeddings';
      const apiKey = body.api_key || process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: 'OpenRouter API key not configured' },
          { status: 500 }
        );
      }
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'https://surge-seo.com';
      headers['X-Title'] = 'Surge SEO Platform';
    } else if (body.provider === 'custom' && body.base_url) {
      // Custom provider
      apiUrl = body.base_url;
      if (body.api_key) {
        headers['Authorization'] = `Bearer ${body.api_key}`;
      }
    } else {
      // Default to OpenAI
      apiUrl = 'https://api.openai.com/v1/embeddings';
      const apiKey = body.api_key || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        );
      }
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Remove sensitive information from the request body before sending to the provider
    delete requestBody.api_key;
    delete requestBody.provider;
    delete requestBody.base_url;

    // Make the request to the embeddings API
    const embeddingsResponse = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!embeddingsResponse.ok) {
      const errorData = await embeddingsResponse.json();
      return NextResponse.json(
        { error: errorData.error?.message || 'Error from OpenAI' },
        { status: embeddingsResponse.status }
      );
    }

    // Parse the response
    const data: EmbeddingsResponse = await embeddingsResponse.json();

    // Track token usage
    if (userId) {
      await trackTokenUsage(
        userId,
        body.model,
        data.usage.prompt_tokens
      );
    }

    // Return the embeddings
    return NextResponse.json({
      embeddings: data.data.map(item => item.embedding),
      usage: data.usage,
    });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
