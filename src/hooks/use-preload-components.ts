import { useEffect } from 'react';

export const preloadComponent = (component: () => Promise<void>) => {
  useEffect(() => {
    // Preload critical components after initial render
    const timer = setTimeout(() => {
      // Preload AI components (most likely to be used)
      preloadComponent(() => import('@/components/AIChatbot'));
      preloadComponent(() => import('@/components/AIContentSuggestions'));
      preloadComponent(() => import('@/components/AIInsightsDashboard'));
      
      // Preload chart components
      preloadComponent(() => import('@/components/TributeChart'));
      
      // Preload analytics components
      preloadComponent(() => import('@/components/SentimentAnalysis'));
    }, 2000); // Delay to not block initial render

    return () => clearTimeout(timer);
  }, []);
};