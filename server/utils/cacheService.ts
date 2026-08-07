
interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

class CacheService {
  private store: Map<string, CacheItem<any>> = new Map();
  private redisClient: any = null;

  constructor() {
    // In-memory cleaner running every 60 seconds
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.store.entries()) {
        if (item.expiresAt < now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  public async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  public async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  public async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  public async invalidatePattern(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  public async clear(): Promise<void> {
    this.store.clear();
  }
}

export const cacheService = new CacheService();
