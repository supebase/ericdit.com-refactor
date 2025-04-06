export const useVersionCheck = () => {
  const needsUpdate = ref(false);
  let intervalId: NodeJS.Timeout | null = null;
  let isSetup = false;

  // 获取当前客户端版本号
  const getCurrentVersion = () => {
    return localStorage.getItem("app-version-hash") || "";
  };

  // 检查新版本
  const checkVersion = async () => {
    try {
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: "no-cache",
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const versionData = await response.json();
      const { buildHash } = versionData;

      if (!buildHash) {
        console.warn("No buildHash found in version.json");
        return;
      }

      const currentHash = getCurrentVersion();

      // 如果有当前版本且不同于新版本，则提示更新
      if (currentHash && buildHash !== currentHash) {
        console.log(`Version change detected: ${currentHash} -> ${buildHash}`);
        needsUpdate.value = true;
      }

      // 存储新版本哈希
      localStorage.setItem("app-version-hash", buildHash);

      // 同时保留原来的版本号存储，以保持兼容性
      localStorage.setItem("app-version", versionData.version);
    } catch (error) {
      console.error("Version check failed:", error);
    }
  };

  // 可见性变化处理函数
  const visibilityHandler = () => {
    if (document.visibilityState === "visible") {
      checkVersion();
    }
  };

  // 清理函数
  const cleanup = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", visibilityHandler);
    }
  };

  // 定期检查版本
  const startVersionCheck = () => {
    // 避免重复设置
    if (isSetup) return;
    isSetup = true;

    // 首次检查
    checkVersion();

    // 开发环境下每 30 秒检查一次，生产环境下每 2 分钟检查一次
    const interval = import.meta.dev ? 30 * 1000 : 2 * 60 * 1000;
    intervalId = setInterval(checkVersion, interval);

    // 页面可见性变化时也检查版本
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", visibilityHandler);
    }
  };

  return {
    needsUpdate,
    startVersionCheck,
    cleanup, // 导出清理函数，让组件可以在 onUnmounted 中调用
  };
};
