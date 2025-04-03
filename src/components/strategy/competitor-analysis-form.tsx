'use client';

import { useState } from 'react';
import { useLiteLLM } from '@/hooks/use-litellm';
import { PROMPT_TEMPLATES } from '@/lib/ai/prompt-templates';
import { Loader2, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';

interface Website {
  id: string;
  url: string;
  name: string;
}

interface CompetitorAnalysisFormProps {
  userTier: string;
  websites: Website[];
}

export default function CompetitorAnalysisForm({ userTier, websites }: CompetitorAnalysisFormProps) {
  const [selectedWebsite, setSelectedWebsite] = useState<string>('');
  const [competitorUrls, setCompetitorUrls] = useState<string>('');
  const [targetKeywords, setTargetKeywords] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  
  const { streamChatCompletion, isLoading, error, streamingOutput } = useLiteLLM({
    userTier: userTier as any,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWebsite || !competitorUrls) {
      return;
    }
    
    // Find the competitor analysis prompt template
    const promptTemplate = PROMPT_TEMPLATES.find(template => template.id === 'competitor-analysis');
    
    if (!promptTemplate) {
      return;
    }
    
    // Get the selected website URL
    const website = websites.find(site => site.id === selectedWebsite);
    
    if (!website) {
      return;
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
          .replace('{{competitorUrls}}', competitorUrls)
          .replace('{{ourWebsite}}', website.url)
          .replace('{{targetKeywords}}', targetKeywords)
          .replace('{{additionalContext}}', additionalContext),
      },
    ];
    
    // Stream the completion
    await streamChatCompletion(messages, 'strategy', {
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    setResult(streamingOutput);
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
          <label htmlFor="competitorUrls" className="block text-sm font-medium text-gray-700">
            Competitor URLs
          </label>
          <textarea
            id="competitorUrls"
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Enter competitor URLs (one per line)"
            value={competitorUrls}
            onChange={(e) => setCompetitorUrls(e.target.value)}
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the URLs of your main competitors, one per line.
          </p>
        </div>
        
        <div>
          <label htmlFor="targetKeywords" className="block text-sm font-medium text-gray-700">
            Target Keywords
          </label>
          <textarea
            id="targetKeywords"
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Enter target keywords (comma separated)"
            value={targetKeywords}
            onChange={(e) => setTargetKeywords(e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the keywords you want to target, separated by commas.
          </p>
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
                Analyzing...
              </>
            ) : (
              'Analyze Competitors'
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
          <h3 className="text-lg font-medium text-gray-900">Competitor Analysis</h3>
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
