import { useState } from 'react';
import {
  LiteLLMService,
  LiteLLMResponse,
  LiteLLMStreamingResponse,
  Message
} from '@/lib/ai/litellm-service';
import { ModelConfig, TaskTypeValue, ModelTierType, ModelHostingType, ModelProviderType } from '@/lib/ai/litellm-config';

interface UseLiteLLMOptions {
  userTier?: ModelTierType;
  preferredHosting?: ModelHostingType;
  preferredProvider?: ModelProviderType;
  apiKeys?: Record<string, string>;
}

export function useLiteLLM(options: UseLiteLLMOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingOutput, setStreamingOutput] = useState<string>('');

  // Create LiteLLM service instance
  const liteLLM = new LiteLLMService(
    options.apiKeys || {},
    '/api/ai',
    options.userTier || 'free',
    options.preferredHosting || 'cloud',
    options.preferredProvider
  );

  // Function to complete a chat conversation
  const chatCompletion = async (
    messages: Message[],
    task: TaskTypeValue = 'content_generation',
    options: {
      model?: ModelConfig;
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      stop?: string[];
    } = {}
  ): Promise<LiteLLMResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await liteLLM.chatCompletion(messages, task, options);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to stream a chat completion
  const streamChatCompletion = async (
    messages: Message[],
    task: TaskTypeValue = 'content_generation',
    options: {
      model?: ModelConfig;
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      stop?: string[];
    } = {},
    onChunk?: (chunk: LiteLLMStreamingResponse) => void
  ): Promise<void> => {
    console.log('=== STREAM CHAT COMPLETION CALLED ===');
    console.log('Messages:', JSON.stringify(messages, null, 2));
    console.log('Task:', task);
    console.log('Options:', JSON.stringify(options, null, 2));
    console.log('LiteLLM service config:', {
      apiKeys: Object.keys(options.apiKeys || {}),
      userTier: options.userTier,
      preferredHosting: options.preferredHosting,
      preferredProvider: options.preferredProvider
    });

    setIsLoading(true);
    setError(null);
    setStreamingOutput('');

    try {
      console.log('Calling liteLLM.streamChatCompletion...');
      await liteLLM.streamChatCompletion(
        messages,
        task,
        options,
        (chunk) => {
          console.log('Received chunk:', JSON.stringify(chunk, null, 2));
          if (onChunk) {
            onChunk(chunk);
          }

          const content = chunk.choices[0]?.delta?.content || '';
          console.log('Content from chunk:', content);
          setStreamingOutput((prev) => prev + content);
        }
      );
      console.log('Stream completed successfully');
    } catch (err) {
      console.log('=== ERROR IN STREAM CHAT COMPLETION ===');
      console.error('Error in streamChatCompletion:', err);
      console.log('Error details:', err instanceof Error ? err.stack : 'No stack trace available');
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      console.log('Stream chat completion finished');
      setIsLoading(false);
    }
  };

  // Function to generate embeddings
  const generateEmbeddings = async (texts: string[]): Promise<number[][] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await liteLLM.generateEmbeddings(texts);
      return response.embeddings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    chatCompletion,
    streamChatCompletion,
    generateEmbeddings,
    isLoading,
    error,
    streamingOutput,
  };
}
