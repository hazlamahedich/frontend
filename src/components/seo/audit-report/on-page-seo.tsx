'use client';

import React from 'react';
import StatusIndicator from '../visualizations/status-indicator';
import ProgressBar from '../visualizations/progress-bar';

interface OnPageSEOData {
  title: {
    value: string;
    length: number;
    status: 'success' | 'error' | 'warning' | 'info';
    message: string;
  };
  metaDescription: {
    value: string;
    length: number;
    status: 'success' | 'error' | 'warning' | 'info';
    message: string;
  };
  headings: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    hasProperStructure: boolean;
    status: 'success' | 'error' | 'warning' | 'info';
    message: string;
  };
  keywordConsistency: {
    mainKeywords: string[];
    titleContainsKeyword: boolean;
    descriptionContainsKeyword: boolean;
    h1ContainsKeyword: boolean;
    contentContainsKeyword: boolean;
    keywordDensity: number;
    status: 'success' | 'error' | 'warning' | 'info';
    message: string;
  };
  content: {
    wordCount: number;
    paragraphCount: number;
    status: 'success' | 'error' | 'warning' | 'info';
    message: string;
  };
  images: {
    count: number;
    withAlt: number;
    withoutAlt: number;
    status: 'success' | 'error' | 'warning' | 'info';
    message: string;
  };
  links: {
    internalCount: number;
    externalCount: number;
    status: 'success' | 'error' | 'warning' | 'info';
    message: string;
  };
  canonicalTag: {
    exists: boolean;
    value: string;
    status: 'success' | 'error' | 'warning' | 'info';
    message: string;
  };
  hreflang: {
    exists: boolean;
    values: string[];
    status: 'success' | 'error' | 'warning' | 'info';
    message: string;
  };
  ssl: {
    enabled: boolean;
    status: 'success' | 'error' | 'warning' | 'info';
    message: string;
  };
}

interface OnPageSEOProps {
  data: OnPageSEOData;
}

