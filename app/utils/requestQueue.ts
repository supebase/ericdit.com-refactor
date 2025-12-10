/**
 * 请求队列管理工具
 * 用于离线时将请求加入队列，恢复网络后执行
 */

import { useOfflineStatus } from "~/composables/useOfflineStatus";

/**
 * 请求队列项接口
 */
export interface QueueItem {
  /** 请求ID */
  id: string;
  /** 请求函数 */
  request: () => Promise<any>;
  /** 请求创建时间 */
  createdAt: Date;
  /** 请求重试次数 */
  retryCount: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试间隔（毫秒） */
  retryDelay: number;
  /** 请求成功回调 */
  onSuccess?: (result: any) => void;
  /** 请求失败回调 */
  onError?: (error: any) => void;
}

/**
 * 请求队列配置接口
 */
export interface RequestQueueConfig {
  /** 最大重试次数，默认 3 次 */
  defaultMaxRetries?: number;
  /** 默认重试间隔（毫秒），默认 1000ms */
  defaultRetryDelay?: number;
  /** 队列处理间隔（毫秒），默认 500ms */
  processInterval?: number;
  /** 是否自动处理队列，默认 true */
  autoProcess?: boolean;
  /** 是否持久化队列，默认 true */
  persist?: boolean;
  /** 持久化键名，默认 'request_queue' */
  persistKey?: string;
}

/**
 * 请求队列类
 */
export class RequestQueue {
  private queue: QueueItem[] = [];
  private isProcessing: boolean = false;
  private processTimer: number | null = null;
  private config: Required<RequestQueueConfig>;
  private offlineStatus: ReturnType<typeof useOfflineStatus> | null = null;

  /**
   * 构造函数
   * @param config 请求队列配置
   */
  constructor(config: RequestQueueConfig = {}) {
    // 默认配置
    this.config = {
      defaultMaxRetries: 3,
      defaultRetryDelay: 1000,
      processInterval: 500,
      autoProcess: true,
      persist: true,
      persistKey: 'request_queue',
      ...config
    };

    // 从持久化存储加载队列
    if (this.config.persist) {
      this.loadFromStorage();
    }

    // 初始化离线状态监听
    this.offlineStatus = useOfflineStatus();
    this.setupOfflineListeners();

    // 如果自动处理，启动处理循环
    if (this.config.autoProcess) {
      this.startProcessing();
    }
  }

  /**
   * 设置离线状态监听器
   */
  private setupOfflineListeners(): void {
    if (!this.offlineStatus) return;

    // 网络恢复时，处理队列
    this.offlineStatus.onOnline(() => {
      console.log('网络恢复，开始处理请求队列...');
      this.processQueue();
    });
  }

