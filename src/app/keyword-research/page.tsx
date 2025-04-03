'use client';

import { useState } from 'react';
import { fillPromptTemplate } from '@/lib/ai/prompt-templates';

export default function KeywordResearchPage() {
  const [keywords, setKeywords] = useState('');
  const [industry, setIndustry] = useState('');
  const [audience, setAudience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [streamingOutput, setStreamingOutput] = useState('');

  const handleSubmit = async (e) => {
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
        additionalContext: 'IMPORTANT: Your response must be ONLY a valid JSON array of objects with the following properties: keyword, searchVolume, difficulty, intent, competition, recommendation. Do not include any explanations, markdown formatting, or any text outside the JSON array. The response should start with [ and end with ] and be valid JSON that can be parsed directly with JSON.parse().',
      });

      if (!messages) {
        throw new Error('Failed to generate prompt');
      }

      // Use the dedicated keyword research API endpoint
      const response = await fetch('/api/ai/keyword-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          temperature: 0.7,
          max_tokens: 4096,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is null');
      }

      // Process the streaming response
      let accumulatedText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));

        for (const line of lines) {
          try {
            // Extract the JSON data from the SSE format
            const jsonStr = line.replace(/^data: /, '').trim();
            if (jsonStr === '[DONE]') continue;

            const data = JSON.parse(jsonStr);
            const content = data.response || '';
            accumulatedText += content;
            setStreamingOutput(accumulatedText);
          } catch (error) {
            console.error('Error parsing chunk:', error);
          }
        }
      }

      // Try to parse the JSON response
      try {
        // Log the accumulated text for debugging
        console.log('Accumulated text length:', accumulatedText.length);
        console.log('Accumulated text preview:', accumulatedText.substring(0, 500) + '...');

        // Look for JSON array pattern in the text
        console.log('Looking for JSON array in the text...');

        // Try different regex patterns
        const jsonRegexPatterns = [
          /\[(\s*\{.*?\}\s*)(,\s*\{.*?\}\s*)*\]/gs,  // Standard JSON array
          /```json\s*\[(.*?)\]\s*```/gs,                // JSON in markdown code block
          /\[(.*?)\]/gs                                 // Any array
        ];

        // Try each pattern
        for (const pattern of jsonRegexPatterns) {
          console.log('Trying pattern:', pattern);
          const matches = accumulatedText.match(pattern);
          console.log('Matches found:', matches ? matches.length : 0);

          if (matches && matches.length > 0) {
            // Try each match until we find one that parses successfully
            for (const match of matches) {
              console.log('Trying to parse match:', match.substring(0, 100) + '...');
              try {
                const parsedResults = JSON.parse(match);

                // Validate that the parsed result is an array
                if (Array.isArray(parsedResults) && parsedResults.length > 0) {
                  console.log('Successfully parsed JSON result');
                  console.log('Parsed results:', parsedResults);
                  setResults(parsedResults);
                  return; // Exit the function once we've found a valid result
                } else {
                  console.log('Parsed result is not an array or is empty');
                }
              } catch (innerError) {
                // Just continue to the next match
                console.error('Failed to parse match:', innerError);
              }
            }
          }
        }

        // If we get here, we couldn't parse any valid JSON
        console.log('Could not find valid JSON in the response');

        // Try a last resort approach - look for anything that looks like a JSON array
        console.log('Trying last resort approach...');
        // Extract anything that looks like a JSON array with objects
        const lastResortMatch = accumulatedText.match(/\[\s*\{[\s\S]*?\}\s*\]/g);
        if (lastResortMatch) {
          console.log('Last resort match found:', lastResortMatch[0].substring(0, 100) + '...');
          try {
            const cleanedJson = lastResortMatch[0].replace(/\\n/g, '').replace(/\\r/g, '').replace(/\\t/g, '');
            console.log('Cleaned JSON:', cleanedJson.substring(0, 100) + '...');
            const parsedResults = JSON.parse(cleanedJson);
            if (Array.isArray(parsedResults) && parsedResults.length > 0) {
              console.log('Successfully parsed JSON with last resort approach');
              setResults(parsedResults);
              return;
            }
          } catch (lastResortError) {
            console.error('Last resort parsing failed:', lastResortError);
          }
        }

        // If all else fails, try to extract a JSON array from the text using a more manual approach
        console.log('Trying manual extraction...');
        const startIndex = accumulatedText.indexOf('[');
        const endIndex = accumulatedText.lastIndexOf(']');

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          const jsonCandidate = accumulatedText.substring(startIndex, endIndex + 1);
          console.log('JSON candidate found:', jsonCandidate.substring(0, 100) + '...');
          try {
            const parsedResults = JSON.parse(jsonCandidate);
            if (Array.isArray(parsedResults) && parsedResults.length > 0) {
              console.log('Successfully parsed JSON with manual extraction');
              setResults(parsedResults);
              return;
            }
          } catch (manualError) {
            console.error('Manual extraction failed:', manualError);
          }
        }

        setError('Failed to parse results. The response format was not as expected.');
      } catch (parseError) {
        console.error('Error in overall parsing process:', parseError);
        setError('Failed to parse results. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Keyword Research</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Discover high-value keywords with AI-powered analysis of search intent, competition, and traffic potential.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Keywords
              </label>
              <textarea
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Enter keywords (one per line)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
                required
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Industry
              </label>
              <input
                id="industry"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Technology, Healthcare, Finance"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Target Audience
              </label>
              <input
                id="audience"
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Small Business Owners, Marketing Professionals"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Keywords'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Analysis in progress...</h3>
              <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{streamingOutput || 'Waiting for response...'}</pre>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Keyword Analysis Results</h3>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Keyword</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Search Volume</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Difficulty</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Intent</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Competition</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {results.map((result, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{result.keyword}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{result.searchVolume}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{result.difficulty}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{result.intent}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{result.competition}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{result.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
