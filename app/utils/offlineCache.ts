/**
 * 离线缓存管理工具
 * 使用 Cache API 手动缓存关键资源，无需完整 PWA 配置
 */

import { useOfflineStatus } from "~/composables/useOfflineStatus";

/**
 * 离线缓存配置接口
 */
export interface OfflineCacheConfig {
  /** 缓存名称，默认 'offline-cache' */
  cacheName?: string;
  /** 最大缓存大小（字节），默认 50MB */
  maxSize?: number;
  /** 缓存过期时间（毫秒），默认 7 天 */
  maxAge?: number;
  /** 是否自动清理过期缓存，默认 true */
  autoCleanup?: boolean;
  /** 清理间隔（毫秒），默认 24 小时 */
  cleanupInterval?: number;
}

/**
 * 缓存条目元数据
 */
export interface CacheEntryMetadata {
  /** 缓存键 */
  key: string;
  /** 缓存创建时间 */
  createdAt: number;
  /** 缓存大小（字节） */
  size: number;
  /** 缓存类型 */
  type: string;
  /** 最后访问时间 */
  lastAccessed: number;
  /** 访问次数 */
  accessCount: number;
}

/**
 * 离线缓存类
 */
export class OfflineCache {
  private config: Required<OfflineCacheConfig>;
  private cache: Cache | null = null;
  private isReady: boolean = false;
  private cleanupTimer: number | null = null;
  private offlineStatus: ReturnType<typeof useOfflineStatus> | null = null;

  /**
   * 构造函数
   * @param config 离线缓存配置
   */
  constructor(config: OfflineCacheConfig = {}) {
    // 默认配置
    this.config = {
      cacheName: 'offline-cache',
      maxSize: 50 * 1024 * 1024, // 50MB
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
      autoCleanup: true,
      cleanupInterval: 24 * 60 * 60 * 1000, // 24 小时
      ...config
    };

    // 初始化离线状态监听
    this.offlineStatus = useOfflineStatus();
    
    // 初始化缓存
    this.initCache();

    // 如果自动清理，启动清理定时器
    if (this.config.autoCleanup) {
      this.startCleanupTimer();
    }
  }

  /**
   * 初始化缓存
   */
  private async initCache(): Promise<void> {
    try {
      // 检查浏览器是否支持 Cache API
      if ('caches' in window) {
        this.cache = await caches.open(this.config.cacheName);
        this.isReady = true;
        console.log(`离线缓存 "${this.config.cacheName}" 初始化成功`);
        
        // 执行初始清理
        await this.cleanup();
      } else {
        console.warn('浏览器不支持 Cache API，离线缓存功能不可用');
      }
    } catch (error) {
      console.error('初始化离线缓存失败:', error);
      this.isReady = false;
    }
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) return;
    