  /**
   * 生成唯一ID
   * @returns 唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 将队列保存到持久化存储
   */
  private saveToStorage(): void {
    if (!this.config.persist) return;

    try {
      const queueData = this.queue.map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString()
      }));
      localStorage.setItem(this.config.persistKey, JSON.stringify(queueData));
    } catch (error) {
      console.error('保存请求队列到本地存储失败:', error);
    }
  }

  /**
   * 从持久化存储加载队列
   */
  private loadFromStorage(): void {
    try {
      const queueData = localStorage.getItem(this.config.persistKey);
      if (queueData) {
        const parsedData = JSON.parse(queueData);
        this.queue = parsedData.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
        console.log(`从本地存储加载了 ${this.queue.length} 个请求项`);
      }
    } catch (error) {
      console.error('从本地存储加载请求队列失败:', error);
      // 清空损坏的队列
      this.queue = [];
      this.saveToStorage();
    }
  }

  /**
   * 启动队列处理
   */
  private startProcessing(): void {
    if (this.processTimer) return;

    this.processTimer = window.setInterval(() => {
      if (!this.isProcessing && this.queue.length > 0) {
        this.processQueue();
      }
    }, this.config.processInterval);
  }

  /**
   * 停止队列处理
   */
  private stopProcessing(): void {
    if (this.processTimer) {
      clearInterval(this.processTimer);
      this.processTimer = null;
    }
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    // 如果正在处理或离线，返回
    if (this.isProcessing || (this.offlineStatus && this.offlineStatus.isOffline.value)) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const item = this.queue[0];
        
        // 确保 item 不是 undefined
        if (!item) {
          this.queue.shift();
          continue;
        }
        
        try {
          console.log(`正在处理请求 ${item.id}，重试次数: ${item.retryCount}/${item.maxRetries}`);
          
          // 执行请求
          const result = await item.request();
          
          // 请求成功，调用回调
          if (item.onSuccess) {
            item.onSuccess(result);
          }
          
          // 从队列中移除
          this.queue.shift();
          this.saveToStorage();
          
          console.log(`请求 ${item.id} 处理成功`);
        } catch (error) {
          console.error(`请求 ${item.id} 处理失败:`, error);
          
          // 增加重试次数
          item.retryCount++;
          
          if (item.retryCount >= item.maxRetries) {
            // 超过最大重试次数，调用失败回调
            if (item.onError) {
              item.onError(error);
            }
            
            // 从队列中移除
            this.queue.shift();
            this.saveToStorage();
            
            console.log(`请求 ${item.id} 超过最大重试次数，已移除`);
          } else {
            // 等待重试间隔后继续处理
            await new Promise(resolve => setTimeout(resolve, item.retryDelay));
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 添加请求到队列
   * @param request 请求函数
   * @param options 请求选项
   * @returns 请求ID
   */
  add(
    request: () => Promise<any>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      onSuccess?: (result: any) => void;
      onError?: (error: any) => void;
    } = {}
  ): string {
    const id = this.generateId();
    
    const queueItem: QueueItem = {
      id,
      request,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: options.maxRetries ?? this.config.defaultMaxRetries,
      retryDelay: options.retryDelay ?? this.config.defaultRetryDelay,
      onSuccess: options.onSuccess,
      onError: options.onError
    };
    
    // 添加到队列末尾
    this.queue.push(queueItem);
    
    // 保存到持久化存储
    this.saveToStorage();
    
    console.log(`请求 ${id} 已添加到队列，当前队列长度: ${this.queue.length}`);
    
    // 如果自动处理且在线，立即处理队列
    if (this.config.autoProcess && !(this.offlineStatus && this.offlineStatus.isOffline.value)) {
      this.processQueue();
    }
    
    return id;
  }

  /**
   * 移除请求
   * @param id 请求ID
   * @returns 是否移除成功
   */
  remove(id: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(item => item.id !== id);
    
    if (this.queue.length < initialLength) {
      this.saveToStorage();
      console.log(`请求 ${id} 已从队列中移除`);
      return true;
    }
    
    console.log(`请求 ${id} 不在队列中`);
    return false;
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = [];
    this.saveToStorage();
    console.log('请求队列已清空');
  }

  /**
   * 获取队列长度
   * @returns 队列长度
   */
  length(): number {
    return this.queue.length;
  }

  /**
   * 获取队列中的所有请求
   * @returns 队列中的请求
   */
  getQueue(): QueueItem[] {
    return [...this.queue];
  }

  /**
   * 手动处理队列
   */
  async flush(): Promise<void> {
    console.log('手动处理请求队列');
    await this.processQueue();
  }

  /**
   * 销毁队列
   */
  destroy(): void {
    this.stopProcessing();
    this.queue = [];
    this.saveToStorage();
    console.log('请求队列已销毁');
  }
}

// 默认请求队列实例
const defaultRequestQueue = new RequestQueue();

export default defaultRequestQueue;

/**
 * 创建请求队列实例
 * @param config 请求队列配置
 * @returns 请求队列实例
 */
export const createRequestQueue = (config: RequestQueueConfig = {}) => {
  return new RequestQueue(config);
};

/**
   * 包装函数，自动管理离线请求队列
   * @param fn 请求函数
   * @param options 包装选项
   * @returns 包装后的函数
   */
export const withQueue = <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onSuccess?: (result: T) => void;
    onError?: (error: any) => void;
    queue?: RequestQueue;
  } = {}
): Promise<T> => {
  const { isOffline } = useOfflineStatus();
  const queue = options.queue || defaultRequestQueue;
  
  // 如果在线，直接执行
  if (!isOffline.value) {
    return fn();
  }
  
  // 如果离线，加入队列
  return new Promise((resolve, reject) => {
    queue.add(fn, {
      maxRetries: options.maxRetries,
      retryDelay: options.retryDelay,
      onSuccess: (result) => {
        if (options.onSuccess) {
          options.onSuccess(result as T);
        }
        resolve(result as T);
      },
      onError: (error) => {
        if (options.onError) {
          options.onError(error);
        }
        reject(error);
      }
    });
  });
};
