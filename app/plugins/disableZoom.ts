export default defineNuxtPlugin(() => {
    if (typeof window !== 'undefined') {
        document.addEventListener('gesturestart', (e) => e.preventDefault())
        document.addEventListener('dblclick', (e) => e.preventDefault())
    }
})