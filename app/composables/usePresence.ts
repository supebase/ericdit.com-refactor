import type { User } from "~/types";

// 添加返回类型接口
interface UserStatusComposable {
  usersStatus: Ref<Record<string, boolean>>;
  updateUserStatus: (status: boolean) => Promise<void>;
  checkUserStatus: (userId: string) => Promise<boolean>;
  updateLastActivity: () => void;
  subscribeUserStatus: (userId: string) => Promise<(() => void) | undefined>;
  cleanup: () => void;
}

/**
 * 用户状态管理组合式函数
 * 提供用户在线状态的追踪、更新和订阅功能
 * @returns {Object} 用户状态管理相关的方法和状态
 */
export const usePresence = (): UserStatusComposable => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();
  // 当前登录用户信息
  const user = useState<User.Profile | null>("auth:user");
  // 所有用户的在线状态映射表
  const usersStatus = useState<Record<string, boolean>>("users:status", () => ({}));

  // 状态更新锁，防止并发更新
  let isUpdating = false;
  // 用户活动防抖定时器
  let activityTimeout: ReturnType<typeof setTimeout>;
  // 存储所有活跃的订阅
  let activeSubscriptions: Array<() => void> = [];

  // 用户状态相关常量
  const ACTIVITY_TIMEOUT_MS = 1000; // 用户活动防抖时间
  const OFFLINE_THRESHOLD_MINUTES = 7; // 离线判定阈值（分钟）
  const STATUS_CHECK_INTERVAL_MS = 30000; // 状态检查间隔（毫秒）

  /**
   * 更新用户在线状态
   * @param status - 用户状态（true: 在线，false: 离线）
   */
  const updateUserStatus = async (status: boolean) => {
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
            status,
            last_activity_at: now,
          })
        );
      } else {
        await $directus.request(
          $content.createItem("users_status", {
            status,
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
      const response = await $directus.request<User.Status[]>(
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

      const status = (diffMinutes <= OFFLINE_THRESHOLD_MINUTES && response[0]?.status) || false;
      usersStatus.value[userId] = status;
      return status;
    } catch (error) {
      console.error("Failed to check user status:", error);
      return false;
    }
  };

  /**
   * 订阅指定用户的状态更新
   * @param userId - 要订阅的用户ID
   * @returns {Promise<void>}
   */
  const subscribeUserStatus = async (userId: string): Promise<(() => void) | undefined> => {
    //if (usersStatus.value[userId] !== undefined) return;

    try {
      const { subscription } = await $realtimeClient.subscribe("users_status", {
        query: {
          filter: {
            user_created: { _eq: userId },
          },
          fields: ["status", "last_activity_at"],
        },
      });

      const checkInterval = setInterval(async () => {
        await checkUserStatus(userId);
      }, STATUS_CHECK_INTERVAL_MS);

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

      // 保存清理函数
      const cleanup = () => {
        clearInterval(checkInterval);
        subscription.return(); // 关闭订阅
      };
      activeSubscriptions.push(cleanup);

      return cleanup;
    } catch (error) {
      console.error("Failed to subscribe to user status:", error);
    }
  };

  /**
   * 用户活动更新处理（防抖）
   */
  const debouncedUpdateActivity = () => {
    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
      if (user.value?.id) {
        updateUserStatus(true);
      }
    }, ACTIVITY_TIMEOUT_MS);
  };

  /**
   * 清理所有定时器和订阅
   */
  const cleanup = () => {
    if (activityTimeout) {
      clearTimeout(activityTimeout);
    }
    // 清理所有活跃的订阅
    while (activeSubscriptions.length) {
      const cleanup = activeSubscriptions.pop();
      cleanup?.();
    }
  };

  return {
    usersStatus,
    updateUserStatus,
    checkUserStatus,
    updateLastActivity: debouncedUpdateActivity,
    subscribeUserStatus,
    cleanup,
  };
};
