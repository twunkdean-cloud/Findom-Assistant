import React, { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyComponentProps> = ({ 
  children, 
  fallback,
  errorFallback
}) => {
  const defaultFallback = (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner size="lg" />
    </div>
  );

  const defaultErrorFallback = (
    <div className="flex items-center justify-center min-h-[200px]">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-600">Failed to Load</h3>
            <p className="text-sm text-gray-600 mt-1">Please refresh the page and try again.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <ErrorBoundary fallback={errorFallback || defaultErrorFallback}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
};

// Enhanced error boundary for lazy loading
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

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