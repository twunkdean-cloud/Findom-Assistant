import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyComponentProps {
  componentPath: string;
  fallback?: React.ReactNode;
}

const LazyComponent: React.FC<LazyComponentProps> = ({ 
  componentPath, 
  fallback = (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
    </div>
  )
}) => {
  const LazyLoadedComponent = lazy(() => import(componentPath));

  return (
    <Suspense fallback={fallback}>
      <LazyLoadedComponent />
    </Suspense>
  );
};

export default LazyComponent;