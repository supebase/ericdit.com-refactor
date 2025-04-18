export const useVersionCheck = () => {
  const needsUpdate = ref(false);
  const { isVisible, setup, cleanup: cleanupVisibility } = useVisibilityChange();
  const { addCleanup, runCleanup } = createCleanup();

  const RETRY_DELAY = 10 * 1000;
  let retryTimeout: ReturnType<typeof setTimeout> | null = null;

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

      needsUpdate.value = false;

      // 首次加载时应该设置初始值
      if (!currentHash) {
        needsUpdate.value = false;
        safeSetItem('app-version-hash', buildHash);
        safeSetItem('app-version', version);
        return;
      }

      if (currentHash && buildHash !== currentHash) {
        needsUpdate.value = true;
        safeSetItem('app-version-hash', buildHash);
        safeSetItem('app-version', version);
      }
    } catch (error) {
      console.error('Version check failed:', error);

      // 网络异常时重试
      if (retryTimeout) clearTimeout(retryTimeout);
      retryTimeout = setTimeout(checkVersion, RETRY_DELAY);
    }
  };

  watch(isVisible, (visible) => {
    if (visible) checkVersion();
  });

  const interval = import.meta.dev ? 30 * 1000 : 2 * 60 * 1000;
  const intervalId = setInterval(checkVersion, interval);
  addCleanup(() => clearInterval(intervalId));

  setup();
  addCleanup(() => cleanupVisibility());

  const cleanup = (): void => {
    runCleanup();
    if (retryTimeout) clearTimeout(retryTimeout);
  };

  return {
    needsUpdate,
    cleanup,
  };
};