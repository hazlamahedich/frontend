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
  console.log('=== AI CHAT API CALLED ===');
  try {
    console.log('Parsing request body...');
    // Get the request body
    const body: ChatCompletionRequest = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));

    // Get user information from session
    console.log('Getting user session...');
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    console.log('User ID:', userId);

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
      console.log('=== OLLAMA PROVIDER DETECTED ===');
      // Ollama (local)
      apiUrl = body.base_url ? `${body.base_url}/api/chat` : 'http://localhost:11434/api/chat';
      // Add debug logging for Ollama requests
      console.log('Using Ollama with URL:', apiUrl);

      try {
        console.log('Testing Ollama connection...');
        // Extract the base URL (remove /api/chat)
        const baseUrl = apiUrl.replace('/api/chat', '');
        const testUrl = `${baseUrl}/api/tags`;
        console.log('Testing Ollama connection with URL:', testUrl);
        const testResponse = await fetch(testUrl);
        if (testResponse.ok) {
          const tags = await testResponse.json();
          console.log('Ollama is running. Available models:', JSON.stringify(tags, null, 2));
        } else {
          console.error('Ollama connection test failed:', testResponse.status, testResponse.statusText);
        }
      } catch (error) {
        console.error('Error testing Ollama connection:', error);
      }

      // For Ollama, we need to completely override the model and format
      // Force it to use deepseek-r1:14b for all Ollama requests
      console.log('Original model:', requestBody.model);
      requestBody.model = 'deepseek-r1:14b';
      console.log('Forced model to:', requestBody.model);

      // Remove the provider-specific prefix if it exists
      if (requestBody.model.startsWith('ollama/')) {
        requestBody.model = requestBody.model.replace('ollama/', '');
        console.log('Removed ollama/ prefix, model is now:', requestBody.model);
      }

      // Simplify the request body for Ollama
      const ollamaRequestBody = {
        model: requestBody.model,
        messages: requestBody.messages
      };

      console.log('Simplified request body for Ollama:', JSON.stringify(ollamaRequestBody, null, 2));
      requestBody = ollamaRequestBody;

      // Ollama doesn't need auth headers
      console.log('Ollama setup complete')
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
    console.log('=== MAKING REQUEST TO LLM PROVIDER ===');
    console.log('API URL:', apiUrl);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    console.log('Sending fetch request...');
    const llmResponse = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    console.log('Response received. Status:', llmResponse.status, llmResponse.statusText);
    console.log('Response headers:', JSON.stringify(Object.fromEntries([...llmResponse.headers.entries()]), null, 2));

    if (!llmResponse.ok) {
      console.log('=== LLM RESPONSE ERROR ===');
      console.log('Response not OK. Status:', llmResponse.status, llmResponse.statusText);
      try {
        // Try to get the error text first
        console.log('Attempting to read error response text...');
        const errorText = await llmResponse.text();
        console.error('LLM provider error text:', errorText);

        // Try to parse as JSON if possible
        try {
          console.log('Attempting to parse error text as JSON...');
          const errorData = JSON.parse(errorText);
          console.error('LLM provider error data:', errorData);
          console.log('Returning JSON error response');
          return NextResponse.json(
            { error: errorData.error?.message || 'Error from LLM provider' },
            { status: llmResponse.status }
          );
        } catch (jsonError) {
          // If it's not valid JSON, return the text
          console.error('Failed to parse error as JSON:', jsonError);
          console.log('Returning text error response');
          return NextResponse.json(
            { error: `Error from LLM provider: ${errorText || llmResponse.statusText}` },
            { status: llmResponse.status }
          );
        }
      } catch (e) {
        // If we can't even get the text, return the status text
        console.error('Failed to get error response:', e);
        console.log('Returning status text error response');
        return NextResponse.json(
          { error: `Error from LLM provider: ${llmResponse.statusText}` },
          { status: llmResponse.status }
        );
      }
    }

    // Handle streaming responses
    if (body.stream) {
      console.log('=== HANDLING STREAMING RESPONSE ===');
      // Set up streaming response
      const encoder = new TextEncoder();
      console.log('Setting up ReadableStream...');
      const stream = new ReadableStream({
        async start(controller) {
          // Function to send a chunk to the client
          function sendChunk(chunk: string) {
            controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
          }

          try {
            console.log('Starting to stream response from LLM provider...');
            // Stream the response from the LLM provider
            const reader = llmResponse.body?.getReader();
            if (!reader) {
              console.error('Response body is null');
              throw new Error('Response body is null');
            }
            console.log('Got reader from response body');

            let accumulatedTokens = 0;

            console.log('Starting read loop...');
            let chunkCount = 0;
            while (true) {
              console.log(`Reading chunk ${++chunkCount}...`);
              const { done, value } = await reader.read();
              if (done) {
                console.log('Read complete (done=true)');
                break;
              }

              // Forward the chunk to the client
              const chunk = new TextDecoder().decode(value);
              console.log(`Received chunk ${chunkCount} of length ${chunk.length}`);
              console.log(`Chunk preview: ${chunk.substring(0, 100)}${chunk.length > 100 ? '...' : ''}`);
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
            console.log('Streaming complete, sending [DONE]');
            sendChunk('[DONE]');
            controller.close();
          } catch (error) {
            console.log('=== ERROR DURING STREAMING ===');
            console.error('Error streaming response:', error);
            console.log('Sending error to client');
            controller.error(error);
          }
        },
      });

      // Return the streaming response
      console.log('Returning streaming response to client');
      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      console.log('=== HANDLING NON-STREAMING RESPONSE ===');
      // Handle non-streaming response
      console.log('Parsing response JSON...');
      const data: ChatCompletionResponse = await llmResponse.json();
      console.log('Response data:', JSON.stringify(data, null, 2));

      // Track token usage
      if (userId) {
        console.log('Tracking token usage...');
        await trackTokenUsage(
          userId,
          body.model,
          data.usage.prompt_tokens,
          data.usage.completion_tokens
        );
        console.log('Token usage tracked');
      }

      // Return the response
      console.log('Returning JSON response to client');
      return NextResponse.json(data);
    }
  } catch (error) {
    console.log('=== FATAL ERROR IN CHAT COMPLETION ===');
    console.error('Error in chat completion:', error);
    console.log('Error details:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
