export const useVisibilityChange = () => {
    const isVisible = ref(true);

    if (typeof document !== 'undefined') {
        isVisible.value = document.visibilityState === 'visible';

        const handler = () => {
            isVisible.value = document.visibilityState === 'visible';
        };

        const setup = () => {
            document.addEventListener('visibilitychange', handler);
        };

        const cleanup = () => {
            document.removeEventListener('visibilitychange', handler);
        };

        return {
            isVisible,
            setup,
            cleanup,
        };
    }

    return {
        isVisible,
        setup: () => { },
        cleanup: () => { },
    };
};