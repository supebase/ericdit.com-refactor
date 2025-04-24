import type { RouterConfig } from "@nuxt/schema";

// 添加安全导航函数
export const safeBack = () => {
  const route = useRoute();

  try {
    let history = JSON.parse(safeGetItem("routeHistory") || "[]");
    const originalPath = safeGetItem("originalPath");

    // 如果是从登录/注册页面返回
    if (route.path.includes("/login") || route.path.includes("/register")) {
      if (originalPath && !originalPath.includes("/login") && !originalPath.includes("/register")) {
        safeRemoveItem("originalPath");
        return navigateTo(originalPath);
      }
      return navigateTo("/");
    }

    // 移除当前路径（如果在最后一项）
    if (history.length > 0 && history[history.length - 1] === route.path) {
      history.pop();
    }

    // 获取上一个有效路径
    let previousPath = "/";
    while (history.length > 0) {
      const candidate = history.pop();
      if (
        typeof candidate === "string" &&
        !candidate.includes("/login") &&
        !candidate.includes("/register") &&
        candidate !== route.path
      ) {
        previousPath = candidate;
        break;
      }
    }

    safeSetItem("routeHistory", JSON.stringify(history));
    return navigateTo(previousPath);
  } catch (error) {
    console.warn("无法访问本地存储，可能处于隐私模式:", error);
    return navigateTo("/");
  }
};

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    const scrollContainer = document.querySelector(".overflow-y-auto");
    if (!scrollContainer) return;

    // 如果是从首页访问文章页面，保存首页的滚动位置
    if (from.path === "/" && to.path.includes("/article/")) {
      sessionStorage.setItem(
        "homeScrollPosition",
        JSON.stringify({
          top: scrollContainer.scrollTop,
          left: scrollContainer.scrollLeft,
        })
      );
      // 文章页面滚动到顶部
      scrollContainer.scrollTo({
        top: 0,
        left: 0,
      });
      return;
    }

    // 如果是从文章页面返回首页，恢复之前保存的位置
    if (from.path.includes("/article/") && to.path === "/") {
      const savedPosition = sessionStorage.getItem("homeScrollPosition");
      if (savedPosition) {
        const position = JSON.parse(savedPosition);
        sessionStorage.removeItem("homeScrollPosition");
        scrollContainer.scrollTo({
          top: position.top,
          left: position.left,
        });
        return;
      }
    }

    // 其他情况滚动到顶部
    scrollContainer.scrollTo({
      top: 0,
      left: 0,
    });
  },
};