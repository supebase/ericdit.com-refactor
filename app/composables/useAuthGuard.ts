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
   * 权限守卫执行器
   * @param action 需要鉴权的操作
   * @param message 未登录时的自定义提示
   */
  const guardAction = (action: () => void, message?: string) => {
    if (!isAuthenticated.value) {
      // 未登录时弹出提示
      toast.add({
        title: "访问受限",
        description: message || "该功能需要登录账号后使用",
        color: "warning",
      });

      try {
        // 客户端环境下记录原始路径，便于登录后跳转回来
        if (import.meta.client) {
          safeSetItem("originalPath", window.location.pathname);
        }
      } catch (error) {
        // 兼容隐私模式下本地存储不可用的情况
        console.warn('无法访问本地存储，可能处于隐私模式');
      }

      // 跳转到登录页
      navigateTo("/login");
      return;
    }

    // 已登录则执行原操作
    action();
  };

  return {
    guardAction,
  };
};