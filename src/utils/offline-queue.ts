interface QueuedAction {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount?: number;
}

class OfflineQueue {
  private dbName = 'OfflineQueueDB';
  private version = 1;
  private storeName = 'queue';

  async addToQueue(action: Omit<QueuedAction, 'id' | 'timestamp'>): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    const queuedAction: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    await store.add(queuedAction);
    db.close();
  }

  async getQueue(): Promise<QueuedAction[]> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const actions = request.result as QueuedAction[];
        db.close();
        resolve(actions);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  }

  async removeFromQueue(id: string): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    await store.delete(id);
    db.close();
  }

  async clearQueue(): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    await store.clear();
    db.close();
  }

  async processQueue(): Promise<void> {
    const actions = await this.getQueue();
    
    for (const action of actions) {
      try {
        await this.processAction(action);
        await this.removeFromQueue(action.id);
      } catch (error) {
        console.error('Failed to process queued action:', error);
        
        // Increment retry count
        action.retryCount = (action.retryCount || 0) + 1;
        
        // Remove if too many retries
        if (action.retryCount >= 3) {
          await this.removeFromQueue(action.id);
        } else {
          // Update retry count
          const db = await this.openDB();
          const transaction = db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          await store.put(action);
          db.close();
        }
      }
    }
  }

  private async processAction(action: QueuedAction): Promise<void> {
    const response = await fetch(action.url, {
      method: action.method,
      headers: action.headers,
      body: action.body
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }
}

export const offlineQueue = new OfflineQueue();