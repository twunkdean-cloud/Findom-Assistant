import React, { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyComponentProps> = ({ 
  children, 
  fallback 
}) => {
  const defaultFallback = (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

export const PageLoadingFallback: React.FC<{ title?: string }> = ({ 
  title = "Loading..." 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <Card className="w-full max-w-md">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-100">{title}</h3>
            <p className="text-sm text-gray-400 mt-1">Please wait while we load your content...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const ComponentLoadingFallback: React.FC<{ message?: string }> = ({ 
  message = "Loading component..." 
}) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <LoadingSpinner size="md" />
      <p className="text-sm text-gray-400 mt-2">{message}</p>
    </div>
  </div>
);

// Preload utility for critical components
export const preloadComponent = (importFunc: () => Promise<any>) => {
  importFunc();
};

// Intersection Observer for lazy loading components
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, callback, options]);
};