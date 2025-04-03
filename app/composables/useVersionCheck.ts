import { ref } from "vue";

export const useVersionCheck = () => {
  const needsUpdate = ref(false);

  // 获取当前客户端版本号
  const getCurrentVersion = () => {
    return localStorage.getItem("app-version") || "0";
  };

  // 检查新版本
  const checkVersion = async () => {
    try {
      const response = await fetch("/version.json", {
        cache: "no-cache",
      });
      const { version } = await response.json();

      const currentVersion = getCurrentVersion();
      if (version !== currentVersion) {
        needsUpdate.value = true;
        // 存储新版本号
        localStorage.setItem("app-version", version);
      }
    } catch (error) {
      console.error("Version check failed:", error);
    }
  };

  // 定期检查版本
  const startVersionCheck = () => {
    // 首次检查
    checkVersion();
    // 开发环境下每 30 秒检查一次，生产环境下每 5 分钟检查一次
    const interval = import.meta.dev ? 30 * 1000 : 5 * 60 * 1000;
    setInterval(checkVersion, interval);
  };

  return {
    needsUpdate,
    startVersionCheck,
  };
};
