'use client';

import { useState } from 'react';
import { useLiteLLM } from '@/hooks/use-litellm';
import { Loader2, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';

interface Website {
  id: string;
  url: string;
  name: string;
}

interface Keyword {
  id: string;
  keyword: string;
  search_volume: number;
  difficulty: number;
  intent: string;
}

interface ContentPlannerFormProps {
  userTier: string;
  websites: Website[];
  keywords: Keyword[];
}

export default function ContentPlannerForm({ userTier, websites, keywords }: ContentPlannerFormProps) {
  const [selectedWebsite, setSelectedWebsite] = useState<string>('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [contentType, setContentType] = useState<string>('blog');
  const [timeframe, setTimeframe] = useState<string>('3months');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  
  const { streamChatCompletion, isLoading, error, streamingOutput } = useLiteLLM({
    userTier: userTier as any,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWebsite || selectedKeywords.length === 0) {
      return;
    }
    
    // Get the selected website URL
    const website = websites.find(site => site.id === selectedWebsite);
    
    if (!website) {
      return;
    }
    
    // Get the selected keywords
    const keywordsList = selectedKeywords.map(id => {
      const keyword = keywords.find(k => k.id === id);
      return keyword ? keyword.keyword : '';
    }).filter(Boolean).join(', ');
    
    // Prepare the system prompt
    const systemPrompt = `You are an expert SEO content strategist with deep knowledge of content marketing, search intent, and audience targeting. Your task is to create a comprehensive content plan based on the provided keywords, audience, and business context.

Focus on these key areas:
1. Content topics and ideas that align with the target keywords
2. Content formats that best serve the search intent
3. Content structure and outline recommendations
4. Internal linking strategy
5. Content promotion tactics
6. Performance metrics to track

For each content piece in your plan:
- Provide a compelling title
- Include a brief description of the content
- Outline the key sections and points to cover
- Suggest relevant keywords to include
- Recommend content format and length
- Explain how it addresses the target audience's needs

Your goal is to create a strategic content plan that will drive organic traffic, engage the target audience, and support business objectives.`;

    // Prepare the user prompt
    const userPrompt = `Please create a content plan for the following:

Website: ${website.url}
Target Keywords: ${keywordsList}
Target Audience: ${targetAudience}
Content Type: ${contentType === 'blog' ? 'Blog posts' : contentType === 'landing' ? 'Landing pages' : contentType === 'mixed' ? 'Mixed content types' : 'Blog posts'}
Timeframe: ${timeframe === '1month' ? '1 month' : timeframe === '3months' ? '3 months' : timeframe === '6months' ? '6 months' : '3 months'}

${additionalContext ? `Additional Context: ${additionalContext}` : ''}`;

    // Prepare the messages
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      {
        role: 'user' as const,
        content: userPrompt,
      },
    ];
    
    // Stream the completion
    await streamChatCompletion(messages, 'content_generation', {
      temperature: 0.7,
      max_tokens: 2000,
    });
  };
  
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Your Website
          </label>
          <select
            id="website"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            value={selectedWebsite}
            onChange={(e) => setSelectedWebsite(e.target.value)}
            required
          >
            <option value="">Select a website</option>
            {websites.map((website) => (
              <option key={website.id} value={website.id}>
                {website.name} ({website.url})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Target Keywords
          </label>
          <div className="mt-1 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
            {keywords.length > 0 ? (
              keywords.map((keyword) => (
                <div key={keyword.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`keyword-${keyword.id}`}
                    value={keyword.id}
                    checked={selectedKeywords.includes(keyword.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedKeywords([...selectedKeywords, keyword.id]);
                      } else {
                        setSelectedKeywords(selectedKeywords.filter(id => id !== keyword.id));
                      }
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`keyword-${keyword.id}`} className="ml-2 block text-sm text-gray-900">
                    {keyword.keyword} {keyword.search_volume ? `(${keyword.search_volume}/mo)` : ''}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 p-2">
                No keywords found. Please add keywords in the Keyword Research section.
              </p>
            )}
          </div>
          {selectedKeywords.length === 0 && (
            <p className="mt-1 text-sm text-red-500">
              Please select at least one keyword.
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
            Target Audience
          </label>
          <input
            type="text"
            id="targetAudience"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Describe your target audience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contentType" className="block text-sm font-medium text-gray-700">
              Content Type
            </label>
            <select
              id="contentType"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <option value="blog">Blog Posts</option>
              <option value="landing">Landing Pages</option>
              <option value="mixed">Mixed Content Types</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700">
              Timeframe
            </label>
            <select
              id="timeframe"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="1month">1 Month</option>
              <option value="3months">3 Months</option>
              <option value="6months">6 Months</option>
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="additionalContext" className="block text-sm font-medium text-gray-700">
            Additional Context
          </label>
          <textarea
            id="additionalContext"
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Any additional information about your business, goals, etc."
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
          />
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Plan...
              </>
            ) : (
              'Generate Content Plan'
            )}
          </button>
        </div>
      </form>
      
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
      
      {streamingOutput && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Content Plan</h3>
          <div className="mt-2 p-4 bg-white border border-gray-200 rounded-md overflow-auto max-h-[600px]">
            <Markdown className="prose prose-sm max-w-none">
              {streamingOutput}
            </Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
