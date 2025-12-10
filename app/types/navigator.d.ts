/**
 * Navigator 扩展类型声明
 */

declare interface Navigator {
  /**
   * 网络连接信息
   * https://developer.mozilla.org/en-US/docs/Web/API/Navigator/connection
   */
  connection?: {
    /** 网络连接类型 */
    type: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
    /** 网络连接速度估计（Mbps） */
    downlink: number;
    /** 网络连接最大下行速度估计（Mbps） */
    downlinkMax: number;
    /** 网络连接延迟估计（ms） */
    rtt: number;
    /** 网络连接是否处于节省数据模式 */
    saveData: boolean;
    /** 网络连接类型 */
    effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
    /** 网络连接变化事件监听器 */
    addEventListener(
      type: 'change',
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void;
    /** 移除网络连接变化事件监听器 */
    removeEventListener(
      type: 'change',
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ): void;
  };
}
