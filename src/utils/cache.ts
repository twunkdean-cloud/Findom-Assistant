const CACHE_PREFIX = 'ai_cache_';
const CACHE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

interface CacheItem<T> {
  timestamp: number;
  data: T;
}

export const cache = {
  set: <T>(key: string, data: T): void => {
    try {
      const item: CacheItem<T> = {
        timestamp: Date.now(),
        data,
      };
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const itemStr = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!itemStr) {
        return null;
      }

      const item: CacheItem<T> = JSON.parse(itemStr);
      const isExpired = Date.now() - item.timestamp > CACHE_EXPIRATION_MS;

      if (isExpired) {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  },

  clear: (): void => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },
};