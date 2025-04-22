/**
 * useVisibilityChange
 * 用于检测页面可见性（visibilitychange）变化的组合式函数。
 * - 提供 isVisible 响应式变量，实时反映页面是否可见
 */
export const useVisibilityChange = () => {
    // isVisible：页面当前是否可见
    const visibility = useDocumentVisibility()
    const isVisible = computed(() => visibility.value === 'visible')

    return {
        isVisible,
    }
}