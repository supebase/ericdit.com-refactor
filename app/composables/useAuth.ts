import type { UserProfile } from "~/types";

/**
 * 用户认证管理组合式函数
 * 提供用户认证相关功能：
 * - 用户登录
 * - 用户登出
 * - 刷新用户信息
 * - 认证状态管理
 */
export const useAuth = () => {
  const { $directus, $content, $user, $authClient } = useNuxtApp();

  /**
   * 用户信息状态
   * null 表示未登录或登录失效
   */
  const user = useState<UserProfile | null>("auth:user", () => null);

  /**
   * 用户认证状态
   * true: 已登录
   * false: 未登录或登录失效
   */
  const isAuthenticated = computed(() => !!user.value);

  /**
   * 用户登录
   * @param email - 用户邮箱
   * @param password - 用户密码
   * @throws Error 当登录失败时抛出错误
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      await $authClient.login(email, password);
      await refreshUser();
    } catch (error: any) {
      throw error;
    }
  };

  /**
   * 用户登出
   * 清除用户认证信息和状态
   * @throws Error 当登出失败时抛出错误
   */
  const logout = async (): Promise<void> => {
    try {
      await $authClient.logout();
      // 清除存储的原始路径
      safeStorage.remove("originalPath");
      user.value = null;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "登出失败");
    }
  };

  /**
   * 用户注册
   * @param email - 用户邮箱
   * @param password - 用户密码
   * @param firstName - 用户名
   * @throws Error 当注册失败时抛出错误
   */
  const register = async (email: string, password: string, firstName: string): Promise<void> => {
    try {
      await $authClient.request(
        $user.registerUser(email, password, {
          first_name: firstName,
        })
      );
      await login(email, password);
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "注册失败");
    }
  };

  /**
   * 更新用户地理位置信息
   * 获取用户当前 IP 对应的地理位置，并更新到用户资料中
   * 该方法通常在用户登录后或需要更新位置信息时调用
   *
   * @async
   * @throws {Error} 当位置信息获取失败或更新失败时，错误会被捕获并记录，但不会抛出
   * @returns {Promise<void>}
   */
  const updateUserLocation = async (): Promise<void> => {
    try {
      const { location } = await useGeoLocation();
      await $authClient.request(
        $user.updateMe({
          location,
        })
      );

      await refreshUser();
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "更新用户地理位置失败");
    }
  };

  /**
   * 刷新用户信息
   * 获取最新的用户数据并更新状态
   * @throws Error 当获取用户信息失败时抛出错误
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const response = await $directus.request<UserProfile>($user.readMe());
      user.value = response;
    } catch (error: any) {
      // 只在用户之前是登录状态，且遇到认证失败（401）或权限不足（403）时处理
      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        user.value !== null
      ) {
        user.value = null;

        const toast = useToast();
        toast.add({
          title: "会话已过期",
          description: "您的登录会话已过期，请重新登录。",
          icon: "hugeicons:lock-key",
          color: "warning",
        });
        // 重定向到登录页
        navigateTo("/auth");
      } else {
        // 其他情况只清除用户状态
        user.value = null;
      }
      // throw new Error(error.errors?.[0]?.message || "获取用户信息失败");
    }
  };

  /**
   * 通过邮箱获取用户状态
   * @param email - 用户邮箱
   * @returns {Promise<"active" | "suspended" | null>} 用户状态
   */
  const getUserStatusByEmail = async (email: string): Promise<"active" | "suspended" | null> => {
    try {
      const users = await $directus.request(
        $user.readUsers({
          filter: { email: { _eq: email } },
          fields: ["status"],
          limit: 1,
        })
      );
      if (users && users.length > 0) {
        return users[0]?.status as "active" | "suspended";
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // 添加自动检查机制
  const startSessionCheck = () => {
    if (typeof window === "undefined") return;

    const { isVisible } = useVisibilityChange();
    const { addCleanup, runCleanup } = createCleanup();

    // 每 30 分钟检查一次
    const interval = 30 * 60 * 1000;
    const checkInterval = setInterval(() => {
      if (isAuthenticated.value) {
        refreshUser().catch(() => {});
      }
    }, interval);
    addCleanup(() => clearInterval(checkInterval));

    // 监听可见性变化
    watch(isVisible, (visible) => {
      if (visible && isAuthenticated.value) {
        refreshUser().catch(() => {});
      }
    });

    // 返回清理函数
    return () => {
      runCleanup();
    };
  };

  /**
   * 获取当前用户角色名称
   * @returns {Promise<string | null>} 角色名称
   */
  const getUserRoleName = async (): Promise<string | null> => {
    if (isAuthenticated.value) {
      try {
        const response = await $directus.request<UserProfile>(
          $user.readMe({ fields: ["role.name"] })
        );
        return response?.role?.name ?? null;
      } catch (error: any) {
        throw new Error(error.errors?.[0]?.message || "获取角色数据失败");
      }
    }
    return null;
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    register,
    updateUserLocation,
    refreshUser,
    getUserStatusByEmail,
    startSessionCheck,
    validateEmail,
    getUserRoleName,
  };
};
