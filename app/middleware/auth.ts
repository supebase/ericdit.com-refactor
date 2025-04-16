/**
 * @file auth.ts
 * @description 全局认证中间件，处理用户认证状态和路由访问控制
 */

export default defineNuxtRouteMiddleware(async (to) => {
  try {
    // 获取认证相关的状态和方法
    const { user, isAuthenticated, refreshUser } = useAuth();

    // 如果用户信息不存在，尝试刷新用户会话
    if (!user.value) {
      await refreshUser();
    }

    // 未认证用户重定向到登录页，但避免重定向循环
    if (!isAuthenticated.value && to.path !== "/login") {
      // 保存原始访问路径，以便登录后返回
      if (import.meta.client) {
        safeSetItem("originalPath", to.fullPath);
      }
      return navigateTo("/login", { replace: true });
    }

    // 已认证用户访问登录页时重定向到首页
    if (isAuthenticated.value && to.path === "/login") {
      return navigateTo("/", { replace: true });
    }
  } catch (error) {
    console.error("认证中间件执行失败:", error);
    // 发生错误时重定向到登录页，但避免重定向循环
    if (to.path !== "/login") {
      return navigateTo("/login", { replace: true });
    }
  }
});
