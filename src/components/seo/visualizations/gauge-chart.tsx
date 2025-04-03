'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
  value: number; // Value between 0-100
  size?: number;
  thickness?: number;
  label?: string;
  colors?: string[];
  showLabel?: boolean;
  grade?: string;
}

export default function GaugeChart({
  value,
  size = 200,
  thickness = 40,
  label,
  colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'],
  showLabel = true,
  grade,
}: GaugeChartProps) {
  // Ensure value is between 0-100
  const safeValue = Math.min(100, Math.max(0, value));
  
  // Calculate the remaining portion to complete the semi-circle
  const remaining = 100 - safeValue;
  
  // Data for the gauge chart
  const data = [
    { name: 'Value', value: safeValue },
    { name: 'Remaining', value: remaining },
  ];

  // Get color based on value
  const getColor = (value: number) => {
    if (value < 20) return colors[0]; // Red
    if (value < 40) return colors[1]; // Orange
    if (value < 60) return colors[2]; // Yellow
    if (value < 80) return colors[3]; // Light Green
    return colors[4]; // Green
  };

  // Get grade color
  const getGradeColor = (grade: string) => {
    if (!grade) return '#6b7280'; // Gray default
    
    const firstChar = grade.charAt(0).toUpperCase();
    
    switch (firstChar) {
      case 'A': return '#22c55e'; // Green
      case 'B': return '#84cc16'; // Light Green
      case 'C': return '#eab308'; // Yellow
      case 'D': return '#f97316'; // Orange
      case 'F': return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  return (
    <div className="flex flex-col items-center justify-center" style={{ width: size, height: size / 1.6 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={size / 2 - thickness}
            outerRadius={size / 2}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell key="value-cell" fill={getColor(safeValue)} />
            <Cell key="remaining-cell" fill="#e5e7eb" /> {/* Light gray for remaining */}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {showLabel && (
        <div 
          className="absolute flex flex-col items-center justify-center text-center"
          style={{ 
            width: size, 
            height: size / 1.6,
            marginTop: -size / 3.2 // Adjust to position the text in the center
          }}
        >
          <div className="text-3xl font-bold">{safeValue}</div>
          {grade && (
            <div 
              className="text-2xl font-bold mt-1 px-2 py-1 rounded-md" 
              style={{ color: getGradeColor(grade), backgroundColor: `${getGradeColor(grade)}20` }}
            >
              {grade}
            </div>
          )}
          {label && <div className="text-sm text-gray-500 mt-1">{label}</div>}
        </div>
      )}
    </div>
  );
}
