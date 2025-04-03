'use client';

import { useState } from 'react';
import { fillPromptTemplate } from '@/lib/ai/prompt-templates';
import Link from 'next/link';
import { LayoutDashboard, Search, FileText, BarChart2, Settings, Globe, Zap, ChevronDown, ChevronRight, Users, Bell, TestTube2, Lightbulb, Menu, X, User, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface KeywordResult {
  keyword: string;
  searchVolume: string;
  difficulty: string;
  intent: string;
  competition: string;
  recommendation: string;
}

export default function KeywordDashboardPage() {
  const [keywords, setKeywords] = useState('');
  const [industry, setIndustry] = useState('');
  const [audience, setAudience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [streamingOutput, setStreamingOutput] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64">
          <div className="flex flex-col h-full px-3 py-4 bg-white border-r dark:bg-gray-900 dark:border-gray-800">
            <div className="mb-6">
              <Link href="/keyword-dashboard" className="flex items-center px-3">
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">Surge</span>
              </Link>
            </div>

            <nav className="flex-1 space-y-1">
              <div className="px-3 py-2 text-sm font-medium text-gray-900 rounded-md dark:text-white">
                <LayoutDashboard size={20} className="inline-block mr-2" />
                Dashboard
              </div>

              <div className="px-3 py-2 text-sm font-medium text-gray-900 rounded-md dark:text-white">
                <Search size={20} className="inline-block mr-2" />
                Keyword Research
              </div>

              <div className="px-3 py-2 text-sm font-medium text-gray-500 rounded-md dark:text-gray-400">
                <Globe size={20} className="inline-block mr-2" />
                Technical SEO
              </div>

              <div className="px-3 py-2 text-sm font-medium text-gray-500 rounded-md dark:text-gray-400">
                <FileText size={20} className="inline-block mr-2" />
                Content Analysis
              </div>

              <div className="px-3 py-2 text-sm font-medium text-gray-500 rounded-md dark:text-gray-400">
                <BarChart2 size={20} className="inline-block mr-2" />
                Rank Tracking
              </div>

              <div className="px-3 py-2 text-sm font-medium text-gray-500 rounded-md dark:text-gray-400">
                <Settings size={20} className="inline-block mr-2" />
                Settings
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4 bg-white border-b dark:bg-gray-900 dark:border-gray-800 sm:px-6 lg:px-8">
          <div className="flex items-center flex-1 gap-4">
            <button
              type="button"
              className="p-1 -ml-1 text-gray-400 lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open sidebar</span>
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <div className="flex w-full max-w-lg lg:ml-0">
              <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  id="search-field"
                  className="block w-full h-full py-2 pl-10 pr-3 text-gray-900 placeholder-gray-500 border-transparent rounded-md dark:bg-gray-800 dark:text-white focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                  placeholder="Search"
                  type="search"
                  name="search"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            <button
              type="button"
              className="p-1 text-gray-400 bg-white rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <span className="sr-only">View notifications</span>
              <Bell size={24} className="w-6 h-6" />
            </button>

            <div className="relative ml-4">
              <div>
                <button
                  type="button"
                  className="flex text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                  id="user-menu-button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="w-8 h-8 bg-primary-100 rounded-full"></div>
                </button>
              </div>

              {isProfileOpen && (
                <div
                  className="absolute right-0 z-10 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Your Profile
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto dark:bg-gray-900">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Keyword Research</h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Discover high-value keywords with AI-powered analysis of search intent, competition, and traffic potential.
                  </p>
                </div>
                
                <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
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

                  {results.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Keyword Analysis Results</h3>
                      <div className="mt-2 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Keyword</th>
                              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Search Volume</th>
                              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Difficulty</th>
                              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Intent</th>
                              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Competition</th>
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
          </div>
        </main>
      </div>
    </div>
  );
}
