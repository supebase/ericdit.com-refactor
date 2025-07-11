/**
 * useVersionCheck
 * 用于检测前端应用是否有新版本发布，若有则提示需要刷新。
 * - 定期轮询 /version.json 获取最新构建 hash
 * - 页面可见性变化时主动检测
 * - 网络异常时自动重试
 * - 提供 cleanup 方法用于组件卸载时清理定时器和事件
 */
export const useVersionCheck = () => {
  // 标记是否需要更新
  const needsUpdate = ref(false);

  // 新版本信息暂存
  let pendingVersionInfo: { buildHash: string; version: string } | null = null;

  // 页面可见性相关工具
  const { isVisible } = useVisibilityChange();

  // 清理函数管理
  const { addCleanup, runCleanup } = createCleanup();

  // 网络异常重试延迟（10秒）
  const RETRY_DELAY = 10 * 1000;
  let retryTimeout: ReturnType<typeof setTimeout> | null = null;

  // interval 用 ref 管理，便于动态调整
  const interval = ref(import.meta.dev ? 30 * 1000 : 2 * 60 * 1000);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  /**
   * 检查版本信息
   * - 获取 /version.json
   * - 比较本地和远端 hash
   * - 若有新版本则设置 needsUpdate
   */
  const checkVersion = async () => {
    try {
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        // 业务异常
        console.error(
          "Version check failed: response not ok",
          response.status,
          response.statusText
        );
        return;
      }

      const { buildHash, version } = await response.json();
      const currentHash = safeStorage.get("app-version-hash");

      // 检测到新版本，暂存新版本信息
      // 每次检查都更新本地存储的 hash 和 version
      safeStorage.set("app-version-hash", buildHash);
      safeStorage.set("app-version", version);

      if (currentHash && buildHash !== currentHash) {
        needsUpdate.value = true;
        pendingVersionInfo = { buildHash, version };
      } else {
        needsUpdate.value = false;
      }
    } catch (error: any) {
      // 区分网络异常和业务异常
      if (error instanceof TypeError || error?.name === "TypeError") {
        console.error("Version check failed: 网络异常", error);
      } else {
        console.error("Version check failed: 业务异常", error);
      }
      // 网络异常时重试
      if (retryTimeout) clearTimeout(retryTimeout);
      retryTimeout = setTimeout(checkVersion, RETRY_DELAY);
    }
  };

  // 首次加载时立即检测
  checkVersion();

  // 页面可见性变化时主动检测
  watch(isVisible, (visible) => {
    if (visible) checkVersion();
  });

  // 定时轮询检测，支持动态调整
  const setupInterval = () => {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(checkVersion, interval.value);
    addCleanup(() => {
      if (intervalId) clearInterval(intervalId);
    });
  };
  setupInterval();

  // 监听 interval 变化，动态调整轮询间隔
  watch(interval, () => {
    setupInterval();
  });

  /**
   * 清理所有定时器和事件监听
   */
  const cleanup = (): void => {
    runCleanup();
    if (retryTimeout) clearTimeout(retryTimeout);
    if (intervalId) clearInterval(intervalId);
  };

  return {
    needsUpdate,
    cleanup,
    interval, // 暴露 interval，便于外部动态调整
    confirmUpdate: () => {
      // 只有检测到新版本时才写入
      if (pendingVersionInfo) {
        needsUpdate.value = false;
        pendingVersionInfo = null;
      }
    },
  };
};
