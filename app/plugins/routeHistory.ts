export default defineNuxtPlugin(() => {
  const route = useRoute();

  // 初始化路由历史数组
  if (!safeStorage.get("routeHistory")) {
    safeStorage.set("routeHistory", JSON.stringify(["/"]));
  }

  // 监听路由变化
  watch(
    () => route.path,
    (newPath) => {
      // 保存登录前的页面路径（用于登录后跳转）
      if (!newPath.includes("/auth") && !newPath.includes("/auth?action=register")) {
        safeStorage.set("originalPath", newPath);
      }

      // 维护路由历史记录
      if (!newPath.includes("/auth") && !newPath.includes("/auth?action=register")) {
        const history = JSON.parse(safeStorage.get("routeHistory") || "[]");
        if (history[history.length - 1] !== newPath) {
          if (history.length >= 10) history.shift();
          history.push(newPath);
          safeStorage.set("routeHistory", JSON.stringify(history));
        }
      }
    },
    { immediate: true }
  );
});
