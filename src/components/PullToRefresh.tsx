import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className = '',
}) => {
  const { isMobile } = useMobile();
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;
      
      if (distance > 0 && distance < 150) {
        setPullDistance(distance);
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      
      setIsPulling(false);
      
      if (pullDistance > 80 && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchmove', handleTouchMove);
      container.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isMobile, isPulling, pullDistance, isRefreshing, onRefresh]);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Pull indicator */}
      <div 
        className={`absolute top-0 left-0 right-0 z-50 flex items-center justify-center bg-gray-800 border-b border-gray-700 transition-transform duration-300 ${
          pullDistance > 0 ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ height: `${Math.min(pullDistance, 80)}px` }}
      >
        <div className="flex items-center space-x-2 text-gray-400">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm">
            {isRefreshing ? 'Refreshing...' : pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div 
        className={`transition-transform duration-300 ${
          isPulling ? 'translate-y-0' : ''
        }`}
        style={{ transform: `translateY(${Math.min(pullDistance, 0)}px)` }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;