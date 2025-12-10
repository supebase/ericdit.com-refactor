/**
 * 通用缓存工具
 * 支持多级缓存：内存缓存 + localStorage 持久化
 */

/**
 * 缓存存储类型
 */
export type CacheStorageType = 'memory' | 'localStorage' | 'sessionStorage';

/**
 * 缓存项接口
 */
export interface CacheItem<T = any> {
  /** 缓存数据 */
  data: T;
  /** 过期时间戳（毫秒） */
  expires: number;
  /** 创建时间戳（毫秒） */
  created: number;
  /** 最后访问时间戳（毫秒） */
  lastAccessed: number;
  /** 访问次数 */
  accessCount: number;
}

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  /** 默认缓存时间（毫秒），默认 5 分钟 */
  defaultTtl?: number;
  /** 缓存存储类型，默认 memory */
  storageType?: CacheStorageType;
  /** 最大缓存项数量，默认 100 */
  maxItems?: number;
  /** 是否启用持久化，默认 false */
  persist?: boolean;
  /** 持久化前缀，用于区分不同缓存实例 */
  persistPrefix?: string;
}

/**
 * 缓存键值接口
 */
export interface CacheKeyOptions {
  /** 缓存键前缀 */
  prefix?: string;
  /** 缓存键后缀 */
  suffix?: string;
  /** 是否使用 JSON.stringify 序列化参数 */
  stringify?: boolean;
}

/**
 * 缓存类
 */
export class Cache {
  private config: Required<CacheConfig>;
  private memoryCache: Map<string, CacheItem>;
  private storage: Storage | null;

  /**
   * 构造函数
   * @param config 缓存配置
   */
  constructor(config: CacheConfig = {}) {
    // 默认配置
    this.config = {
      defaultTtl: 5 * 60 * 1000, // 5 分钟
      storageType: 'memory',
      maxItems: 100,
      persist: false,
      persistPrefix: 'cache:',
      ...config
    };

    // 初始化内存缓存
    this.memoryCache = new Map();

    // 获取存储实例
    this.storage = this.config.storageType === 'memory' 
      ? null 
      : window[this.config.storageType];

    // 从持久化存储加载数据
    if (this.config.persist && this.storage) {
      this.loadFromStorage();
    }
  }

  /**
   * 从持久化存储加载数据
   */
  private loadFromStorage(): void {
    if (!this.storage) return;

    try {
      // 遍历存储中的所有键
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(this.config.persistPrefix)) {
          const itemStr = this.storage.getItem(key);
          if (itemStr) {
            const item = JSON.parse(itemStr) as CacheItem;
            // 检查是否过期
            if (!this.isExpired(item)) {
              this.memoryCache.set(key.slice(this.config.persistPrefix.length), item);
            } else {
              // 删除过期项
              this.storage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error('从持久化存储加载缓存失败:', error);
    }
  }

  /**
   * 保存数据到持久化存储
   * @param key 缓存键
   * @param item 缓存项
   */
  private saveToStorage(key: string, item: CacheItem): void {
    if (!this.config.persist || !this.storage) return;

    try {
      const fullKey = this.config.persistPrefix + key;
      this.storage.setItem(fullKey, JSON.stringify(item));
    } catch (error) {
      console.error('保存缓存到持久化存储失败:', error);
    }
  }

  /**
   * 从持久化存储删除数据
   * @param key 缓存键
   */
  private removeFromStorage(key: string): void {
    if (!this.config.persist || !this.storage) return;

    try {
      const fullKey = this.config.persistPrefix + key;
      this.storage.removeItem(fullKey);
    } catch (error) {
      console.error('从持久化存储删除缓存失败:', error);
    }
  }

  /**
   * 清空持久化存储
   */
  private clearStorage(): void {
    if (!this.config.persist || !this.storage) return;

    try {
      // 遍历存储中的所有键
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(this.config.persistPrefix)) {
          this.storage.removeItem(key);
          // 重置索引，因为删除后长度会变化
          i--;
        }
      }
    } catch (error) {
      console.error('清空持久化存储失败:', error);
    }
  }

