import React from 'react';
import { Loader2 } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

interface MobileLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const MobileLoadingSpinner: React.FC<MobileLoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  const { isMobile } = useMobile();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-blue-500 animate-spin`} />
      {text && (
        <span className={`${textSizeClasses[size]} text-gray-400 ${isMobile ? 'text-xs' : ''}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default MobileLoadingSpinner;