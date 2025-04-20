/**
 * useVisibilityChange
 * 用于检测页面可见性（visibilitychange）变化的组合式函数。
 * - 提供 isVisible 响应式变量，实时反映页面是否可见
 * - 提供 setup 和 cleanup 方法，便于在组件生命周期内注册和注销事件监听
 */
export const useVisibilityChange = () => {
    // isVisible：页面当前是否可见
    const isVisible = ref(typeof document !== 'undefined' ? !document.hidden : true);
    const { addCleanup, runCleanup } = createCleanup();

    // 事件处理器：更新 isVisible 状态
    const handler = () => {
        isVisible.value = !document.hidden;
    };

    /**
     * 注册 visibilitychange 事件监听
     * 并在清理时自动移除
     */
    const setup = () => {
        document.addEventListener('visibilitychange', handler);
        addCleanup(() => document.removeEventListener('visibilitychange', handler));
    };

    /**
     * 清理所有注册的事件监听
     */
    const cleanup = () => {
        runCleanup();
    };

    return {
        isVisible,
        setup,
        cleanup,
    };
};