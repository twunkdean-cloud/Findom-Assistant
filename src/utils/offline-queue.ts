interface QueueItem {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineQueue {
  private queue: QueueItem[] = [];
  private isProcessing = false;
  private maxRetries = 3;

  constructor() {
    this.loadQueue();
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem('offlineQueue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load offline queue:', error);
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
    } catch (error) {
      console.warn('Failed to save offline queue:', error);
    }
  }

  public add(item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>): void {
    const queueItem: QueueItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queueItem);
    this.saveQueue();
  }

  public async process(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];
      
      try {
        await this.processItem(item);
        this.queue.shift();
      } catch (error) {
        item.retryCount++;
        
        if (item.retryCount >= this.maxRetries) {
          console.warn(`Max retries exceeded for item ${item.id}:`, error);
          this.queue.shift();
        } else {
          // Exponential backoff
          const delay = Math.pow(2, item.retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.isProcessing = false;
    this.saveQueue();
  }

  private async processItem(item: QueueItem): Promise<void> {
    // This would be implemented based on the specific item type
    switch (item.type) {
      case 'api_call':
        // Process API call
        break;
      case 'data_sync':
        // Process data sync
        break;
      default:
        throw new Error(`Unknown item type: ${item.type}`);
    }
  }

  public clear(): void {
    this.queue = [];
    this.saveQueue();
  }

  public getQueue(): QueueItem[] {
    return [...this.queue];
  }
}

export const offlineQueue = new OfflineQueue();