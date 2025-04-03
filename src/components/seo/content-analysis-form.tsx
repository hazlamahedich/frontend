'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LiteLLMService } from '@/lib/ai/litellm-service';
import { fillPromptTemplate } from '@/lib/ai/prompt-templates';
import { ModelTierType, ModelHosting, ModelHostingType, ModelProviderType } from '@/lib/ai/litellm-config';

interface ContentAnalysisFormProps {
  userTier: ModelTierType;
}

interface ContentAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keywordUsage: {
    keyword: string;
    count: number;
    density: string;
    recommendation: string;
  }[];
  readabilityScore: number;
  readabilityLevel: string;
  contentStructure: {
    headings: number;
    paragraphs: number;
    sentences: number;
    words: number;
  };
}

export default function ContentAnalysisForm({ userTier }: ContentAnalysisFormProps) {
  const [keywords, setKeywords] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ContentAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streamingOutput, setStreamingOutput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
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
      const messages = fillPromptTemplate('content-optimization', {
        keywords,
        content,
        additionalContext: 'Please format the response as a JSON object with the following properties: score (number 0-100), strengths (array of strings), weaknesses (array of strings), recommendations (array of strings), keywordUsage (array of objects with keyword, count, density, recommendation), readabilityScore (number 0-100), readabilityLevel (string), contentStructure (object with headings, paragraphs, sentences, words).',
      });

      if (!messages) {
        throw new Error('Failed to generate prompt');
      }

      // Use streaming for better UX
      let accumulatedText = '';

      await liteLLM.streamChatCompletion(
        messages,
        'content_generation',
        { temperature: 0.7 },
        (chunk) => {
          const content = chunk.choices[0]?.delta?.content || '';
          accumulatedText += content;
          setStreamingOutput(accumulatedText);
        }
      );

      // Try to parse the JSON response
      try {
        // Find JSON object in the response
        const jsonMatch = accumulatedText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const parsedResult = JSON.parse(jsonStr);
          setResult(parsedResult);
        } else {
          setError('Could not parse the AI response. Please try again.');
        }
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        setError('Could not parse the AI response. Please try again.');
      }
    } catch (err) {
      console.error('Content analysis error:', err);
      setError('An error occurred while analyzing content. Please try again.');
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
            Target Keywords
          </label>
          <input
            type="text"
            id="keywords"
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="e.g., seo optimization, content marketing, keyword research"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter keywords separated by commas
          </p>
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Content
          </label>
          <textarea
            id="content"
            rows={10}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Paste your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading || !content.trim() || !keywords.trim()}
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
              'Analyze Content'
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
            AI is analyzing your content...
          </div>
          <div className="text-sm text-gray-500 whitespace-pre-wrap">
            {streamingOutput || 'Thinking...'}
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6">
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Content Score</h3>
              <div className="flex items-center">
                <div className="text-3xl font-bold text-primary-600">{result.score}</div>
                <div className="ml-1 text-sm text-gray-500">/100</div>
              </div>
            </div>

            <div className="w-full h-4 mt-2 bg-gray-200 rounded-full">
              <div
                className="h-4 rounded-full bg-primary-600"
                style={{ width: `${result.score}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Readability</h4>
                <div className="flex items-center mt-1">
                  <div className="text-lg font-semibold text-gray-900">
                    {result.readabilityScore}/100
                  </div>
                  <div className="ml-2 text-sm text-gray-500">
                    ({result.readabilityLevel})
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Structure</h4>
                <div className="mt-1 text-sm text-gray-500">
                  <div>{result.contentStructure.words} words</div>
                  <div>{result.contentStructure.paragraphs} paragraphs</div>
                  <div>{result.contentStructure.headings} headings</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="p-6 bg-green-50 rounded-lg">
              <h3 className="text-lg font-medium text-green-800">Strengths</h3>
              <ul className="mt-4 space-y-2">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="flex">
                    <svg
                      className="flex-shrink-0 w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="ml-2 text-sm text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-red-50 rounded-lg">
              <h3 className="text-lg font-medium text-red-800">Weaknesses</h3>
              <ul className="mt-4 space-y-2">
                {result.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex">
                    <svg
                      className="flex-shrink-0 w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="ml-2 text-sm text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">Recommendations</h3>
            <ul className="mt-4 space-y-2">
              {result.recommendations.map((recommendation, index) => (
                <li key={index} className="flex">
                  <svg
                    className="flex-shrink-0 w-5 h-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="ml-2 text-sm text-gray-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Keyword Usage</h3>
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
                      Count
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                    >
                      Density
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
                  {result.keywordUsage.map((keyword, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {keyword.keyword}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {keyword.count}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {keyword.density}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {keyword.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
