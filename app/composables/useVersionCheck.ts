export const useVersionCheck = () => {
  const needsUpdate = ref(false);
  const { isVisible } = useVisibilityChange();
  const { addCleanup, runCleanup } = createCleanup();

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
    }
  };

  watch(isVisible, (visible) => {
    if (visible) checkVersion();
  });

  const interval = import.meta.dev ? 30 * 1000 : 2 * 60 * 1000;
  const intervalId = setInterval(checkVersion, interval);
  addCleanup(() => clearInterval(intervalId));

  onUnmounted(() => runCleanup());

  return {
    needsUpdate,
  };
};