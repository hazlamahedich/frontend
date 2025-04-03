'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LiteLLMService, Message } from '@/lib/ai/litellm-service';
import { fillPromptTemplate } from '@/lib/ai/prompt-templates';
import { ModelTierType, ModelHosting, ModelHostingType, ModelProviderType } from '@/lib/ai/litellm-config';

interface KeywordResearchFormProps {
  userTier: ModelTierType;
}

interface KeywordResult {
  keyword: string;
  searchVolume: string;
  difficulty: string;
  intent: string;
  competition: string;
  recommendation: string;
}

export default function KeywordResearchForm({ userTier }: KeywordResearchFormProps) {
  const [keywords, setKeywords] = useState('');
  const [industry, setIndustry] = useState('');
  const [audience, setAudience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [streamingOutput, setStreamingOutput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults([]);
    setStreamingOutput('');

    try {
      // Get user's model settings
      const supabase = createClient();
      const { data: modelSettings } = await supabase
        .from('user_model_settings')
        .select('*')
        .single();

      // Create LiteLLM service instance with user's preferred settings
      const liteLLM = new LiteLLMService(
        modelSettings?.api_keys || {},
        '/api/ai',
        userTier,
        (modelSettings?.preferred_hosting as ModelHostingType) || ModelHosting.CLOUD,
        (modelSettings?.preferred_provider as ModelProviderType)
      );

      // Fill the prompt template
      const messages = fillPromptTemplate('keyword-research', {
        keywords,
        industry,
        audience,
        additionalContext: 'Please format the response as a JSON array of objects with the following properties: keyword, searchVolume, difficulty, intent, competition, recommendation.',
      });

      if (!messages) {
        throw new Error('Failed to generate prompt');
      }

      // Use streaming for better UX
      let accumulatedText = '';

      await liteLLM.streamChatCompletion(
        messages,
        'keyword_analysis',
        { temperature: 0.7 },
        (chunk) => {
          const content = chunk.choices[0]?.delta?.content || '';
          accumulatedText += content;
          setStreamingOutput(accumulatedText);
        }
      );

      // Try to parse the JSON response
      try {
        // Find JSON array in the response
        const jsonMatch = accumulatedText.match(/\[\s*\{.*\}\s*\]/s);

        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const parsedResults = JSON.parse(jsonStr);
          setResults(parsedResults);
        } else {
          setError('Could not parse the AI response. Please try again.');
        }
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        setError('Could not parse the AI response. Please try again.');
      }
    } catch (err) {
      console.error('Keyword research error:', err);
      setError('An error occurred while analyzing keywords. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="keywords"
            className="block text-sm font-medium text-gray-700"
          >
            Keywords
          </label>
          <textarea
            id="keywords"
            rows={3}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Enter keywords, one per line (e.g., seo software, keyword research tool, backlink checker)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter up to 10 keywords, one per line
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="industry"
              className="block text-sm font-medium text-gray-700"
            >
              Industry
            </label>
            <input
              type="text"
              id="industry"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="e.g., SaaS, E-commerce, Healthcare"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="audience"
              className="block text-sm font-medium text-gray-700"
            >
              Target Audience
            </label>
            <input
              type="text"
              id="audience"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="e.g., Marketing professionals, Small business owners"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading || !keywords.trim()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg
                  className="w-4 h-4 mr-2 -ml-1 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Analyzing...
              </>
            ) : (
              'Analyze Keywords'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="p-4 border border-gray-200 rounded-md">
          <div className="mb-2 text-sm font-medium text-gray-700">
            AI is analyzing your keywords...
          </div>
          <div className="text-sm text-gray-500 whitespace-pre-wrap">
            {streamingOutput || 'Thinking...'}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Keyword Analysis Results</h3>
          <div className="mt-4 overflow-hidden border border-gray-200 rounded-md shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Keyword
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Search Volume
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Difficulty
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Intent
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Competition
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Recommendation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {result.keyword}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {result.searchVolume}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {result.difficulty}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {result.intent}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {result.competition}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {result.recommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