export default function OnPageSEO({ data }: OnPageSEOProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">On-Page SEO Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title Tag Analysis */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Title Tag</h3>
          <StatusIndicator status={data.title.status} text={data.title.message} className="mb-3" />
          <div className="p-3 bg-gray-50 rounded mb-2 text-sm font-mono break-words">
            {data.title.value || 'No title found'}
          </div>
          <div className="text-sm text-gray-600">
            Length: {data.title.length} characters
            {data.title.length > 60 && <span className="text-yellow-600"> (Too long)</span>}
            {data.title.length < 30 && <span className="text-yellow-600"> (Too short)</span>}
          </div>
        </div>
        
        {/* Meta Description */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Meta Description</h3>
          <StatusIndicator status={data.metaDescription.status} text={data.metaDescription.message} className="mb-3" />
          <div className="p-3 bg-gray-50 rounded mb-2 text-sm font-mono break-words">
            {data.metaDescription.value || 'No meta description found'}
          </div>
          <div className="text-sm text-gray-600">
            Length: {data.metaDescription.length} characters
            {data.metaDescription.length > 160 && <span className="text-yellow-600"> (Too long)</span>}
            {data.metaDescription.length < 70 && <span className="text-yellow-600"> (Too short)</span>}
          </div>
        </div>
        
        {/* SERP Preview */}
        <div className="border rounded-lg p-4 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">SERP Preview</h3>
          <div className="p-4 border rounded bg-white">
            <div className="text-xl text-blue-700 font-medium mb-1 truncate">
              {data.title.value || 'Title not found'}
            </div>
            <div className="text-sm text-green-700 mb-1">
              {window.location.origin}
            </div>
            <div className="text-sm text-gray-600 line-clamp-2">
              {data.metaDescription.value || 'Description not found'}
            </div>
          </div>
        </div>
        
        {/* Headings Structure */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Headings Structure</h3>
          <StatusIndicator status={data.headings.status} text={data.headings.message} className="mb-3" />
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">H1</span>
              <span className="text-sm text-gray-600">{data.headings.h1Count} {data.headings.h1Count !== 1 && <span className="text-yellow-600">(Should be exactly 1)</span>}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">H2</span>
              <span className="text-sm text-gray-600">{data.headings.h2Count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">H3</span>
              <span className="text-sm text-gray-600">{data.headings.h3Count}</span>
            </div>
          </div>
        </div>
        
        {/* Keyword Consistency */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Keyword Consistency</h3>
          <StatusIndicator status={data.keywordConsistency.status} text={data.keywordConsistency.message} className="mb-3" />
          
          {data.keywordConsistency.mainKeywords.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {data.keywordConsistency.mainKeywords.map((keyword, index) => (
                  <span key={index} className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded">
                    {keyword}
                  </span>
                ))}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${data.keywordConsistency.titleContainsKeyword ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">Title</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${data.keywordConsistency.descriptionContainsKeyword ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">Meta Description</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${data.keywordConsistency.h1ContainsKeyword ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">H1 Heading</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${data.keywordConsistency.contentContainsKeyword ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">Content</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Keyword Density: {data.keywordConsistency.keywordDensity.toFixed(1)}%</div>
                <ProgressBar 
                  value={Math.min(data.keywordConsistency.keywordDensity * 20, 100)} 
                  showPercentage={false}
                  color={
                    data.keywordConsistency.keywordDensity < 0.5 ? '#f97316' : // Orange for too low
                    data.keywordConsistency.keywordDensity > 3 ? '#f97316' : // Orange for too high
                    '#22c55e' // Green for good range
                  }
                />
                <div className="text-xs text-gray-500 mt-1">
                  {data.keywordConsistency.keywordDensity < 0.5 && 'Keyword density is too low'}
                  {data.keywordConsistency.keywordDensity > 0.5 && data.keywordConsistency.keywordDensity <= 3 && 'Keyword density is good'}
                  {data.keywordConsistency.keywordDensity > 3 && 'Keyword density is too high'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No main keywords detected</div>
          )}
        </div>
        
        {/* Content Analysis */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Content Analysis</h3>
          <StatusIndicator status={data.content.status} text={data.content.message} className="mb-3" />
          
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium mb-1">Word Count: {data.content.wordCount}</div>
              <ProgressBar 
                value={Math.min(data.content.wordCount / 15, 100)} 
                showPercentage={false}
                color={
                  data.content.wordCount < 300 ? '#f97316' : // Orange for too low
                  '#22c55e' // Green for good
                }
              />
              <div className="text-xs text-gray-500 mt-1">
                {data.content.wordCount < 300 && 'Content is too short (less than 300 words)'}
                {data.content.wordCount >= 300 && data.content.wordCount < 600 && 'Content length is acceptable'}
                {data.content.wordCount >= 600 && 'Content length is good'}
              </div>
            </div>
            
            <div className="text-sm">
              <span className="font-medium">Paragraphs:</span> {data.content.paragraphCount}
            </div>
          </div>
        </div>
        
        {/* Images Analysis */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Images</h3>
          <StatusIndicator status={data.images.status} text={data.images.message} className="mb-3" />
          
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium">Total Images:</span> {data.images.count}
            </div>
            
            <div>
              <div className="text-sm font-medium mb-1">Images with Alt Text: {data.images.withAlt} of {data.images.count}</div>
              <ProgressBar 
                value={data.images.count > 0 ? (data.images.withAlt / data.images.count) * 100 : 100} 
                showPercentage={false}
                color={
                  data.images.count > 0 && data.images.withAlt / data.images.count < 0.8 ? '#f97316' : // Orange for < 80%
                  '#22c55e' // Green for good
                }
              />
            </div>
          </div>
        </div>
        
        {/* Other Checks */}
        <div className="border rounded-lg p-4 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Other Checks</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 border rounded">
              <div className="font-medium mb-1">Canonical Tag</div>
              <StatusIndicator 
                status={data.canonicalTag.status} 
                text={data.canonicalTag.exists ? 'Canonical tag is present' : 'Canonical tag is missing'} 
              />
              {data.canonicalTag.exists && (
                <div className="mt-2 text-xs font-mono break-all bg-gray-50 p-2 rounded">
                  {data.canonicalTag.value}
                </div>
              )}
            </div>
            
            <div className="p-3 border rounded">
              <div className="font-medium mb-1">Hreflang</div>
              <StatusIndicator 
                status={data.hreflang.status} 
                text={data.hreflang.exists ? 'Hreflang tags are present' : 'No hreflang tags found'} 
              />
              {data.hreflang.exists && data.hreflang.values.length > 0 && (
                <div className="mt-2 text-xs">
                  <div className="font-medium mb-1">Languages:</div>
                  <div className="flex flex-wrap gap-1">
                    {data.hreflang.values.map((lang, index) => (
                      <span key={index} className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-3 border rounded">
              <div className="font-medium mb-1">SSL Implementation</div>
              <StatusIndicator 
                status={data.ssl.status} 
                text={data.ssl.enabled ? 'SSL is enabled (HTTPS)' : 'SSL is not enabled (HTTP)'} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
