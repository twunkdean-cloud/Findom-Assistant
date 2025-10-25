interface QueuedAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount?: number;
}

class OfflineQueue {
  private queue: QueuedAction[] = [];
  private isProcessing = false;
  private maxRetries = 3;

  constructor() {
    this.loadQueue();
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem('offlineQueue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  public add(action: Omit<QueuedAction, 'id' | 'timestamp'>) {
    const queuedAction: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.queue.push(queuedAction);
    this.saveQueue();
  }

  public async process(processor: (action: QueuedAction) => Promise<boolean>) {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const action = this.queue[0];
      
      try {
        const success = await processor(action);
        
        if (success) {
          this.queue.shift();
          this.saveQueue();
        } else {
          throw new Error('Processing failed');
        }
      } catch (error) {
        action.retryCount = (action.retryCount || 0) + 1;
        
        if (action.retryCount >= this.maxRetries) {
          this.queue.shift();
          this.saveQueue();
        } else {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * action.retryCount));
        }
      }
    }

    this.isProcessing = false;
  }

  public clear() {
    this.queue = [];
    this.saveQueue();
  }

  public getQueue(): QueuedAction[] {
    return [...this.queue];
  }

  public getLength(): number {
    return this.queue.length;
  }
}

export const offlineQueue = new OfflineQueue();