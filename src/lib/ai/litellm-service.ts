import { ModelConfig, TaskTypeValue, selectModelForTask, ModelTierType, ModelHostingType, ModelProviderType, ModelProvider, ModelHosting } from './litellm-config';

// Define the response structure from LiteLLM
export interface LiteLLMResponse {
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

// Define the streaming response structure
export interface LiteLLMStreamingResponse {
  id: string;
  choices: {
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
    index: number;
  }[];
  model: string;
  object: string;
}

// Define the message structure
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

// Define the options for the LiteLLM service
export interface LiteLLMOptions {
  model?: ModelConfig;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  stop?: string[];
}

// LiteLLM service class
export class LiteLLMService {
  private apiKeys: Record<string, string>;
  private baseUrl: string;
  private defaultModel: ModelConfig;
  private userTier: ModelTierType;
  private preferredHosting: ModelHostingType;
  private preferredProvider?: ModelProviderType;

  constructor(
    apiKeys: Record<string, string> = {},
    baseUrl: string = '/api/ai',
    userTier: ModelTierType = 'free',
    preferredHosting: ModelHostingType = ModelHosting.CLOUD,
    preferredProvider?: ModelProviderType
  ) {
    this.apiKeys = apiKeys;
    this.baseUrl = baseUrl;
    this.userTier = userTier;
    this.preferredHosting = preferredHosting;
    this.preferredProvider = preferredProvider;
    this.defaultModel = selectModelForTask('content_generation', userTier, preferredHosting, preferredProvider);
  }

  // Method to complete a chat conversation
  async chatCompletion(
    messages: Message[],
    task: TaskTypeValue = 'content_generation',
    options: LiteLLMOptions = {}
  ): Promise<LiteLLMResponse> {
    const model = options.model || selectModelForTask(task, this.userTier, this.preferredHosting, this.preferredProvider);

    // Prepare request body with model-specific configurations
    const requestBody: any = {
      messages,
      model: model.id,
      provider: model.provider,
      base_url: model.baseUrl,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? model.maxOutputTokens,
      top_p: options.top_p ?? 1,
      frequency_penalty: options.frequency_penalty ?? 0,
      presence_penalty: options.presence_penalty ?? 0,
      stream: false,
      stop: options.stop,
    };

    // If using Ollama, make sure to set the provider explicitly
    if (model.provider === 'ollama') {
      console.log('Using Ollama provider with model:', model.id);
      requestBody.provider = 'ollama';
      requestBody.base_url = model.baseUrl || 'http://localhost:11434';
    }

    // Add provider-specific configurations
    if (model.provider === ModelProvider.OLLAMA) {
      requestBody.provider = 'ollama';
      requestBody.base_url = model.baseUrl;
    } else if (model.provider === ModelProvider.TOGETHER) {
      requestBody.provider = 'together';
    } else if (model.provider === ModelProvider.OPENROUTER) {
      requestBody.provider = 'openrouter';
    } else if (model.provider === ModelProvider.CUSTOM && model.baseUrl) {
      requestBody.provider = 'custom';
      requestBody.base_url = model.baseUrl;
    }

    // Add API keys if available
    if (model.apiKeyName && this.apiKeys[model.apiKeyName]) {
      requestBody.api_key = this.apiKeys[model.apiKeyName];
    }

    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete chat');
    }

    return response.json();
  }

  // Method to stream a chat completion
  async streamChatCompletion(
    messages: Message[],
    task: TaskTypeValue = 'content_generation',
    options: LiteLLMOptions = {},
    onChunk: (chunk: LiteLLMStreamingResponse) => void
  ): Promise<void> {
    const model = options.model || selectModelForTask(task, this.userTier, this.preferredHosting, this.preferredProvider);

    // Prepare request body with model-specific configurations
    const requestBody: any = {
      messages,
      model: model.id,
      provider: model.provider,
      base_url: model.baseUrl,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? model.maxOutputTokens,
      top_p: options.top_p ?? 1,
      frequency_penalty: options.frequency_penalty ?? 0,
      presence_penalty: options.presence_penalty ?? 0,
      stream: true,
      stop: options.stop,
    };

    // If using Ollama, make sure to set the provider explicitly
    if (model.provider === 'ollama') {
      console.log('Using Ollama provider with model:', model.id);
      requestBody.provider = 'ollama';
      requestBody.base_url = model.baseUrl || 'http://localhost:11434';
    }

    // Add provider-specific configurations
    if (model.provider === ModelProvider.OLLAMA) {
      requestBody.provider = 'ollama';
      requestBody.base_url = model.baseUrl;
    } else if (model.provider === ModelProvider.TOGETHER) {
      requestBody.provider = 'together';
    } else if (model.provider === ModelProvider.OPENROUTER) {
      requestBody.provider = 'openrouter';
    } else if (model.provider === ModelProvider.CUSTOM && model.baseUrl) {
      requestBody.provider = 'custom';
      requestBody.base_url = model.baseUrl;
    }

    // Add API keys if available
    if (model.apiKeyName && this.apiKeys[model.apiKeyName]) {
      requestBody.api_key = this.apiKeys[model.apiKeyName];
    }

    // Determine the correct URL based on the provider
    let apiUrl = `${this.baseUrl}/chat`;

    console.log('=== LITELLM SERVICE MAKING FETCH REQUEST ===');
    console.log('Base URL:', this.baseUrl);
    console.log('API URL:', apiUrl);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response received. Status:', response.status, response.statusText);
      console.log('Response headers:', JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));

