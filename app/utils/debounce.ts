/**
 * debounce
 * 防抖函数：在指定延迟时间内只执行最后一次调用
 * - 常用于输入、滚动等高频事件的性能优化
 * @param fn 需要防抖处理的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的新函数
 */
export const debounce = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};