'use client';

import { useState } from 'react';
import { fillPromptTemplate } from '@/lib/ai/prompt-templates';
import { ModelTierType } from '@/lib/ai/litellm-config';

interface KeywordResearchClientProps {
  userTier: ModelTierType;
  projectId?: string;
}

interface KeywordResult {
  keyword: string;
  searchVolume: string;
  difficulty: string;
  intent: string;
  competition: string;
  seasonality: string;
  relatedKeywords: string;
  recommendation: string;
}

export default function KeywordResearchClient({ userTier, projectId }: KeywordResearchClientProps) {
  const [keywords, setKeywords] = useState('');
  const [industry, setIndustry] = useState('');
  const [audience, setAudience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [streamingOutput, setStreamingOutput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults([]);
    setStreamingOutput('');

    try {
      // Fill the prompt template
      const messages = fillPromptTemplate('keyword-research', {
        keywords,
        industry,
        audience,
        additionalContext: 'IMPORTANT: Your response must be ONLY a valid JSON array of objects with the following properties: keyword, searchVolume, difficulty, intent, competition, seasonality, relatedKeywords, recommendation. The seasonality field should indicate when the keyword is most popular during the year (e.g., "Year-round", "Summer months", "December-January", "Q4", etc.). The relatedKeywords field should contain 3-5 related keywords or phrases separated by commas. Do not include any explanations, markdown formatting, or any text outside the JSON array. The response should start with [ and end with ] and be valid JSON that can be parsed directly with JSON.parse().',
      });

      if (!messages) {
        throw new Error('Failed to generate prompt');
      }

      // Use the AI keyword research API endpoint directly
      const response = await fetch('/api/ai/keyword-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          temperature: 0.7,
          max_tokens: 4096,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      // Process the non-streaming response
      const data = await response.json();
      console.log('Response data:', data);

      // Check if we received an array directly
      if (Array.isArray(data)) {
        console.log('Received array directly from API');
        setResults(data);
        return;
      }

      // Check if we received an error with raw response
      if (data.error && data.rawResponse) {
        console.log('Received error with raw response');
        setStreamingOutput(data.rawResponse);

        // Try to extract JSON from the raw response
        try {
          const startIndex = data.rawResponse.indexOf('[');
          const endIndex = data.rawResponse.lastIndexOf(']');

          if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            const jsonCandidate = data.rawResponse.substring(startIndex, endIndex + 1);
            console.log('JSON candidate found, length:', jsonCandidate.length);
            const parsedResults = JSON.parse(jsonCandidate);
            if (Array.isArray(parsedResults) && parsedResults.length > 0) {
              console.log('Successfully parsed JSON from raw response');
              setResults(parsedResults);
              return;
            }
          }
        } catch (parseError) {
          console.error('Failed to parse JSON from raw response:', parseError);
        }

        throw new Error('Failed to parse results from LLM response');
      }

      // If we get here, something unexpected happened
      setError('Unexpected response format from the API');
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Keywords
          </label>
          <textarea
            id="keywords"
            rows={3}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter keywords, one per line (e.g., seo software, keyword research tool, backlink checker)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enter up to 10 keywords, one per line
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="industry"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Industry
            </label>
            <input
              type="text"
              id="industry"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., Technology, Healthcare, Finance"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="audience"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Target Audience
            </label>
            <input
              type="text"
              id="audience"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., Small Business Owners, Marketing Professionals"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Keywords'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mt-4 text-red-700 bg-red-50 rounded-md dark:bg-red-900 dark:text-red-200">
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Analysis in progress...</h3>
          <div className="p-4 mt-2 bg-gray-50 rounded-md dark:bg-gray-700">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap dark:text-gray-200">{streamingOutput || 'Waiting for response...'}</pre>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 mt-4 text-green-700 bg-green-50 rounded-md dark:bg-green-900 dark:text-green-200">
          <p>{successMessage}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Keyword Analysis Results</h3>
            {projectId && (
              <button
                onClick={async () => {
                  if (!projectId) {
                    setError('No project selected. Please select a project first.');
                    return;
                  }

                  setIsSaving(true);
                  setError(null);
                  setSuccessMessage(null);

                  try {
                    const response = await fetch('/api/keywords/save', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        projectId,
                        keywords: results,
                      }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Failed to save keywords');
                    }

                    const data = await response.json();
                    setSuccessMessage(`Successfully saved ${data.savedKeywords?.length || 0} keywords to your project!`);
                  } catch (error) {
                    setError(`Error saving keywords: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Keywords to Project'}
              </button>
            )}
          </div>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Keyword</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Search Volume</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Difficulty</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Intent</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Competition</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Seasonality</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Related Keywords</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Recommendation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {results.map((result, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">{result.keyword}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">{result.searchVolume}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">{result.difficulty}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">{result.intent}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">{result.competition}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">{result.seasonality}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{result.relatedKeywords}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{result.recommendation}</td>
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