      if (!response.ok) {
        console.log('Response not OK. Attempting to read error...');
        try {
          const errorText = await response.text();
          console.error('Error response text:', errorText);

          try {
            const error = JSON.parse(errorText);
            console.error('Parsed error:', error);
            throw new Error(error.error || error.message || 'Failed to stream chat');
          } catch (parseError) {
            console.error('Failed to parse error response as JSON:', parseError);
            throw new Error(`Failed to stream chat: ${errorText || response.statusText}`);
          }
        } catch (textError) {
          console.error('Failed to read error response text:', textError);
          throw new Error(`Failed to stream chat: ${response.statusText}`);
        }
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }

    if (!response.body) {
      console.error('Response body is null');
      throw new Error('Response body is null');
    }

    console.log('Getting reader from response body...');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    console.log('Reader and decoder set up');

    try {
      console.log('Starting to read chunks...');
      let chunkCount = 0;
      while (true) {
        console.log(`Reading chunk ${++chunkCount}...`);
        const { done, value } = await reader.read();
        if (done) {
          console.log('Reading complete (done=true)');
          break;
        }

        const decodedChunk = decoder.decode(value, { stream: true });
        console.log(`Received chunk ${chunkCount} of length ${decodedChunk.length}`);
        console.log(`Chunk preview: ${decodedChunk.substring(0, 100)}${decodedChunk.length > 100 ? '...' : ''}`);

        buffer += decodedChunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        console.log(`Processing ${lines.length} lines from buffer`);

        for (const line of lines) {
          console.log(`Processing line: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
          if (line.trim() === '') {
            console.log('Skipping empty line');
            continue;
          }
          if (line.trim() === 'data: [DONE]') {
            console.log('Received [DONE] signal');
            continue;
          }

          try {
            console.log('Parsing JSON from line...');
            const jsonStr = line.replace(/^data: /, '');
            console.log(`JSON string: ${jsonStr.substring(0, 100)}${jsonStr.length > 100 ? '...' : ''}`);
            const data = JSON.parse(jsonStr);

            // Check if this is an Ollama response format and convert it to OpenAI format
            if (data.model && data.message && !data.choices) {
              console.log('Detected Ollama response format, converting to OpenAI format');
              const convertedData = {
                id: data.model,
                object: 'chat.completion.chunk',
                created: Date.now(),
                model: data.model,
                choices: [
                  {
                    index: 0,
                    delta: {
                      content: data.message.content || ''
                    },
                    finish_reason: data.done ? 'stop' : null
                  }
                ]
              };
              console.log('Converted data:', JSON.stringify(convertedData, null, 2));
              onChunk(convertedData);
            } else {
              // Standard OpenAI format
              onChunk(data);
            }
          } catch (e) {
            console.log('=== ERROR PARSING SSE CHUNK ===');
            console.error('Error parsing SSE chunk:', e);
            console.log('Error details:', e instanceof Error ? e.stack : 'No stack trace available');
            console.log('Problematic line:', line);
          }
        }
      }
    } catch (error) {
      console.log('=== ERROR READING STREAM ===');
      console.error('Error reading stream:', error);
      console.log('Error details:', error instanceof Error ? error.stack : 'No stack trace available');
      throw error;
    }
  }

  // Method to generate embeddings
  async generateEmbeddings(
    texts: string[]
  ): Promise<{ embeddings: number[][]; usage: { total_tokens: number } }> {
    const model = selectModelForTask('embedding', this.userTier, this.preferredHosting, this.preferredProvider);

    // Prepare request body with model-specific configurations
    const requestBody: any = {
      input: texts,
      model: model.id,
    };

    // Add provider-specific configurations
    if (model.provider === ModelProvider.OLLAMA) {
      requestBody.provider = 'ollama';
      requestBody.base_url = model.baseUrl;
    } else if (model.provider === ModelProvider.TOGETHER) {
      requestBody.provider = 'together';
    } else if (model.provider === ModelProvider.OPENROUTER) {
      requestBody.provider = 'openrouter';
    } else if (model.provider === ModelProvider.CUSTOM && model.baseUrl) {
      requestBody.provider = 'custom';
      requestBody.base_url = model.baseUrl;
    }

    // Add API keys if available
    if (model.apiKeyName && this.apiKeys[model.apiKeyName]) {
      requestBody.api_key = this.apiKeys[model.apiKeyName];
    }

    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate embeddings');
    }

    return response.json();
  }
}
