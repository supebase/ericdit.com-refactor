/**
 * useVersionCheck
 * 用于检测前端应用是否有新版本发布，若有则提示需要刷新。
 * - 定期轮询 /version.json 获取最新构建 hash
 * - 页面可见性变化时主动检测
 * - 网络异常时自动重试
 * - 提供 cleanup 方法用于组件卸载时清理定时器和事件
 */
export const useVersionCheck = () => {
  // 首次检测标志
  let isFirstCheck = true;

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

  /**
   * 检查版本信息
   * - 获取 /version.json
   * - 比较本地和远端 hash
   * - 若有新版本则设置 needsUpdate
   */
  const checkVersion = async () => {
    try {
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) return;

      const { buildHash, version } = await response.json();
      const currentHash = safeGetItem('app-version-hash');

      if (isFirstCheck) {
        // 首次加载或刷新页面，直接写入最新 hash 和 version，不弹提示
        safeSetItem('app-version-hash', buildHash);
        safeSetItem('app-version', version);
        needsUpdate.value = false;
        isFirstCheck = false;
        return;
      }

      // 检测到新版本，暂存新版本信息
      if (currentHash && buildHash !== currentHash) {
        needsUpdate.value = true;
        pendingVersionInfo = { buildHash, version };
      } else {
        needsUpdate.value = false;
      }
    } catch (error) {
      console.error('Version check failed:', error);

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

  // 定时轮询检测（开发环境30秒，生产2分钟）
  const interval = import.meta.dev ? 30 * 1000 : 2 * 60 * 1000;
  const intervalId = setInterval(checkVersion, interval);
  addCleanup(() => clearInterval(intervalId));

  /**
   * 清理所有定时器和事件监听
   */
  const cleanup = (): void => {
    runCleanup();
    if (retryTimeout) clearTimeout(retryTimeout);
  };

  return {
    needsUpdate,
    cleanup,
    confirmUpdate: () => {
      // 只有检测到新版本时才写入
      if (pendingVersionInfo) {
        safeSetItem('app-version-hash', pendingVersionInfo.buildHash);
        safeSetItem('app-version', pendingVersionInfo.version);
        needsUpdate.value = false;
        pendingVersionInfo = null;
      }
    }
  };
};