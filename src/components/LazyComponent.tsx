import React, { useRef, useState } from 'react';
import { LazyWrapper, ComponentLoadingFallback, useIntersectionObserver } from '@/utils/lazy-loading';

interface LazyComponentProps {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  componentProps?: Record<string, any>;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  component: Component,
  componentProps = {},
  fallback,
  rootMargin = '50px',
  threshold = 0.1
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useIntersectionObserver(
    elementRef,
    () => setShouldLoad(true),
    { rootMargin, threshold }
  );

  return (
    <div ref={elementRef}>
      {shouldLoad ? (
        <LazyWrapper fallback={fallback}>
          <Component {...componentProps} />
        </LazyWrapper>
      ) : (
        fallback || <ComponentLoadingFallback />
      )}
    </div>
  );
};

export default LazyComponent;