import { useEffect } from 'react';

interface PreloadConfig {
  componentPath: string;
  priority: 'high' | 'medium' | 'low';
  trigger: 'idle' | 'hover' | 'visible';
}

export const usePreloadComponents = (configs: PreloadConfig[]) => {
  useEffect(() => {
    const preloadComponent = async (config: PreloadConfig) => {
      try {
        await import(config.componentPath);
      } catch (error) {
        console.error(`Failed to preload component: ${config.componentPath}`, error);
      }
    };

    const preloadHighPriority = () => {
      configs
        .filter(config => config.priority === 'high' && config.trigger === 'idle')
        .forEach(preloadComponent);
    };

    const preloadMediumPriority = () => {
      configs
        .filter(config => config.priority === 'medium' && config.trigger === 'idle')
        .forEach(preloadComponent);
    };

    // Preload high priority components immediately
    preloadHighPriority();

    // Preload medium priority components after a short delay
    const mediumTimer = setTimeout(preloadMediumPriority, 2000);

    // Preload low priority components when user is idle
    const idleCallback = () => {
      configs
        .filter(config => config.priority === 'low' && config.trigger === 'idle')
        .forEach(preloadComponent);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(idleCallback);
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(idleCallback, 5000);
    }

    return () => {
      clearTimeout(mediumTimer);
    };
  }, [configs]);
};