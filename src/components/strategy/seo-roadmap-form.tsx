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

interface Project {
  id: string;
  name: string;
  description: string;
}

interface SEORoadmapFormProps {
  userTier: string;
  websites: Website[];
  projects: Project[];
}

export default function SEORoadmapForm({ userTier, websites, projects }: SEORoadmapFormProps) {
  const [selectedWebsite, setSelectedWebsite] = useState<string>('');
  const [businessGoals, setBusinessGoals] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [currentPerformance, setCurrentPerformance] = useState<string>('');
  const [resources, setResources] = useState<string>('limited');
  const [timeframe, setTimeframe] = useState<string>('6months');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  
  const { streamChatCompletion, isLoading, error, streamingOutput } = useLiteLLM({
    userTier: userTier as any,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWebsite) {
      return;
    }
    
    // Find the SEO roadmap prompt template
    const promptTemplate = PROMPT_TEMPLATES.find(template => template.id === 'seo-strategy-roadmap');
    
    if (!promptTemplate) {
      return;
    }
    
    // Get the selected website URL
    const website = websites.find(site => site.id === selectedWebsite);
    
    if (!website) {
      return;
    }
    
    // Prepare the user prompt
    const userPrompt = `Please create an SEO strategy roadmap for the following website:

Website: ${website.url}
Business Goals: ${businessGoals}
Target Audience: ${targetAudience}
Current Performance: ${currentPerformance}
Available Resources: ${resources === 'limited' ? 'Limited (1-2 people)' : resources === 'moderate' ? 'Moderate (small team)' : 'Extensive (dedicated team)'}
Timeframe: ${timeframe === '3months' ? '3 months' : timeframe === '6months' ? '6 months' : '12 months'}

${additionalContext ? `Additional Context: ${additionalContext}` : ''}`;

    // Prepare the messages
    const messages = [
      {
        role: 'system' as const,
        content: promptTemplate.systemPrompt,
      },
      {
        role: 'user' as const,
        content: userPrompt,
      },
    ];
    
    // Stream the completion
    await streamChatCompletion(messages, 'strategy', {
      temperature: 0.7,
      max_tokens: 3000,
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
          <label htmlFor="businessGoals" className="block text-sm font-medium text-gray-700">
            Business Goals
          </label>
          <textarea
            id="businessGoals"
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="What are your main business goals? (e.g., increase leads, boost sales, improve brand awareness)"
            value={businessGoals}
            onChange={(e) => setBusinessGoals(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
            Target Audience
          </label>
          <textarea
            id="targetAudience"
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Describe your target audience (demographics, interests, pain points)"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="currentPerformance" className="block text-sm font-medium text-gray-700">
            Current SEO Performance
          </label>
          <textarea
            id="currentPerformance"
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Describe your current SEO performance (rankings, traffic, issues)"
            value={currentPerformance}
            onChange={(e) => setCurrentPerformance(e.target.value)}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="resources" className="block text-sm font-medium text-gray-700">
              Available Resources
            </label>
            <select
              id="resources"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={resources}
              onChange={(e) => setResources(e.target.value)}
            >
              <option value="limited">Limited (1-2 people)</option>
              <option value="moderate">Moderate (small team)</option>
              <option value="extensive">Extensive (dedicated team)</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700">
              Roadmap Timeframe
            </label>
            <select
              id="timeframe"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="3months">3 Months</option>
              <option value="6months">6 Months</option>
              <option value="12months">12 Months</option>
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
            placeholder="Any additional information about your business, industry, competitors, etc."
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
                Generating Roadmap...
              </>
            ) : (
              'Generate SEO Roadmap'
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
          <h3 className="text-lg font-medium text-gray-900">SEO Strategy Roadmap</h3>
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
