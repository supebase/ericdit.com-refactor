/**
 * useAuthGuard
 * 登录权限守卫组合式函数
 * - 提供 guardAction 方法，自动判断用户是否已登录
 * - 未登录时弹出提示并跳转登录页，登录后可自动返回原路径
 */
export const useAuthGuard = () => {
  // 获取认证状态
  const { isAuthenticated } = useAuth();
  // 获取全局消息提示
  const toast = useToast();

  /**
   * 未登录时的处理逻辑
   */
  const handleUnauthenticated = (message?: string) => {
    toast.add({
      title: "访问受限",
      description: message || "该功能需要登录账号后使用",
      color: "warning",
    });

    try {
      if (import.meta.client) {
        safeStorage.set("originalPath", window.location.pathname);
      }
    } catch (error) {
      console.warn('无法访问本地存储，可能处于隐私模式');
    }

    navigateTo("/auth");
  };

  /**
   * 权限守卫执行器
   * @param action 需要鉴权的操作
   * @param message 未登录时的自定义提示
   */
  const guardAction = (action: () => void, message?: string) => {
    if (!isAuthenticated.value) {
      handleUnauthenticated(message);
      return;
    }
    action();
  };

  return {
    guardAction,
  };
};