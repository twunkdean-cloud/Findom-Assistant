import { useState, useEffect } from 'react';
import { useAppToast } from './use-app-toast';
import { offlineQueue } from '@/utils/offline-queue';

export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [queue, setQueue] = useState<any[]>([]);
  const toast = useAppToast();

  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      toast.showSuccess('Back online! Syncing queued actions...');
      
      try {
        await offlineQueue.processQueue();
        await updateQueueDisplay();
        toast.showSuccess('All actions synced successfully!');
      } catch (error) {
        console.error('Failed to sync queued actions:', error);
        toast.showError('Some actions failed to sync');
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.showError('You\'re offline. Changes will sync when you\'re back online.');
    };

    const addToQueue = async (action: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
  }) => {
    try {
      await offlineQueue.addToQueue(action);
      await updateQueueDisplay();
      toast.showInfo('Action queued for when you\'re back online');
    } catch (error) {
      console.error('Failed to add action to queue:', error);
      toast.showError('Failed to queue action');
    }
  };

    const updateQueueDisplay = async () => {
      try {
        const queuedActions = await offlineQueue.getQueue();
        setQueue(queuedActions);
      } catch (error) {
        console.error('Failed to update queue display:', error);
      }
    };

    const clearQueue = async () => {
      try {
        await offlineQueue.clearQueue();
        setQueue([]);
        toast.showSuccess('Queue cleared');
      } catch (error) {
        console.error('Failed to clear queue:', error);
        toast.showError('Failed to clear queue');
      }
    };

    return {
      isOffline,
      queue,
      addToQueue,
      clearQueue,
      queueLength: queue.length,
    };
  }, [toast]);
};