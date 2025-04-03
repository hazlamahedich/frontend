'use client';

import React from 'react';
import { 
  RadarChart as RechartsRadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface RadarChartProps {
  data: {
    category: string;
    value: number;
    fullMark: number;
  }[];
  size?: number;
  colors?: {
    area: string;
    stroke: string;
  };
}

export default function RadarChart({
  data,
  size = 300,
  colors = {
    area: 'rgba(79, 70, 229, 0.2)',
    stroke: 'rgb(79, 70, 229)'
  }
}: RadarChartProps) {
  return (
    <div style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Score']}
            labelFormatter={(label) => `${label}`}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke={colors.stroke}
            fill={colors.area}
            fillOpacity={0.6}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
