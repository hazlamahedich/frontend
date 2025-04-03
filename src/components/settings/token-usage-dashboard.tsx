'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface TokenUsage {
  id: string;
  user_id: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  timestamp: string;
}

interface ModelUsage {
  model: string;
  total_tokens: number;
}

interface DayUsage {
  date: string;
  total_tokens: number;
}

interface TokenUsageDashboardProps {
  tokenUsage: TokenUsage[];
  usageByModel: ModelUsage[];
  usageByDay: DayUsage[];
  tokenLimit: number;
  userTier: string;
}

export default function TokenUsageDashboard({ 
  tokenUsage, 
  usageByModel, 
  usageByDay, 
  tokenLimit,
  userTier
}: TokenUsageDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7days' | '30days' | 'all'>('30days');
  
  // Calculate total usage
  const totalUsage = tokenUsage.reduce((sum, record) => sum + record.total_tokens, 0);
  const usagePercentage = Math.min(100, Math.round((totalUsage / tokenLimit) * 100));
  
  // Format usage by day data for chart
  const formatDayUsageData = () => {
    // Filter based on selected timeframe
    const now = new Date();
    let filteredData = [...usageByDay];
    
    if (selectedTimeframe === '7days') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      filteredData = usageByDay.filter(item => new Date(item.date) >= sevenDaysAgo);
    } else if (selectedTimeframe === '30days') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      filteredData = usageByDay.filter(item => new Date(item.date) >= thirtyDaysAgo);
    }
    
    // Sort by date
    return filteredData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tokens: item.total_tokens,
      }));
  };
  
  // Format usage by model data for chart
  const formatModelUsageData = () => {
    return usageByModel.map(item => ({
      name: item.model,
      value: item.total_tokens,
    }));
  };
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Monthly Token Usage</h3>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-primary-600">{formatNumber(totalUsage)}</div>
            <div className="ml-1 text-sm text-gray-500">/ {formatNumber(tokenLimit)}</div>
          </div>
        </div>
        
        <div className="w-full h-4 mt-2 bg-gray-200 rounded-full">
          <div
            className={`h-4 rounded-full ${
              usagePercentage > 90 ? 'bg-red-600' : usagePercentage > 75 ? 'bg-yellow-500' : 'bg-primary-600'
            }`}
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          {usagePercentage > 90 ? (
            <p className="text-red-600">You have used {usagePercentage}% of your monthly token limit. Consider upgrading your plan.</p>
          ) : usagePercentage > 75 ? (
            <p className="text-yellow-600">You have used {usagePercentage}% of your monthly token limit.</p>
          ) : (
            <p>You have used {usagePercentage}% of your monthly token limit.</p>
          )}
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Usage Over Time</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedTimeframe('7days')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedTimeframe === '7days'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('30days')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedTimeframe === '30days'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('all')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedTimeframe === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              All
            </button>
          </div>
        </div>
        
        <div className="h-80 bg-white rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formatDayUsageData()}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 50,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip formatter={(value) => [`${formatNumber(value as number)} tokens`, 'Usage']} />
              <Bar dataKey="tokens" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Usage by Model</h3>
        <div className="h-80 bg-white rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formatModelUsageData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {formatModelUsageData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Recent Usage</h3>
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {tokenUsage.slice(0, 10).map((usage) => (
              <li key={usage.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-900">{usage.model}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(usage.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{formatNumber(usage.prompt_tokens)}</span> prompt
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{formatNumber(usage.completion_tokens)}</span> completion
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatNumber(usage.total_tokens)} total
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {tokenUsage.length === 0 && (
              <li className="px-4 py-4 text-sm text-gray-500 sm:px-6">
                No token usage data available.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
