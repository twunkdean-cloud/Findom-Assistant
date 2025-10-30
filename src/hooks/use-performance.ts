import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  reRenderCount: number;
}

export const usePerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[PERF] ${componentName} render #${renderCount.current}: ${renderTime}ms`);
    }

    startTime.current = Date.now();
  });

  // Memoize getMetrics to prevent infinite loops in components that use it in useEffect
  const getMetrics = useCallback((): PerformanceMetrics => ({
    renderTime: Date.now() - startTime.current,
    componentCount: 1,
    reRenderCount: renderCount.current
  }), []);

  return {
    getMetrics
  };
};

// Performance monitoring for component trees
export const usePerformanceObserver = () => {
  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            // Only log in development
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.log(`[PERF] ${entry.name}: ${entry.duration}ms`);
            }
          }
        }
      });

      observerRef.current.observe({ entryTypes: ['measure'] });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const mark = (name: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(name);
    }
  };

  const measure = (name: string, startMark: string, endMark?: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.measure(name, startMark, endMark);
    }
  };

  return {
    mark,
    measure
  };
};