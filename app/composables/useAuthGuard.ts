export const useAuthGuard = () => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const guardAction = (action: () => void, message?: string) => {
    if (!isAuthenticated.value) {
      toast.add({
        title: "访问受限",
        description: message || "该功能需要登录账号后使用",
        color: "warning",
      });

      try {
        if (import.meta.client) {
          localStorage.setItem("originalPath", window.location.pathname);
        }
      } catch (error) {
        console.warn('无法访问本地存储，可能处于隐私模式');
      }

      navigateTo("/login");
      return;
    }

    action();
  };

  return {
    guardAction,
  };
};
