import { z } from 'zod';

// Define model provider types
export const ModelProvider = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  MISTRAL: 'mistral',
  LLAMA: 'llama',
  COHERE: 'cohere',
  TOGETHER: 'together',
  OPENROUTER: 'openrouter',
  OLLAMA: 'ollama',
  CUSTOM: 'custom',
} as const;

export type ModelProviderType = typeof ModelProvider[keyof typeof ModelProvider];

// Define model tiers for different use cases
export const ModelTier = {
  FREE: 'free',
  STANDARD: 'standard',
  PREMIUM: 'premium',
} as const;

export type ModelTierType = typeof ModelTier[keyof typeof ModelTier];

// Define task types for model selection
export const TaskType = {
  CONTENT_GENERATION: 'content_generation',
  KEYWORD_ANALYSIS: 'keyword_analysis',
  TECHNICAL_SEO: 'technical_seo',
  STRATEGY: 'strategy',
  CLASSIFICATION: 'classification',
  SUMMARIZATION: 'summarization',
  EMBEDDING: 'embedding',
} as const;

export type TaskTypeValue = typeof TaskType[keyof typeof TaskType];

// Define model hosting types
export const ModelHosting = {
  CLOUD: 'cloud',
  LOCAL: 'local',
  CUSTOM: 'custom',
} as const;

export type ModelHostingType = typeof ModelHosting[keyof typeof ModelHosting];

// Model configuration schema
export const ModelConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.enum([
    ModelProvider.OPENAI,
    ModelProvider.ANTHROPIC,
    ModelProvider.MISTRAL,
    ModelProvider.LLAMA,
    ModelProvider.COHERE,
    ModelProvider.TOGETHER,
    ModelProvider.OPENROUTER,
    ModelProvider.OLLAMA,
    ModelProvider.CUSTOM,
  ]),
  hosting: z.enum([ModelHosting.CLOUD, ModelHosting.LOCAL, ModelHosting.CUSTOM]).default(ModelHosting.CLOUD),
  baseUrl: z.string().optional(), // For custom endpoints or local hosting
  apiKeyName: z.string().optional(), // Environment variable name for the API key
  tier: z.enum([ModelTier.FREE, ModelTier.STANDARD, ModelTier.PREMIUM]),
  tasks: z.array(
    z.enum([
      TaskType.CONTENT_GENERATION,
      TaskType.KEYWORD_ANALYSIS,
      TaskType.TECHNICAL_SEO,
      TaskType.STRATEGY,
      TaskType.CLASSIFICATION,
      TaskType.SUMMARIZATION,
      TaskType.EMBEDDING,
    ])
  ),
  contextWindow: z.number(),
  costPer1kTokens: z.number(),
  inputCostPer1kTokens: z.number().optional(),
  outputCostPer1kTokens: z.number().optional(),
  maxOutputTokens: z.number(),
});

export type ModelConfig = z.infer<typeof ModelConfigSchema>;