    this.cleanupTimer = window.setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * 停止清理定时器
   */
  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * 获取缓存大小
   * @returns 缓存大小（字节）
   */
  private async getCacheSize(): Promise<number> {
    if (!this.isReady || !this.cache) return 0;
    
    try {
      const requests = await this.cache.keys();
      let totalSize = 0;
      
      for (const request of requests) {
        const response = await this.cache!.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('获取缓存大小失败:', error);
      return 0;
    }
  }

  /**
   * 清理过期缓存
   */
  private async cleanup(): Promise<void> {
    if (!this.isReady || !this.cache) return;
    
    try {
      console.log('开始清理离线缓存...');
      const now = Date.now();
      const requests = await this.cache.keys();
      let deletedCount = 0;
      
      // 清理过期缓存
      for (const request of requests) {
        const response = await this.cache!.match(request);
        if (response) {
          const createdAt = parseInt(response.headers.get('X-Cache-Created') || '0');
          
          // 如果缓存过期，删除它
          if (now - createdAt > this.config.maxAge) {
            await this.cache!.delete(request);
            deletedCount++;
          }
        }
      }
      
      // 检查缓存大小，如果超过限制，使用 LRU 策略清理
      const currentSize = await this.getCacheSize();
      if (currentSize > this.config.maxSize) {
        console.log(`缓存大小超过限制 (${currentSize} > ${this.config.maxSize})，开始使用 LRU 策略清理...`);
        
        // 获取所有缓存项并按访问时间排序
        const cacheEntries: { request: Request; response: Response; lastAccessed: number }[] = [];
        
        for (const request of await this.cache!.keys()) {
          const response = await this.cache!.match(request);
          if (response) {
            const lastAccessed = parseInt(response.headers.get('X-Cache-Last-Accessed') || '0');
            cacheEntries.push({ request, response, lastAccessed });
          }
        }
        
        // 按最后访问时间排序（旧的在前）
        cacheEntries.sort((a, b) => a.lastAccessed - b.lastAccessed);
        
        // 清理直到缓存大小符合限制
        let cleanedSize = 0;
        for (const entry of cacheEntries) {
          const blob = await entry.response.blob();
          await this.cache!.delete(entry.request);
          cleanedSize += blob.size;
          deletedCount++;
          
          if (currentSize - cleanedSize <= this.config.maxSize) {
            break;
          }
        }
      }
      
      console.log(`离线缓存清理完成，共删除 ${deletedCount} 个缓存项`);
    } catch (error) {
      console.error('清理离线缓存失败:', error);
    }
  }

  /**
   * 检查缓存是否可用
   * @returns 是否可用
   */
  isAvailable(): boolean {
    return this.isReady && 'caches' in window;
  }

  /**
   * 缓存响应
   * @param key 缓存键
   * @param data 缓存数据
   * @param options 缓存选项
   */
  async set<T>(
    key: string,
    data: T,
    options: {
      type?: string;
      maxAge?: number;
    } = {}
  ): Promise<void> {
    if (!this.isAvailable() || !this.cache) {
      console.warn('离线缓存不可用，无法缓存数据');
      return;
    }
    
    try {
      const now = Date.now();
      const maxAge = options.maxAge || this.config.maxAge;
      
      // 创建响应头
      const headers = new Headers({
        'Content-Type': 'application/json',
        'X-Cache-Key': key,
        'X-Cache-Created': now.toString(),
        'X-Cache-Max-Age': maxAge.toString(),
        'X-Cache-Last-Accessed': now.toString(),
        'X-Cache-Type': options.type || 'application/json',
        'X-Cache-Access-Count': '1',
      });
      
      // 创建响应
      const response = new Response(JSON.stringify(data), {
        headers
      });
      
      // 缓存响应
      await this.cache.put(key, response);
      console.log(`数据已缓存到离线缓存，键: ${key}`);
    } catch (error) {
      console.error(`缓存数据失败，键: ${key}`, error);
    }
  }

  /**
   * 获取缓存数据
   * @param key 缓存键
   * @returns 缓存数据或 null
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable() || !this.cache) {
      return null;
    }
    
    try {
      // 检查缓存中是否存在
      const response = await this.cache.match(key);
      
      if (response) {
        const now = Date.now();
        const createdAt = parseInt(response.headers.get('X-Cache-Created') || '0');
        const maxAge = parseInt(response.headers.get('X-Cache-Max-Age') || this.config.maxAge.toString());
        
        // 检查是否过期
        if (now - createdAt > maxAge) {
          // 删除过期缓存
          await this.cache.delete(key);
          console.log(`缓存已过期，键: ${key}`);
          return null;
        }
        
        // 更新访问信息
        const accessCount = parseInt(response.headers.get('X-Cache-Access-Count') || '0') + 1;
        const data = await response.json() as T;
        
        // 重新缓存以更新访问信息
        await this.set(key, data, {
          type: response.headers.get('X-Cache-Type') || 'application/json',
          maxAge
        });
        
        return data;
      }
      
      return null;
    } catch (error) {
      console.error(`获取缓存数据失败，键: ${key}`, error);
      return null;
    }
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   * @returns 是否存在
   */
  async has(key: string): Promise<boolean> {
    if (!this.isAvailable() || !this.cache) {
      return false;
    }
    
    try {
      const response = await this.cache.match(key);
      
      if (response) {
        const now = Date.now();
        const createdAt = parseInt(response.headers.get('X-Cache-Created') || '0');
        const maxAge = parseInt(response.headers.get('X-Cache-Max-Age') || this.config.maxAge.toString());
        
        // 检查是否过期
        if (now - createdAt > maxAge) {
          // 删除过期缓存
          await this.cache.delete(key);
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`检查缓存是否存在失败，键: ${key}`, error);
      return false;
    }
  }

  /**
   * 删除缓存
   * @param key 缓存键
   * @returns 是否删除成功
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isAvailable() || !this.cache) {
      return false;
    }
    
    try {
      const result = await this.cache.delete(key);
      if (result) {
        console.log(`缓存已删除，键: ${key}`);
      }
      return result;
    } catch (error) {
      console.error(`删除缓存失败，键: ${key}`, error);
      return false;
    }
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    if (!this.isAvailable() || !this.cache) {
      return;
    }
    
    try {
      await caches.delete(this.config.cacheName);
      // 重新初始化缓存
      await this.initCache();
      console.log('离线缓存已清空');
    } catch (error) {
      console.error('清空离线缓存失败:', error);
    }
  }

  /**
   * 获取所有缓存键
   * @returns 缓存键数组
   */
  async keys(): Promise<string[]> {
    if (!this.isAvailable() || !this.cache) {
      return [];
    }
    
    try {
      const requests = await this.cache.keys();
      return requests.map(request => request.url);
    } catch (error) {
      console.error('获取缓存键失败:', error);
      return [];
    }
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计信息
   */
  async getStats(): Promise<{
    size: number;
    count: number;
    cacheName: string;
  }> {
    if (!this.isAvailable() || !this.cache) {
      return { size: 0, count: 0, cacheName: this.config.cacheName };
    }
    
    try {
      const size = await this.getCacheSize();
      const count = (await this.cache.keys()).length;
      
      return {
        size,
        count,
        cacheName: this.config.cacheName
      };
    } catch (error) {
      console.error('获取缓存统计信息失败:', error);
      return { size: 0, count: 0, cacheName: this.config.cacheName };
    }
  }

  /**
   * 包装请求函数，自动缓存响应
   * @param key 缓存键
   * @param fn 请求函数
   * @param options 缓存选项
   * @returns 请求结果
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options: {
      maxAge?: number;
      type?: string;
      forceRefresh?: boolean;
    } = {}
  ): Promise<T> {
    const { forceRefresh = false } = options;
    
    // 如果不是强制刷新，尝试从缓存获取
    if (!forceRefresh) {
      const cachedData = await this.get<T>(key);
      if (cachedData !== null) {
        return cachedData;
      }
    }
    
    // 从函数获取数据
    const data = await fn();
    
    // 缓存数据
    await this.set(key, data, {
      maxAge: options.maxAge,
      type: options.type
    });
    
    return data;
  }

  /**
   * 销毁离线缓存
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.clear();
    console.log('离线缓存已销毁');
  }
}

// 默认离线缓存实例
const defaultOfflineCache = new OfflineCache();

export default defaultOfflineCache;

/**
 * 创建离线缓存实例
 * @param config 离线缓存配置
 * @returns 离线缓存实例
 */
export const createOfflineCache = (config: OfflineCacheConfig = {}) => {
  return new OfflineCache(config);
};

/**
 * 检查浏览器是否支持离线缓存
 * @returns 是否支持
 */
export const isOfflineCacheSupported = (): boolean => {
  return 'caches' in window && 'Cache' in window;
};
