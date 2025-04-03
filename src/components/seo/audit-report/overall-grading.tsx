'use client';

import React from 'react';
import GaugeChart from '../visualizations/gauge-chart';
import RadarChart from '../visualizations/radar-chart';

interface CategoryScore {
  category: string;
  score: number;
  grade: string;
}

interface OverallGradingProps {
  overallScore: number;
  overallGrade: string;
  categoryScores: CategoryScore[];
}

export default function OverallGrading({
  overallScore,
  overallGrade,
  categoryScores,
}: OverallGradingProps) {
  // Transform category scores for radar chart
  const radarData = categoryScores.map(item => ({
    category: item.category,
    value: item.score,
    fullMark: 100,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Overall Site Grading</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Score Gauge */}
        <div className="flex flex-col items-center">
          <GaugeChart 
            value={overallScore} 
            grade={overallGrade}
            label="Overall Score" 
          />
          <p className="mt-4 text-sm text-gray-500 text-center">
            Your website's overall SEO health score based on all analyzed factors.
          </p>
        </div>
        
        {/* Category Scores Radar Chart */}
        <div className="flex flex-col items-center">
          <RadarChart data={radarData} />
          <p className="mt-4 text-sm text-gray-500 text-center">
            Breakdown of scores across different SEO categories.
          </p>
        </div>
      </div>
      
      {/* Category Grades Table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Category Grades</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryScores.map((category, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                        category.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                        category.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                        category.grade.startsWith('D') ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.score}/100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
