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

      if (import.meta.client) {
        localStorage.setItem("originalPath", window.location.pathname);
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
