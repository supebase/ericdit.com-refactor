/**
 * 离线状态管理组合式函数
 * 提供网络状态检测和管理
 */

import { ref, onMounted, onUnmounted, type Ref, type WatchStopHandle } from 'vue';

/**
 * 网络状态返回类型
 */
export interface OfflineStatusReturn {
  /** 是否离线 */
  isOffline: Ref<boolean>;
  /** 网络类型 */
  networkType: Ref<string>;
  /** 网络连接速度估计 */
  connectionSpeed: Ref<'slow' | 'medium' | 'fast'>;
  /** 上次网络状态变化时间 */
  lastChanged: Ref<Date | null>;
  /** 注册网络恢复回调 */
  onOnline: (callback: () => void) => void;
  /** 注册网络离线回调 */
  onOffline: (callback: () => void) => void;
  /** 检测当前网络状态 */
  checkStatus: () => boolean;
}

/**
 * 网络状态管理组合式函数
 * @returns 网络状态管理对象
 */
export const useOfflineStatus = (): OfflineStatusReturn => {
  // 是否离线
  const isOffline = ref(!navigator.onLine);
  // 网络类型
  const networkType = ref<string>(navigator.connection?.effectiveType || 'unknown');
  // 网络连接速度估计
  const connectionSpeed = ref<'slow' | 'medium' | 'fast'>('medium');
  // 上次网络状态变化时间
  const lastChanged = ref<Date | null>(new Date());
  // 回调函数列表
  const onlineCallbacks: (() => void)[] = [];
  const offlineCallbacks: (() => void)[] = [];
  // 连接状态监听
  let connectionListener: EventListenerOrEventListenerObject | null = null;
  // 观察器停止函数
  let watchStop: WatchStopHandle | null = null;

  /**
   * 计算网络连接速度
   * @param downlink 下载速度（Mbps）
   * @returns 连接速度等级
   */
  const calculateConnectionSpeed = (downlink?: number): 'slow' | 'medium' | 'fast' => {
    if (!downlink) return 'medium';
    if (downlink < 1) return 'slow';
    if (downlink < 10) return 'medium';
    return 'fast';
  };

  /**
   * 更新网络状态
   */
  const updateNetworkStatus = () => {
    const online = navigator.onLine;
    isOffline.value = !online;
    lastChanged.value = new Date();
    
    // 更新连接类型和速度
    if (navigator.connection) {
      networkType.value = navigator.connection.effectiveType;
      connectionSpeed.value = calculateConnectionSpeed(navigator.connection.downlink);
    }
    
    // 调用相应的回调函数
    if (online) {
      onlineCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Online callback error:', error);
        }
      });
    } else {
      offlineCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Offline callback error:', error);
        }
      });
    }
  };

  /**
   * 注册网络恢复回调
   * @param callback 网络恢复时的回调函数
   */
  const onOnline = (callback: () => void): void => {
    onlineCallbacks.push(callback);
  };

  /**
   * 注册网络离线回调
   * @param callback 网络离线时的回调函数
   */
  const onOffline = (callback: () => void): void => {
    offlineCallbacks.push(callback);
  };

  /**
   * 检测当前网络状态
   * @returns 当前网络状态（在线返回 true，离线返回 false）
   */
  const checkStatus = (): boolean => {
    updateNetworkStatus();
    return !isOffline.value;
  };

  /**
   * 清理资源
   */
  const cleanup = () => {
    // 移除事件监听器
    window.removeEventListener('online', updateNetworkStatus);
    window.removeEventListener('offline', updateNetworkStatus);
    
    // 移除网络连接状态监听器
    if (navigator.connection && connectionListener) {
      navigator.connection.removeEventListener('change', connectionListener);
      connectionListener = null;
    }
    
    // 停止观察器
    if (watchStop) {
      watchStop();
      watchStop = null;
    }
  };

  // 组件挂载时
  onMounted(() => {
    // 初始更新网络状态
    updateNetworkStatus();
    
    // 添加网络状态变化监听器
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // 添加网络连接状态变化监听器
    if (navigator.connection) {
      connectionListener = () => updateNetworkStatus();
      navigator.connection.addEventListener('change', connectionListener);
    }
  });

  // 组件卸载时
  onUnmounted(() => {
    cleanup();
  });

  return {
    isOffline,
    networkType,
    connectionSpeed,
    lastChanged,
    onOnline,
    onOffline,
    checkStatus
  };
};