// Define available models
export const AVAILABLE_MODELS: ModelConfig[] = [
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: ModelProvider.OPENAI,
    hosting: ModelHosting.CLOUD,
    apiKeyName: 'OPENAI_API_KEY',
    tier: ModelTier.PREMIUM,
    tasks: [
      TaskType.CONTENT_GENERATION,
      TaskType.KEYWORD_ANALYSIS,
      TaskType.TECHNICAL_SEO,
      TaskType.STRATEGY,
      TaskType.CLASSIFICATION,
      TaskType.SUMMARIZATION,
    ],
    contextWindow: 128000,
    costPer1kTokens: 0.01,
    inputCostPer1kTokens: 0.005,
    outputCostPer1kTokens: 0.015,
    maxOutputTokens: 4096,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: ModelProvider.OPENAI,
    hosting: ModelHosting.CLOUD,
    apiKeyName: 'OPENAI_API_KEY',
    tier: ModelTier.STANDARD,
    tasks: [
      TaskType.CONTENT_GENERATION,
      TaskType.CLASSIFICATION,
      TaskType.SUMMARIZATION,
    ],
    contextWindow: 16385,
    costPer1kTokens: 0.0015,
    inputCostPer1kTokens: 0.0005,
    outputCostPer1kTokens: 0.0015,
    maxOutputTokens: 4096,
  },

  // Anthropic Models
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: ModelProvider.ANTHROPIC,
    hosting: ModelHosting.CLOUD,
    apiKeyName: 'ANTHROPIC_API_KEY',
    tier: ModelTier.PREMIUM,
    tasks: [
      TaskType.CONTENT_GENERATION,
      TaskType.KEYWORD_ANALYSIS,
      TaskType.TECHNICAL_SEO,
      TaskType.STRATEGY,
    ],
    contextWindow: 200000,
    costPer1kTokens: 0.015,
    inputCostPer1kTokens: 0.015,
    outputCostPer1kTokens: 0.075,
    maxOutputTokens: 4096,
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: ModelProvider.ANTHROPIC,
    hosting: ModelHosting.CLOUD,
    apiKeyName: 'ANTHROPIC_API_KEY',
    tier: ModelTier.STANDARD,
    tasks: [
      TaskType.CONTENT_GENERATION,
      TaskType.KEYWORD_ANALYSIS,
      TaskType.SUMMARIZATION,
    ],
    contextWindow: 200000,
    costPer1kTokens: 0.003,
    inputCostPer1kTokens: 0.003,
    outputCostPer1kTokens: 0.015,
    maxOutputTokens: 4096,
  },

  // Mistral Models
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: ModelProvider.MISTRAL,
    hosting: ModelHosting.CLOUD,
    apiKeyName: 'MISTRAL_API_KEY',
    tier: ModelTier.STANDARD,
    tasks: [
      TaskType.CONTENT_GENERATION,
      TaskType.SUMMARIZATION,
      TaskType.CLASSIFICATION,
    ],
    contextWindow: 32768,
    costPer1kTokens: 0.0008,
    inputCostPer1kTokens: 0.0008,
    outputCostPer1kTokens: 0.0024,
    maxOutputTokens: 4096,
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    provider: ModelProvider.MISTRAL,
    hosting: ModelHosting.CLOUD,
    apiKeyName: 'MISTRAL_API_KEY',
    tier: ModelTier.FREE,
    tasks: [TaskType.CLASSIFICATION, TaskType.SUMMARIZATION],
    contextWindow: 32768,
    costPer1kTokens: 0.0002,
    inputCostPer1kTokens: 0.0002,
    outputCostPer1kTokens: 0.0006,
    maxOutputTokens: 4096,
  },

  // Together.ai Models
  {
    id: 'together/llama-3-70b-instruct',
    name: 'Llama 3 70B (Together.ai)',
    provider: ModelProvider.TOGETHER,
    hosting: ModelHosting.CLOUD,
    apiKeyName: 'TOGETHER_API_KEY',
    tier: ModelTier.PREMIUM,
    tasks: [
      TaskType.CONTENT_GENERATION,
      TaskType.KEYWORD_ANALYSIS,
      TaskType.TECHNICAL_SEO,
      TaskType.STRATEGY,
      TaskType.CLASSIFICATION,
      TaskType.SUMMARIZATION,
    ],
    contextWindow: 8192,
    costPer1kTokens: 0.0009,
    inputCostPer1kTokens: 0.0009,
    outputCostPer1kTokens: 0.0009,
    maxOutputTokens: 4096,
  },
  {
    id: 'together/deepseek-coder-33b-instruct',
    name: 'DeepSeek Coder 33B (Together.ai)',
    provider: ModelProvider.TOGETHER,
    hosting: ModelHosting.CLOUD,
    apiKeyName: 'TOGETHER_API_KEY',
    tier: ModelTier.STANDARD,
    tasks: [
      TaskType.CONTENT_GENERATION,
      TaskType.CLASSIFICATION,
      TaskType.SUMMARIZATION,
    ],
    contextWindow: 16384,
    costPer1kTokens: 0.0006,
    inputCostPer1kTokens: 0.0006,
    outputCostPer1kTokens: 0.0006,
    maxOutputTokens: 4096,
  },

  // OpenRouter Models
  {
    id: 'openrouter/anthropic/claude-3-opus',
    name: 'Claude 3 Opus (OpenRouter)',
    provider: ModelProvider.OPENROUTER,
    hosting: ModelHosting.CLOUD,
    apiKeyName: 'OPENROUTER_API_KEY',
    tier: ModelTier.PREMIUM,
    tasks: [
      TaskType.CONTENT_GENERATION,
      TaskType.KEYWORD_ANALYSIS,
      TaskType.TECHNICAL_SEO,
      TaskType.STRATEGY,
    ],
    contextWindow: 200000,
    costPer1kTokens: 0.015,
    inputCostPer1kTokens: 0.015,
    outputCostPer1kTokens: 0.075,
    maxOutputTokens: 4096,
  },
  {
    id: 'openrouter/meta-llama/llama-3-70b-instruct',
    name: 'Llama 3 70B (OpenRouter)',
    provider: ModelProvider.OPENROUTER,
    hosting: ModelHosting.CLOUD,
    apiKeyName: 'OPENROUTER_API_KEY',
    tier: ModelTier.STANDARD,
    tasks: [
      TaskType.CONTENT_GENERATION,
      TaskType.CLASSIFICATION,
      TaskType.SUMMARIZATION,
    ],
    contextWindow: 8192,
    costPer1kTokens: 0.0009,
    inputCostPer1kTokens: 0.0009,
    outputCostPer1kTokens: 0.0009,
    maxOutputTokens: 4096,
  },

  // Ollama (Local) Models
  {
    id: 'ollama/llama3',
    name: 'Llama 3 (Ollama)',
    provider: ModelProvider.OLLAMA,
    hosting: ModelHosting.LOCAL,
    baseUrl: 'http://localhost:11434',
    tier: ModelTier.STANDARD,
    tasks: [
      TaskType.CONTENT_GENERATION,
      TaskType.CLASSIFICATION,
      TaskType.SUMMARIZATION,
    ],
    contextWindow: 8192,
    costPer1kTokens: 0, // Free when run locally
    maxOutputTokens: 4096,
  },
  {
    id: 'ollama/deepseek-coder',
    name: 'DeepSeek Coder (Ollama)',
    provider: ModelProvider.OLLAMA,
    hosting: ModelHosting.LOCAL,
    baseUrl: 'http://localhost:11434',
    tier: ModelTier.STANDARD,
    tasks: [
      TaskType.CONTENT_GENERATION,
      TaskType.CLASSIFICATION,
      TaskType.SUMMARIZATION,
    ],
    contextWindow: 16384,
    costPer1kTokens: 0, // Free when run locally
    maxOutputTokens: 4096,
  },

  // Embedding Models
  {
    id: 'text-embedding-3-large',
    name: 'OpenAI Embeddings Large',
    provider: ModelProvider.OPENAI,
    hosting: ModelHosting.CLOUD,
    apiKeyName: 'OPENAI_API_KEY',
    tier: ModelTier.STANDARD,
    tasks: [TaskType.EMBEDDING],
    contextWindow: 8191,
    costPer1kTokens: 0.00013,
    maxOutputTokens: 3072,
  },
  {
    id: 'text-embedding-3-small',
    name: 'OpenAI Embeddings Small',
    provider: ModelProvider.OPENAI,
    hosting: ModelHosting.CLOUD,
    apiKeyName: 'OPENAI_API_KEY',
    tier: ModelTier.FREE,
    tasks: [TaskType.EMBEDDING],
    contextWindow: 8191,
    costPer1kTokens: 0.00002,
    maxOutputTokens: 1536,
  },
];

