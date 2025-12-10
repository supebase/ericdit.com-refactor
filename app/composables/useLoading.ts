/**
 * 全局加载状态管理组合式函数
 * 提供全局和局部加载状态管理
 */

import { ref, computed, type Ref } from 'vue';

/**
 * 加载状态选项
 */
export interface LoadingOptions {
  /** 初始加载状态 */
  initial?: boolean;
  /** 自动清除超时时间（毫秒），0 表示不自动清除 */
  autoClearTimeout?: number;
}

/**
 * 加载状态返回类型
 */
export interface LoadingReturn {
  /** 加载状态 */
  isLoading: Ref<boolean>;
  /** 加载计数 */
  count: Ref<number>;
  /** 开始加载 */
  start: () => void;
  /** 结束加载 */
  end: () => void;
  /** 重置加载状态 */
  reset: () => void;
  /** 切换加载状态 */
  toggle: () => void;
  /** 包装异步函数，自动管理加载状态 */
  wrap: <T>(fn: () => Promise<T>) => Promise<T>;
}

// 全局加载状态
const globalLoading = ref(false);
const globalCount = ref(0);

/**
 * 创建局部加载状态
 * @param options 加载状态选项
 * @returns 加载状态管理对象
 */
export function createLoading(options: LoadingOptions = {}): LoadingReturn {
  const { initial = false, autoClearTimeout = 0 } = options;
  const isLoading = ref(initial);
  const count = ref(initial ? 1 : 0);
  let autoClearTimer: number | null = null;

  // 清除自动清除计时器
  const clearAutoClearTimer = () => {
    if (autoClearTimer) {
      clearTimeout(autoClearTimer);
      autoClearTimer = null;
    }
  };

  // 开始加载
  const start = () => {
    clearAutoClearTimer();
    count.value++;
    isLoading.value = true;
  };

  // 结束加载
  const end = () => {
    if (count.value > 0) {
      count.value--;
      
      if (count.value === 0) {
        isLoading.value = false;
        
        // 设置自动清除计时器
        if (autoClearTimeout > 0) {
          autoClearTimer = window.setTimeout(() => {
            count.value = 0;
            autoClearTimer = null;
          }, autoClearTimeout);
        }
      }
    }
  };

  // 重置加载状态
  const reset = () => {
    clearAutoClearTimer();
    count.value = 0;
    isLoading.value = false;
  };

  // 切换加载状态
  const toggle = () => {
    if (isLoading.value) {
      reset();
    } else {
      start();
    }
  };

  // 包装异步函数，自动管理加载状态
  const wrap = async <T>(fn: () => Promise<T>): Promise<T> => {
    start();
    try {
      return await fn();
    } finally {
      end();
    }
  };

  return {
    isLoading,
    count,
    start,
    end,
    reset,
    toggle,
    wrap
  };
}

/**
 * 全局加载状态管理
 */
export const useLoading = () => {
  // 开始全局加载
  const start = () => {
    globalCount.value++;
    globalLoading.value = true;
  };

  // 结束全局加载
  const end = () => {
    if (globalCount.value > 0) {
      globalCount.value--;
      if (globalCount.value === 0) {
        globalLoading.value = false;
      }
    }
  };

  // 重置全局加载状态
  const reset = () => {
    globalCount.value = 0;
    globalLoading.value = false;
  };

  // 切换全局加载状态
  const toggle = () => {
    if (globalLoading.value) {
      reset();
    } else {
      start();
    }
  };

  // 包装异步函数，自动管理全局加载状态
  const wrap = async <T>(fn: () => Promise<T>): Promise<T> => {
    start();
    try {
      return await fn();
    } finally {
      end();
    }
  };

  return {
    /** 全局加载状态 */
    isLoading: computed(() => globalLoading.value),
    /** 全局加载计数 */
    count: computed(() => globalCount.value),
    start,
    end,
    reset,
    toggle,
    wrap,
    /** 创建局部加载状态 */
    create: createLoading
  };
};
