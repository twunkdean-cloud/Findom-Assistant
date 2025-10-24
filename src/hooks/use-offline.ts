import { useState, useEffect } from 'react';
import { useAppToast } from './use-app-toast';

export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [queue, setQueue] = useState<any[]>([]);
  const toast = useAppToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.showSuccess('Back online!');
      processQueue();
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.showError('You\'re offline. Changes will sync when you\'re back online.');
    };

    const addToQueue = (action: any) => {
      setQueue(prev => [...prev, { ...action, timestamp: Date.now() }]);
    };

    const processQueue = async () => {
      if (queue.length === 0) return;
      
      for (const action of queue) {
        try {
          // Process queued actions based on type
          await processAction(action);
        } catch (error) {
          console.error('Failed to process queued action:', error);
        }
      }
      
      setQueue([]);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queue, toast]);

  const addToQueue = (action: any) => {
    setQueue(prev => [...prev, { ...action, timestamp: Date.now() }]);
  };

  return {
    isOffline,
    queue,
    addToQueue,
  };
};

const processAction = async (action: any) => {
  // Implementation depends on your action structure
  console.log('Processing queued action:', action);
};