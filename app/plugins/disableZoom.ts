/**
 * 禁用移动端双指缩放和双击缩放的 Nuxt 插件
 * - 防止用户通过手势或双击手势对页面进行缩放
 * - 适用于移动端 Web 应用，提升交互一致性
 */
export default defineNuxtPlugin(() => {
    if (typeof window !== 'undefined') {
        // 禁用双指缩放
        document.addEventListener('gesturestart', (e) => e.preventDefault())
        // 禁用双击缩放
        document.addEventListener('dblclick', (e) => e.preventDefault())
    }
})