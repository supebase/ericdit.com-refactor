import { useVisibilityChange } from './useVisibilityChange';

export const useVersionCheck = () => {
  const needsUpdate = ref(false);
  const { isVisible } = useVisibilityChange();

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
      const currentHash = localStorage.getItem('app-version-hash');

      // 首次加载时应该设置初始值
      if (!currentHash) {
        localStorage.setItem('app-version-hash', buildHash);
        localStorage.setItem('app-version', version);
        return;
      }

      if (currentHash && buildHash !== currentHash) {
        needsUpdate.value = true;
        localStorage.setItem('app-version-hash', buildHash);
        localStorage.setItem('app-version', version);
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

  onUnmounted(() => clearInterval(intervalId));

  return {
    needsUpdate,
  };
};