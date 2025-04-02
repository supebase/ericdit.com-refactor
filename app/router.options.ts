import type { RouterConfig } from "@nuxt/schema";

// 添加安全导航函数
export const safeBack = () => {
  const route = useRoute();

  // 使用 try-catch 包裹本地存储操作，避免隐私模式下的异常
  try {
    const history = JSON.parse(localStorage.getItem("routeHistory") || "[]");
    const originalPath = localStorage.getItem("originalPath");

    // 如果是从登录/注册页面返回
    if (route.path.includes("/login") || route.path.includes("/register")) {
      // 如果有登录前的页面记录，优先返回该页面
      if (originalPath && !originalPath.includes("/login") && !originalPath.includes("/register")) {
        localStorage.removeItem("originalPath");
        return navigateTo(originalPath);
      }
      return navigateTo("/");
    }

    // 防止历史记录中出现重复项
    const uniqueHistory = [...new Set(history)];

    // 移除当前路径
    if (uniqueHistory.length > 0 && uniqueHistory[uniqueHistory.length - 1] === route.path) {
      uniqueHistory.pop();
    }

    // 获取上一个有效路径
    let previousPath = uniqueHistory.length > 0 ? uniqueHistory.pop() : "/";

    // 避免返回到登录/注册页面
    if (
      typeof previousPath === "string" &&
      (previousPath.includes("/login") || previousPath.includes("/register"))
    ) {
      previousPath = "/";
    }

    localStorage.setItem("routeHistory", JSON.stringify(uniqueHistory));
    return navigateTo(previousPath as string);
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
