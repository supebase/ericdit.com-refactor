export default defineNuxtPlugin(() => {
  const route = useRoute();

  // 初始化路由历史数组
  if (!safeGetItem("routeHistory")) {
    safeSetItem("routeHistory", JSON.stringify(["/"]));
  }

  // 监听路由变化
  watch(
    () => route.path,
    (newPath) => {
      // 保存登录前的页面路径（用于登录后跳转）
      if (!newPath.includes("/login") && !newPath.includes("/register")) {
        safeSetItem("originalPath", newPath);
      }

      // 维护路由历史记录
      if (!newPath.includes("/login") && !newPath.includes("/register")) {
        const history = JSON.parse(safeGetItem("routeHistory") || "[]");
        if (history[history.length - 1] !== newPath) {
          if (history.length >= 10) history.shift();
          history.push(newPath);
          safeSetItem("routeHistory", JSON.stringify(history));
        }
      }
    },
    { immediate: true }
  );
});