  /**
   * 检查缓存项是否过期
   * @param item 缓存项
   * @returns 是否过期
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() > item.expires;
  }

  /**
   * 清理过期缓存项
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let removed = 0;

    // 清理内存缓存
    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        this.memoryCache.delete(key);
        this.removeFromStorage(key);
        removed++;
      }
    }

    // 如果内存缓存项数量超过最大值，使用 LRU 策略清理
    if (this.memoryCache.size > this.config.maxItems) {
      const items = Array.from(this.memoryCache.entries()).sort(
        (a, b) => a[1].lastAccessed - b[1].lastAccessed
      );

      const toRemove = items.slice(0, this.memoryCache.size - this.config.maxItems);
      
      for (const [key] of toRemove) {
        this.memoryCache.delete(key);
        this.removeFromStorage(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.debug(`清理了 ${removed} 个过期缓存项`);
    }
  }

  /**
   * 生成缓存键
   * @param key 基础键
   * @param params 参数对象
   * @param options 键生成选项
   * @returns 生成的缓存键
   */
  static generateKey(
    key: string,
    params: any = {},
    options: CacheKeyOptions = {}
  ): string {
    const { prefix = '', suffix = '', stringify = true } = options;
    
    let paramsStr = '';
    if (Object.keys(params).length > 0) {
      paramsStr = stringify 
        ? JSON.stringify(params) 
        : Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
    }
    
    return `${prefix}${key}${paramsStr ? `:${paramsStr}` : ''}${suffix}`;
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 缓存时间（毫秒），0 表示永不过期
   * @returns 是否设置成功
   */
  set<T>(key: string, data: T, ttl?: number): boolean {
    try {
      const now = Date.now();
      const actualTtl = ttl ?? this.config.defaultTtl;
      
      const item: CacheItem<T> = {
        data,
        expires: actualTtl === 0 ? Infinity : now + actualTtl,
        created: now,
        lastAccessed: now,
        accessCount: 1
      };

      // 设置内存缓存
      this.memoryCache.set(key, item);
      
      // 保存到持久化存储
      this.saveToStorage(key, item);
      
      // 清理过期缓存
      this.cleanupExpired();
      
      return true;
    } catch (error) {
      console.error('设置缓存失败:', error);
      return false;
    }
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @param defaultValue 默认值
   * @returns 缓存数据或默认值
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = this.memoryCache.get(key);
      
      if (!item) {
        return defaultValue;
      }
      
      // 检查是否过期
      if (this.isExpired(item)) {
        this.memoryCache.delete(key);
        this.removeFromStorage(key);
        return defaultValue;
      }
      
      // 更新最后访问时间和访问次数
      item.lastAccessed = Date.now();
      item.accessCount++;
      this.memoryCache.set(key, item);
      this.saveToStorage(key, item);
      
      return item.data as T;
    } catch (error) {
      console.error('获取缓存失败:', error);
      return defaultValue;
    }
  }

  /**
   * 检查缓存是否存在且未过期
   * @param key 缓存键
   * @returns 是否存在且未过期
   */
  has(key: string): boolean {
    const item = this.memoryCache.get(key);
    return !!item && !this.isExpired(item);
  }

  /**
   * 删除缓存
   * @param key 缓存键
   * @returns 是否删除成功
   */
  delete(key: string): boolean {
    try {
      const existed = this.memoryCache.delete(key);
      if (existed) {
        this.removeFromStorage(key);
      }
      return existed;
    } catch (error) {
      console.error('删除缓存失败:', error);
      return false;
    }
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    try {
      this.memoryCache.clear();
      this.clearStorage();
    } catch (error) {
      console.error('清空缓存失败:', error);
    }
  }

  /**
   * 获取缓存项数量
   * @returns 缓存项数量
   */
  size(): number {
    return this.memoryCache.size;
  }

  /**
   * 获取所有缓存键
   * @returns 缓存键数组
   */
  keys(): string[] {
    return Array.from(this.memoryCache.keys());
  }

  /**
   * 获取所有缓存项
   * @returns 缓存项数组
   */
  items(): Array<{ key: string; item: CacheItem }> {
    return Array.from(this.memoryCache.entries()).map(([key, item]) => ({
      key,
      item
    }));
  }

  /**
   * 包装函数，自动管理缓存
   * @param key 缓存键
   * @param fn 获取数据的异步函数
   * @param ttl 缓存时间（毫秒）
   * @param params 生成缓存键的参数
   * @returns 数据
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
    params: any = {}
  ): Promise<T> {
    // 生成缓存键
    const cacheKey = Cache.generateKey(key, params);
    
    // 尝试从缓存获取
    const cachedData = this.get<T>(cacheKey);
    if (cachedData !== undefined) {
      return cachedData;
    }
    
    // 从函数获取数据
    const data = await fn();
    
    // 设置缓存
    this.set(cacheKey, data, ttl);
    
    return data;
  }
}

// 默认缓存实例
const defaultCache = new Cache();

/**
 * 默认缓存导出
 */
export default defaultCache;

/**
 * 创建缓存实例
 * @param config 缓存配置
 * @returns 缓存实例
 */
export const createCache = (config: CacheConfig = {}) => {
  return new Cache(config);
};
