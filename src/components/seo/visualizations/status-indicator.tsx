'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

type StatusType = 'success' | 'error' | 'warning' | 'info';

interface StatusIndicatorProps {
  status: StatusType;
  text: string;
  size?: number;
  className?: string;
}

export default function StatusIndicator({
  status,
  text,
  size = 16,
  className = '',
}: StatusIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle size={size} className="text-green-500" />;
      case 'error':
        return <XCircle size={size} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={size} className="text-yellow-500" />;
      case 'info':
        return <Info size={size} className="text-blue-500" />;
      default:
        return <Info size={size} className="text-gray-500" />;
    }
  };

  const getStatusTextColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getStatusIcon()}
      <span className={`text-sm font-medium ${getStatusTextColor()}`}>{text}</span>
    </div>
  );
}
