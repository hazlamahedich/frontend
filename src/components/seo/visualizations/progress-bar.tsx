'use client';

import React from 'react';

interface ProgressBarProps {
  value: number; // Value between 0-100
  label?: string;
  showPercentage?: boolean;
  height?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

export default function ProgressBar({
  value,
  label,
  showPercentage = true,
  height = 8,
  color = '#4f46e5', // Primary color
  backgroundColor = '#e5e7eb', // Light gray
  className = '',
}: ProgressBarProps) {
  // Ensure value is between 0-100
  const safeValue = Math.min(100, Math.max(0, value));
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-500">{safeValue}%</span>
          )}
        </div>
      )}
      <div 
        className="w-full rounded-full overflow-hidden"
        style={{ height: `${height}px`, backgroundColor }}
      >
        <div 
          className="h-full rounded-full transition-all duration-300 ease-in-out"
          style={{ 
            width: `${safeValue}%`, 
            backgroundColor: color 
          }}
        />
      </div>
    </div>
  );
}
