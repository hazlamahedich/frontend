'use client';

import { useState, useEffect } from 'react';
import { useLiteLLM } from '@/hooks/use-litellm';
import { Loader2, Info, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import {
  ModelTierType,
  ModelHostingType,
  ModelProviderType,
  AVAILABLE_MODELS,
  ModelProvider,
  TaskType
} from '@/lib/ai/litellm-config';

interface AITestComponentProps {
  userTier: ModelTierType;
  preferredProvider: ModelProviderType;
  preferredHosting: ModelHostingType;
  apiKeys: Record<string, string>;
}

export default function AITestComponent({
  userTier,
  preferredProvider,
  preferredHosting,
  apiKeys,
}: AITestComponentProps) {
  const [testPrompt, setTestPrompt] = useState<string>('Explain what SEO is in one paragraph.');
  const [testResponse, setTestResponse] = useState<string>('');
  const [isTestingModel, setIsTestingModel] = useState<boolean>(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(1024);

  // Initialize LiteLLM hook with user settings
  const { streamChatCompletion, isLoading, error, streamingOutput } = useLiteLLM({
    userTier,
    preferredHosting,
    preferredProvider,
    apiKeys,
  });

  // Get available models based on user tier and preferences
  const availableModels = AVAILABLE_MODELS.filter(model => {
    // Filter by user tier
    if (userTier === 'premium') {
      // Premium users can use any model
      return true;
    } else if (userTier === 'standard') {
      // Standard users can use standard and free models
      return model.tier !== 'premium';
    } else {
      // Free users can only use free models
      return model.tier === 'free';
    }
  }).filter(model => {
    // Filter by preferred hosting if specified
    if (preferredHosting && preferredHosting !== 'cloud') {
      return model.hosting === preferredHosting;
    }
    return true;
  }).filter(model => {
    // Filter by preferred provider if specified
    if (preferredProvider && preferredProvider !== 'openai') {
      return model.provider === preferredProvider;
    }
    return true;
  }).filter(model => {
    // Only include models that can do content generation
    return model.tasks.includes(TaskType.CONTENT_GENERATION);
  });

  // Set default selected model based on preferences
  useEffect(() => {
    // Try to find a model that matches the preferred provider and hosting
    const matchingModel = availableModels.find(model =>
      model.provider === preferredProvider && model.hosting === preferredHosting
    );

    // If no exact match, try to find a model that matches just the provider
    const providerMatch = !matchingModel ? availableModels.find(model =>
      model.provider === preferredProvider
    ) : null;

    // If no provider match, try to find a model that matches just the hosting
    const hostingMatch = !matchingModel && !providerMatch ? availableModels.find(model =>
      model.hosting === preferredHosting
    ) : null;

    // Set the selected model to the best match, or the first available model
    setSelectedModel(matchingModel?.id || providerMatch?.id || hostingMatch?.id || (availableModels[0]?.id || ''));
  }, [preferredProvider, preferredHosting, availableModels]);

  // Handle test prompt change
  const handleTestPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTestPrompt(e.target.value);
  };

  // Handle model selection change
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

  // Handle temperature change
  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemperature(parseFloat(e.target.value));
  };

  // Handle max tokens change
  const handleMaxTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxTokens(parseInt(e.target.value, 10));
  };

  // Test the AI model
  const handleTestModel = async () => {
    console.log('=== TESTING AI MODEL ===');
    console.log('User tier:', userTier);
    console.log('Preferred provider:', preferredProvider);
    console.log('Preferred hosting:', preferredHosting);
    console.log('Selected model:', selectedModel);
    console.log('API keys available for:', Object.keys(apiKeys));
    console.log('Test prompt:', testPrompt);
    console.log('Temperature:', temperature);
    console.log('Max tokens:', maxTokens);

    setIsTestingModel(true);
    setTestResponse('');
    setTestError(null);
    setTestSuccess(false);
    setResponseTime(null);

    const startTime = Date.now();

    try {
      console.log('Calling streamChatCompletion...');

      // Find the selected model configuration
      const modelConfig = AVAILABLE_MODELS.find(model => model.id === selectedModel);

      if (!modelConfig) {
        throw new Error(`Model ${selectedModel} not found in available models`);
      }

      await streamChatCompletion(
        [
          {
            role: 'system',
            content: 'You are a helpful AI assistant specializing in SEO and digital marketing.',
          },
          {
            role: 'user',
            content: testPrompt,
          },
        ],
        'content_generation',
        {
          model: modelConfig,
          temperature: temperature,
          max_tokens: maxTokens
        }
      );

      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      console.log('Stream chat completion successful');
      console.log('Response time:', endTime - startTime, 'ms');
      setTestSuccess(true);
    } catch (err) {
      console.log('=== ERROR TESTING AI MODEL ===');
      console.error('Error testing AI model:', err);
      console.log('Error details:', err instanceof Error ? err.stack : 'No stack trace available');
      setTestError(err instanceof Error ? err.message : 'Failed to test AI model. Please check your settings and try again.');
    } finally {
      console.log('Test completed');
      setIsTestingModel(false);
    }
  };

  // Get the selected model details
  const selectedModelDetails = AVAILABLE_MODELS.find(model => model.id === selectedModel);

  return (
    <div className="space-y-4 mt-8 p-4 border border-gray-200 rounded-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Test AI Connection</h2>
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
        >
          {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
          <Info className="ml-1 w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-gray-500">
        Test your AI model configuration by sending a test prompt and seeing if it responds.
      </p>

      {testError && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p>{testError}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {testSuccess && (
        <div className="p-4 text-sm text-green-700 bg-green-100 rounded-md flex items-start">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Success</p>
            <p>AI model test successful! You can see the response below.</p>
            {responseTime && (
              <p className="mt-1 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Response time: {(responseTime / 1000).toFixed(2)} seconds
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="modelSelect" className="block text-sm font-medium text-gray-700">
            Select Model
          </label>
          <select
            id="modelSelect"
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            value={selectedModel}
            onChange={handleModelChange}
          >
            {availableModels.length === 0 ? (
              <option value="">No models available for your settings</option>
            ) : (
              availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))
            )}
          </select>
          {selectedModelDetails && (
            <div className="mt-2 text-xs text-gray-500">
              <p>Provider: {selectedModelDetails.provider}</p>
              <p>Hosting: {selectedModelDetails.hosting}</p>
              <p>Context Window: {selectedModelDetails.contextWindow.toLocaleString()} tokens</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="testPrompt" className="block text-sm font-medium text-gray-700">
            Test Prompt
          </label>
          <textarea
            id="testPrompt"
            rows={3}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Enter a test prompt for the AI model"
            value={testPrompt}
            onChange={handleTestPromptChange}
          />
        </div>
      </div>

      {showAdvancedOptions && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4 p-4 bg-gray-50 rounded-md">
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
              Temperature: {temperature}
            </label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={handleTemperatureChange}
              className="w-full mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              Lower values (0) make responses more deterministic, higher values (1) make responses more creative.
            </p>
          </div>

          <div>
            <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700">
              Max Tokens: {maxTokens}
            </label>
            <input
              id="maxTokens"
              type="range"
              min="256"
              max={selectedModelDetails?.maxOutputTokens || 2048}
              step="256"
              value={maxTokens}
              onChange={handleMaxTokensChange}
              className="w-full mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum number of tokens to generate in the response.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={handleTestModel}
          disabled={isLoading || !testPrompt || !selectedModel}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-300 disabled:text-gray-700 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            'Test AI Model'
          )}
        </button>
      </div>

      {streamingOutput && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700">AI Response:</h3>
          <div className="p-4 mt-2 bg-gray-50 rounded-md text-sm text-gray-800 whitespace-pre-wrap border border-gray-200">
            {streamingOutput}
          </div>
        </div>
      )}
    </div>
  );
}
