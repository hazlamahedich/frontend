import { ModelConfig, TaskTypeValue, selectModelForTask, ModelTierType } from './litellm-config';

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
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? model.maxOutputTokens,
      top_p: options.top_p ?? 1,
      frequency_penalty: options.frequency_penalty ?? 0,
      presence_penalty: options.presence_penalty ?? 0,
      stream: false,
      stop: options.stop,
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
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? model.maxOutputTokens,
      top_p: options.top_p ?? 1,
      frequency_penalty: options.frequency_penalty ?? 0,
      presence_penalty: options.presence_penalty ?? 0,
      stream: true,
      stop: options.stop,
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

    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to stream chat');
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.trim() === 'data: [DONE]') continue;

          try {
            const data = JSON.parse(line.replace(/^data: /, ''));
            onChunk(data);
          } catch (e) {
            console.error('Error parsing SSE chunk:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error reading stream:', error);
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
