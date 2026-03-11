export class TLLCache {
    private cache = new Map<string, { data: any; expiry: number }>();

    constructor(private maxSize = 1000, sweepIntervalMs = 60000) {
        const sweepTimer = setInterval(() => this.sweep(), sweepIntervalMs);
        // Uncouple from the event loop
        sweepTimer.unref(); 
    }

    set(key: string, value: any, ttlSeconds: number) {
        // If we hit our max size, we must delete the oldest item
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) this.cache.delete(oldestKey);
        }

        const expiry = Date.now() + (ttlSeconds * 1000);
        this.cache.set(key, { data: structuredClone(value), expiry });
    }

    get<T = any>(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        // Return a fresh deep copy so cache cannot be modified
        return structuredClone(item.data) as T;
    }

    private sweep() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }
}

export class LRUCache {
    private cache = new Map<string, any>();

    constructor(private readonly maxSize: number = 100) {}

    public get<T = any>(key: string): T | null {
        const item = this.cache.get(key);
        if (item === undefined) return null;

        // Refresh the key by deleting and re-inserting (moves to end of Map)
        this.cache.delete(key);
        this.cache.set(key, item);

        return structuredClone(item) as T;
    }

    public getAll<T = any>(): Map<string, T> {
        const result = new Map<string, T>();
        for (const [key, item] of this.cache.entries()) {
            result.set(key, structuredClone(item.data) as T);
        }
        return result;
    }

    public set(key: string, value: any): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey !== undefined) {
                this.cache.delete(oldestKey);
            }
        }

        this.cache.set(key, structuredClone(value));
    }
}
