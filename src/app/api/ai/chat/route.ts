import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Message } from '@/lib/ai/litellm-service';
import { ModelTier } from '@/lib/ai/litellm-config';

// Define the request body structure
interface ChatCompletionRequest {
  messages: Message[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  stop?: string[];
  provider?: string;
  base_url?: string;
  api_key?: string;
}

// Define the response structure for non-streaming responses
interface ChatCompletionResponse {
  id: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }[];
  model: string;
  object: string;
  usage: {
    completion_tokens: number;
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
  promptTokens: number,
  completionTokens: number
): Promise<void> {
  if (!userId) return;

  const supabase = createClient();

  // Insert usage record
  const { error } = await supabase.from('token_usage').insert({
    user_id: userId,
    model,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: promptTokens + completionTokens,
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

// Main handler for chat completions
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body: ChatCompletionRequest = await request.json();

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
      apiUrl = body.base_url || 'http://localhost:11434/api/chat';
      // Ollama doesn't need auth headers
    } else if (body.provider === 'together') {
      // Together.ai
      apiUrl = 'https://api.together.xyz/v1/chat/completions';
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
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
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
    } else if (body.model.includes('claude')) {
      // Anthropic
      apiUrl = 'https://api.anthropic.com/v1/messages';
      const apiKey = body.api_key || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Anthropic API key not configured' },
          { status: 500 }
        );
      }
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';

      // Anthropic has a different API format
      requestBody = {
        model: body.model,
        messages: body.messages,
        max_tokens: body.max_tokens,
        temperature: body.temperature,
        stream: body.stream,
      };
    } else if (body.model.includes('mistral')) {
      // Mistral
      apiUrl = 'https://api.mistral.ai/v1/chat/completions';
      const apiKey = body.api_key || process.env.MISTRAL_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Mistral API key not configured' },
          { status: 500 }
        );
      }
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (body.provider === 'custom' && body.base_url) {
      // Custom provider
      apiUrl = body.base_url;
      if (body.api_key) {
        headers['Authorization'] = `Bearer ${body.api_key}`;
      }
    } else {
      // Default to OpenAI
      apiUrl = 'https://api.openai.com/v1/chat/completions';
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

    // Make the request to the LLM provider
    const llmResponse = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!llmResponse.ok) {
      const errorData = await llmResponse.json();
      return NextResponse.json(
        { error: errorData.error?.message || 'Error from LLM provider' },
        { status: llmResponse.status }
      );
    }

    // Handle streaming responses
    if (body.stream) {
      // Set up streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          // Function to send a chunk to the client
          function sendChunk(chunk: string) {
            controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
          }

          try {
            // Stream the response from the LLM provider
            const reader = llmResponse.body?.getReader();
            if (!reader) throw new Error('Response body is null');

            let accumulatedTokens = 0;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              // Forward the chunk to the client
              const chunk = new TextDecoder().decode(value);
              sendChunk(chunk);

              // Roughly estimate token count for streaming (this is approximate)
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.includes('"content":')) {
                  // Roughly count tokens in content (4 chars ≈ 1 token)
                  const contentMatch = line.match(/"content":\s*"([^"]*)"/);
                  if (contentMatch && contentMatch[1]) {
                    accumulatedTokens += Math.ceil(contentMatch[1].length / 4);
                  }
                }
              }
            }

            // Track token usage (approximate for streaming)
            if (userId) {
              // Estimate prompt tokens based on messages
              const promptTokens = body.messages.reduce(
                (sum, msg) => sum + Math.ceil((msg.content?.length || 0) / 4),
                0
              );

              await trackTokenUsage(
                userId,
                body.model,
                promptTokens,
                accumulatedTokens
              );
            }

            // End the stream
            sendChunk('[DONE]');
            controller.close();
          } catch (error) {
            console.error('Error streaming response:', error);
            controller.error(error);
          }
        },
      });

      // Return the streaming response
      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Handle non-streaming response
      const data: ChatCompletionResponse = await llmResponse.json();

      // Track token usage
      if (userId) {
        await trackTokenUsage(
          userId,
          body.model,
          data.usage.prompt_tokens,
          data.usage.completion_tokens
        );
      }

      // Return the response
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error in chat completion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
