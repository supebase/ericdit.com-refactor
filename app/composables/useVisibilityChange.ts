export const useVisibilityChange = () => {
    const isVisible = ref(typeof document !== 'undefined' ? !document.hidden : true);
    const { addCleanup, runCleanup } = createCleanup();

    const handler = () => {
        isVisible.value = !document.hidden;
    };

    const setup = () => {
        document.addEventListener('visibilitychange', handler);
        addCleanup(() => document.removeEventListener('visibilitychange', handler));
    };

    const cleanup = () => {
        runCleanup();
    };

    onMounted(setup);
    onUnmounted(cleanup);

    return {
        isVisible,
        setup,
        cleanup,
    };
};