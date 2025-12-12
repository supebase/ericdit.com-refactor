import type { AppSettings } from "~/types";

/**
 * 应用设置管理组合式函数
 * 提供应用设置相关的查询和实时订阅功能：
 * - 获取应用设置
 * - 订阅设置更新
 */
export const useAppSettings = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();
  const { wrap: withLoading } = useLoading();

  /**
   * 获取应用设置
   * @param options - 查询选项，可指定需要返回的字段等
   * @returns Promise<AppSettings> 应用设置
   * @throws Error 当 API 请求失败时抛出错误
   */
  const getSettings = async (): Promise<AppSettings | null> => {
    const fetchSettings = async () => {
      try {
        // @ts-ignore
        const response = await $directus.request<AppSettings>($content.readSingleton("settings"));
        return response;
      } catch (error: any) {
        throw new Error(error.errors?.[0]?.message || "获取应用数据失败");
      }
    };

    // 使用缓存包装，应用设置缓存 30 分钟
    return await cache.wrap(
      "app:settings",
      () => withLoading(fetchSettings),
      30 * 60 * 1000 // 30 分钟
    );
  };

  /**
   * 处理设置更新的异步函数
   */
  const processSettingsUpdates = async (
    settingsSubscription: any,
    callback: (item: any) => void
  ) => {
    try {
      for await (const item of settingsSubscription) {
        // 清除缓存
        cache.delete("app:settings");
        callback(item);
      }
    } catch (error) {
      console.warn("Error in settings subscription:", error);
    }
  };

  /**
   * 订阅应用设置更新
   * @param callback - 数据变化时的回调函数
   * @returns 取消订阅的清理函数
   */
  const subscribeSettings = async (callback: (item: any) => void): Promise<() => void> => {
    let settingsSubscription: any;
    const { addCleanup, runCleanup } = createCleanup();

    try {
      // 订阅设置更新
      const settingsSub = await $realtimeClient.subscribe("settings");
      settingsSubscription = settingsSub.subscription;
      addCleanup(() => settingsSubscription?.return());

      // 处理设置更新
      processSettingsUpdates(settingsSubscription, callback)
        .catch(error => {
            // 捕获循环内部的错误，比如连接断开
            console.error("Settings subscription loop failed:", error);
            // 如果循环退出（非正常退出），执行清理
            runCleanup();
        });

      return runCleanup;
    } catch (error) {
      // 确保在发生错误时清理订阅
      runCleanup();
      throw error;
    }
  };

  return {
    getSettings,
    subscribeSettings,
  };
};
