'use client';

import { useState, useEffect } from 'react';
import { useLiteLLM } from '@/hooks/use-litellm';
import { PROMPT_TEMPLATES } from '@/lib/ai/prompt-templates';
import { Loader2, AlertCircle, CheckCircle, XCircle, AlertTriangle, Info, Clock } from 'lucide-react';
import Markdown from 'react-markdown';

interface Website {
  id: string;
  url: string;
  name: string;
}

interface SiteAuditFormProps {
  userTier: string;
  websites: Website[];
}

interface AuditIssue {
  issue: string;
  description: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendation: string;
}

interface AuditResult {
  score: number;
  summary: string;
  issues: AuditIssue[];
  strengths: string[];
}

export default function SiteAuditForm({ userTier, websites }: SiteAuditFormProps) {
  const [selectedWebsite, setSelectedWebsite] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [isCustomUrl, setIsCustomUrl] = useState<boolean>(false);
  const [pageContent, setPageContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingContent, setIsFetchingContent] = useState<boolean>(false);
  const [fetchProgress, setFetchProgress] = useState<number>(0);
  const [fetchStartTime, setFetchStartTime] = useState<number>(0);
  const [fetchEndTime, setFetchEndTime] = useState<number>(0);
  const [fetchSuccess, setFetchSuccess] = useState<boolean>(false);
  const [contentSize, setContentSize] = useState<number>(0);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [parsedResult, setParsedResult] = useState<boolean>(false);

  const { streamChatCompletion, isLoading: isAiLoading, error, streamingOutput } = useLiteLLM({
    userTier: userTier as any,
  });

  // Auto-hide the success notification after 10 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (fetchSuccess) {
      timer = setTimeout(() => {
        setFetchSuccess(false);
      }, 10000); // 10 seconds
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [fetchSuccess]);

  const fetchPageContent = async (url: string) => {
    // Reset states
    setIsFetchingContent(true);
    setFetchProgress(0);
    setFetchSuccess(false);
    setFetchStartTime(Date.now());
    setContentSize(0);

    try {
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setFetchProgress((prev) => {
          // Simulate progress up to 90% (save the last 10% for actual completion)
          const newProgress = prev + (Math.random() * 5);
          return newProgress < 90 ? newProgress : 90;
        });
      }, 300);

      // Fetch the content
      const response = await fetch(`/api/fetch-page?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch page content');
      }

      const data = await response.json();
      clearInterval(progressInterval);

      // Set final data
      setPageContent(data.content);
      setContentSize(data.contentSize || data.content.length);
      setFetchProgress(100);
      setFetchSuccess(true);
      setFetchEndTime(Date.now());
    } catch (error) {
      console.error('Error fetching page content:', error);
      setPageContent('');
      setFetchSuccess(false);
      setFetchProgress(0);
    } finally {
      setIsFetchingContent(false);
    }
  };

  const handleWebsiteChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const websiteId = e.target.value;
    setSelectedWebsite(websiteId);

    if (websiteId) {
      const website = websites.find(site => site.id === websiteId);
      if (website) {
        await fetchPageContent(website.url);
      }
    }
  };

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUrl(e.target.value);
  };

  const handleCustomUrlSubmit = async () => {
    if (customUrl) {
      await fetchPageContent(customUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setParsedResult(false);

    try {
      // Find the technical SEO audit prompt template
      const promptTemplate = PROMPT_TEMPLATES.find(template => template.id === 'technical-seo-audit');

      if (!promptTemplate) {
        throw new Error('Prompt template not found');
      }

      // Get the URL to audit
      let urlToAudit = '';
      if (isCustomUrl) {
        urlToAudit = customUrl;
      } else {
        const website = websites.find(site => site.id === selectedWebsite);
        if (website) {
          urlToAudit = website.url;
        } else {
          throw new Error('Please select a website to audit');
        }
      }

      if (!urlToAudit) {
        throw new Error('Please provide a URL to audit');
      }

      if (!pageContent) {
        throw new Error('Failed to fetch page content');
      }

      // Prepare the messages
      const messages = [
        {
          role: 'system' as const,
          content: promptTemplate.systemPrompt,
        },
        {
          role: 'user' as const,
          content: promptTemplate.userPrompt
            .replace('{{url}}', urlToAudit)
            .replace('{{pageContent}}', pageContent.substring(0, 10000)) // Limit content length
            .replace('{{additionalContext}}', 'Please format the response as a JSON object with the following properties: score (number 0-100), summary (string), issues (array of objects with issue, description, impact, recommendation), strengths (array of strings).'),
        },
      ];

      // Stream the completion
      await streamChatCompletion(messages, 'technical_seo', {
        temperature: 0.7,
        max_tokens: 3000,
      });

      // Try to parse the JSON response
      try {
        // Find JSON object in the response
        const jsonMatch = streamingOutput.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const parsedResult = JSON.parse(jsonStr);
          setResult(parsedResult);
          setParsedResult(true);
        }
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
      }
    } catch (error) {
      console.error('Error during audit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Critical':
        return 'text-red-600';
      case 'High':
        return 'text-orange-500';
      case 'Medium':
        return 'text-yellow-500';
      case 'Low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'Critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'High':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'Medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'Low':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="customUrl"
            checked={isCustomUrl}
            onChange={() => setIsCustomUrl(!isCustomUrl)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="customUrl" className="text-sm font-medium text-gray-700">
            Use custom URL
          </label>
        </div>

        {isCustomUrl ? (
          <div>
            <label htmlFor="customUrlInput" className="block text-sm font-medium text-gray-700">
              URL to Audit
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="url"
                id="customUrlInput"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="https://example.com"
                value={customUrl}
                onChange={handleCustomUrlChange}
                required
              />
              <button
                type="button"
                onClick={handleCustomUrlSubmit}
                disabled={isFetchingContent || !customUrl}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetchingContent ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  'Fetch Content'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website to Audit
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <select
                id="website"
                className="flex-1 min-w-0 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={selectedWebsite}
                onChange={handleWebsiteChange}
                required
              >
                <option value="">Select a website</option>
                {websites.map((website) => (
                  <option key={website.id} value={website.id}>
                    {website.name} ({website.url})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (selectedWebsite) {
                    const website = websites.find(site => site.id === selectedWebsite);
                    if (website) {
                      fetchPageContent(website.url);
                    }
                  }
                }}
                disabled={isFetchingContent || !selectedWebsite}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetchingContent ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  'Fetch Content'
                )}
              </button>
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || isAiLoading || isFetchingContent || (!selectedWebsite && !customUrl) || !pageContent}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-300 disabled:text-gray-700 disabled:cursor-not-allowed"
          >
            {isLoading || isAiLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Auditing...
              </>
            ) : (
              'Run Technical Audit'
            )}
          </button>
        </div>
      </form>

      {/* Fetch Progress Indicator */}
      {isFetchingContent && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md">
          <div className="flex items-center mb-2">
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Fetching content... {Math.round(fetchProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${fetchProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Fetch Success Notification */}
      {fetchSuccess && !isFetchingContent && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Content fetched successfully</h3>
              <div className="mt-2 text-sm text-green-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Content size: {(contentSize / 1024).toFixed(2)} KB</li>
                  <li>Time taken: {((fetchEndTime - fetchStartTime) / 1000).toFixed(2)} seconds</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {(isLoading || isAiLoading) && (
        <div className="p-4 border border-gray-200 rounded-md">
          <div className="mb-2 text-sm font-medium text-gray-700">
            AI is analyzing your website...
          </div>
          <div className="text-sm text-gray-500 whitespace-pre-wrap">
            {streamingOutput || 'Thinking...'}
          </div>
        </div>
      )}

      {result && parsedResult && (
        <div className="mt-6 space-y-6">
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Audit Score</h3>
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

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700">Summary</h4>
              <p className="mt-1 text-sm text-gray-600">{result.summary}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Technical Issues</h3>
            <div className="mt-2 overflow-hidden bg-white shadow sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {result.issues.map((issue, index) => (
                  <li key={index} className="px-4 py-4 sm:px-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {getImpactIcon(issue.impact)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{issue.issue}</p>
                          <p className={`text-sm font-medium ${getImpactColor(issue.impact)}`}>
                            {issue.impact} Impact
                          </p>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>{issue.description}</p>
                        </div>
                        <div className="mt-2">
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recommendation</h4>
                          <div className="mt-1 text-sm text-gray-700">
                            <Markdown className="prose prose-sm max-w-none">
                              {issue.recommendation}
                            </Markdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Strengths</h3>
            <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="px-4 py-4 sm:px-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-700">{strength}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
