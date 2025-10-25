import React, { useRef, useEffect, useState } from 'react';
import { useGestures } from '@/hooks/use-gestures';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ 
  onRefresh, 
  children, 
  threshold = 80,
  disabled = false 
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePull = (distance: number) => {
    if (disabled || isRefreshing) return;
    
    setIsPulling(true);
    setPullDistance(Math.min(distance, threshold * 1.5));
  };

  const handleRelease = async () => {
    if (!isPulling || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
  };

  useGestures({
    onPull: handlePull,
    onRelease: handleRelease,
    ref: containerRef,
  });

  return (
    <div ref={containerRef} className="relative">
      {isPulling && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-gray-800 border-b border-gray-700 z-10"
          style={{ 
            height: `${Math.min(pullDistance, threshold)}px`,
            opacity: pullDistance / threshold 
          }}
        >
          <div className="flex items-center gap-2 text-gray-400">
            {isRefreshing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400"></div>
            ) : (
              <span>Pull to refresh</span>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default PullToRefresh;