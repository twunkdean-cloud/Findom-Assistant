import React from 'react';
import { Loader2 } from 'lucide-react';

interface MobileLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const MobileLoadingSpinner: React.FC<MobileLoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin text-indigo-400 ${sizeClasses[size]}`} />
    </div>
  );
};

export default MobileLoadingSpinner;