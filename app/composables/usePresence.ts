import type { UserStatusComposable, UserProfile, UserStatus } from "~/types";

/**
 * 用户状态管理组合式函数
 * 提供用户在线状态的追踪、更新和订阅功能
 * @returns {Object} 用户状态管理相关的方法和状态
 */
export const usePresence = (): UserStatusComposable => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();
  // 当前登录用户信息
  const user = useState<UserProfile | null>("auth:user");
  // 所有用户的在线状态映射表
  const usersStatus = useState<Record<string, boolean>>("users:status", () => ({}));

  // 状态更新锁，防止并发更新
  let isUpdating = false;

  // 使用 createCleanup 工具统一管理所有清理函数
  const { addCleanup, runCleanup } = createCleanup();

  // 用户状态相关常量
  const ACTIVITY_TIMEOUT_MS = 1000; // 用户活动防抖时间
  const OFFLINE_THRESHOLD_MINUTES = 7; // 离线判定阈值（分钟）
  const STATUS_CHECK_INTERVAL_MS = 30000; // 状态检查间隔（毫秒）

  /**
   * 更新用户在线状态
   * @param status - 用户状态（true: 在线，false: 离线）
   */
  const updateUserStatus = async () => {
    if (!user.value?.id || isUpdating) return;

    try {
      isUpdating = true;
      const now = new Date().toISOString();

      const existingStatus = await $directus.request(
        $content.readItems("users_status", {
          filter: {
            user_created: { _eq: user.value.id },
          },
          limit: 1,
        })
      );

      if (existingStatus.length > 0) {
        await $directus.request(
          $content.updateItem("users_status", existingStatus[0]?.id ?? "", {
            last_activity_at: now,
          })
        );
      } else {
        await $directus.request(
          $content.createItem("users_status", {
            last_activity_at: now,
          })
        );
      }
    } catch (error) {
      console.error("Failed to update user status:", error);
    } finally {
      isUpdating = false;
    }
  };

  /**
   * 检查指定用户的在线状态
   * @param userId - 要检查的用户ID
   * @returns {Promise<boolean>} 用户的在线状态
   */
  const checkUserStatus = async (userId: string): Promise<boolean> => {
    try {
      const response = await $directus.request<UserStatus[]>(
        $content.readItems("users_status", {
          filter: {
            user_created: { _eq: userId },
          },
          limit: 1,
        })
      );

      if (!response.length) return false;

      const lastActivity = new Date(response[0]?.last_activity_at ?? "");
      const now = new Date();
      const diffMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);

      const isOnline = diffMinutes <= OFFLINE_THRESHOLD_MINUTES;
      usersStatus.value[userId] = isOnline;
      return isOnline;
    } catch (error) {
      // console.error("Failed to check user status:", error);
      return false;
    }
  };

  /**
   * 订阅指定用户的状态更新
   * @param userId - 要订阅的用户ID
   * @returns {Promise<void>}
   */
  const subscribeUserStatus = async (userId: string): Promise<(() => void) | undefined> => {
    try {
      const { subscription } = await $realtimeClient.subscribe("users_status", {
        query: {
          filter: {
            user_created: { _eq: userId },
          },
          fields: ["last_activity_at"],
        },
      });

      const checkInterval = setInterval(async () => {
        await checkUserStatus(userId);
      }, STATUS_CHECK_INTERVAL_MS);
      addCleanup(() => clearInterval(checkInterval));

      // 创建订阅处理器
      const subscriptionHandler = async () => {
        for await (const item of subscription) {
          if (!item) continue;
          if (item.event === "update" || item.event === "create") {
            await checkUserStatus(userId);
          }
        }
      };

      // 启动订阅处理
      subscriptionHandler();

      addCleanup(() => subscription.return());

      // 返回单个清理函数（可选）
      return () => {
        clearInterval(checkInterval);
        subscription.return();
      };
    } catch (error) {
      console.error("Failed to subscribe to user status:", error);
    }
  };

  // 使用工具函数创建防抖的活动更新处理器
  const updateLastActivity = debounce(() => {
    if (user.value?.id) {
      updateUserStatus();
    }
  }, ACTIVITY_TIMEOUT_MS);

  /**
   * 清理所有定时器和订阅
   */
  const cleanup = (): void => {
    runCleanup();
  };

  return {
    usersStatus,
    updateUserStatus,
    checkUserStatus,
    updateLastActivity,
    subscribeUserStatus,
    cleanup,
  };
};
