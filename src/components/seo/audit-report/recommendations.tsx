'use client';

import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface Recommendation {
  id: string;
  recommendation: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  impact: string;
  effort: string;
}

interface RecommendationsProps {
  recommendations: Recommendation[];
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  
  const filteredRecommendations = filter === 'All' 
    ? recommendations 
    : recommendations.filter(rec => rec.priority === filter);
  
  const priorityCounts = {
    High: recommendations.filter(rec => rec.priority === 'High').length,
    Medium: recommendations.filter(rec => rec.priority === 'Medium').length,
    Low: recommendations.filter(rec => rec.priority === 'Low').length,
  };
  
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'Medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'Low':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Low':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'On-Page SEO':
        return 'bg-purple-100 text-purple-800';
      case 'Links':
        return 'bg-blue-100 text-blue-800';
      case 'Performance':
        return 'bg-green-100 text-green-800';
      case 'Usability':
        return 'bg-orange-100 text-orange-800';
      case 'Technology':
        return 'bg-gray-100 text-gray-800';
      case 'Social':
        return 'bg-pink-100 text-pink-800';
      case 'Local SEO':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h2>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('All')}
          className={`px-3 py-1 text-sm font-medium rounded-full ${
            filter === 'All' 
              ? 'bg-primary-100 text-primary-700 border border-primary-200' 
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          All ({recommendations.length})
        </button>
        <button
          onClick={() => setFilter('High')}
          className={`px-3 py-1 text-sm font-medium rounded-full ${
            filter === 'High' 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          High Priority ({priorityCounts.High})
        </button>
        <button
          onClick={() => setFilter('Medium')}
          className={`px-3 py-1 text-sm font-medium rounded-full ${
            filter === 'Medium' 
              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          Medium Priority ({priorityCounts.Medium})
        </button>
        <button
          onClick={() => setFilter('Low')}
          className={`px-3 py-1 text-sm font-medium rounded-full ${
            filter === 'Low' 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          Low Priority ({priorityCounts.Low})
        </button>
      </div>
      
      <div className="space-y-4">
        {filteredRecommendations.map((rec) => (
          <div 
            key={rec.id} 
            className={`p-4 border rounded-lg ${getPriorityColor(rec.priority)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getPriorityIcon(rec.priority)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(rec.category)}`}>
                    {rec.category}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(rec.priority)}`}>
                    {rec.priority} Priority
                  </span>
                </div>
                <p className="text-sm font-medium">{rec.recommendation}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-xs">
                  <div>
                    <span className="font-semibold">Impact:</span> {rec.impact}
                  </div>
                  <div>
                    <span className="font-semibold">Effort:</span> {rec.effort}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredRecommendations.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No recommendations found for the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
