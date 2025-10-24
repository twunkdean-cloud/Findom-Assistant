import { useEffect } from 'react';
import { preloadComponent } from '@/utils/lazy-loading';

export const usePreloadComponents = () => {
  useEffect(() => {
    // Preload critical components after initial render
    const timer = setTimeout(() => {
      // Preload dashboard components
      preloadComponent(() => import('@/components/TributeChart'));
      preloadComponent(() => import('@/components/AIInsightsDashboard'));
      
      // Preload frequently used pages
      preloadComponent(() => import('@/pages/SubTrackerPage'));
      preloadComponent(() => import('@/pages/TributeTrackerPage'));
      
      // Preload AI components
      preloadComponent(() => import('@/components/AIContentSuggestions'));
      preloadComponent(() => import('@/components/AIChatbot'));
    }, 2000); // Start preloading after 2 seconds

    return () => clearTimeout(timer);
  }, []);
};

export const usePreloadOnInteraction = (componentImport: () => Promise<any>) => {
  useEffect(() => {
    const handleInteraction = () => {
      preloadComponent(componentImport);
      // Remove listeners after preload
      document.removeEventListener('mouseover', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    // Preload on first user interaction
    document.addEventListener('mouseover', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('mouseover', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [componentImport]);
};