// Function to select the appropriate model based on task, user tier, and hosting preference
export function selectModelForTask(
  task: TaskTypeValue,
  userTier: ModelTierType = ModelTier.FREE,
  preferredHosting: ModelHostingType = ModelHosting.CLOUD,
  preferredProvider?: ModelProviderType
): ModelConfig {
  // Filter models by task
  let modelsForTask = AVAILABLE_MODELS.filter((model) =>
    model.tasks.includes(task)
  );

  // Filter by user tier
  modelsForTask = modelsForTask.filter((model) => {
    if (userTier === ModelTier.PREMIUM) {
      return true; // Premium users can use any model
    } else if (userTier === ModelTier.STANDARD) {
      return model.tier !== ModelTier.PREMIUM; // Standard users can use standard and free models
    } else {
      return model.tier === ModelTier.FREE; // Free users can only use free models
    }
  });

  // Apply preferred hosting filter if specified
  if (preferredHosting) {
    const hostingModels = modelsForTask.filter(model => model.hosting === preferredHosting);
    // Only filter if we have models matching the preferred hosting
    if (hostingModels.length > 0) {
      modelsForTask = hostingModels;
    }
  }

  // Apply preferred provider filter if specified
  if (preferredProvider) {
    const providerModels = modelsForTask.filter(model => model.provider === preferredProvider);
    // Only filter if we have models matching the preferred provider
    if (providerModels.length > 0) {
      modelsForTask = providerModels;
    }
  }

  // Sort by preference (premium > standard > free)
  const sortedModels = [...modelsForTask].sort((a, b) => {
    // First sort by tier
    const tierOrder = {
      [ModelTier.PREMIUM]: 3,
      [ModelTier.STANDARD]: 2,
      [ModelTier.FREE]: 1,
    };
    const tierDiff = tierOrder[b.tier] - tierOrder[a.tier];
    if (tierDiff !== 0) return tierDiff;

    // If same tier, prefer the specified hosting type
    if (a.hosting === preferredHosting && b.hosting !== preferredHosting) return -1;
    if (a.hosting !== preferredHosting && b.hosting === preferredHosting) return 1;

    // If same hosting or neither matches preferred, prefer the specified provider
    if (preferredProvider) {
      if (a.provider === preferredProvider && b.provider !== preferredProvider) return -1;
      if (a.provider !== preferredProvider && b.provider === preferredProvider) return 1;
    }

    // If all else is equal, prefer cloud over local over custom
    const hostingOrder = {
      [ModelHosting.CLOUD]: 3,
      [ModelHosting.LOCAL]: 2,
      [ModelHosting.CUSTOM]: 1,
    };
    return hostingOrder[a.hosting] - hostingOrder[b.hosting];
  });

  // Return the best model or fallback to a default
  return (
    sortedModels[0] ||
    AVAILABLE_MODELS.find((model) => model.id === 'mistral-small')!
  );
}

// Function to estimate token usage and cost
export function estimateTokenUsage(
  inputText: string,
  model: ModelConfig,
  estimatedOutputTokens?: number
): {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
} {
  // Rough estimation: 1 token ≈ 4 characters for English text
  const inputTokens = Math.ceil(inputText.length / 4);

  // Use provided output token estimate or default to 25% of input
  const outputTokens = estimatedOutputTokens || Math.ceil(inputTokens * 0.25);

  // Calculate cost
  let totalCost = 0;

  if (model.inputCostPer1kTokens && model.outputCostPer1kTokens) {
    // If model has separate input/output costs
    totalCost =
      (inputTokens / 1000) * model.inputCostPer1kTokens +
      (outputTokens / 1000) * model.outputCostPer1kTokens;
  } else {
    // If model has unified cost
    totalCost = ((inputTokens + outputTokens) / 1000) * model.costPer1kTokens;
  }

  return {
    inputTokens,
    outputTokens,
    totalCost,
  };
}
