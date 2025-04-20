/**
 * 安全设置 localStorage 项
 * - 支持隐私模式或本地存储不可用时的异常捕获
 * @param key 键名
 * @param value 键值
 * @returns 是否设置成功
 */
export function safeSetItem(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.warn("无法访问本地存储，可能处于隐私模式:", error);
        return false;
    }
}

/**
 * 安全获取 localStorage 项
 * - 支持隐私模式或本地存储不可用时的异常捕获
 * @param key 键名
 * @returns 获取到的值或 null
 */
export function safeGetItem(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn("无法访问本地存储，可能处于隐私模式:", error);
        return null;
    }
}

/**
 * 安全移除 localStorage 项
 * - 支持隐私模式或本地存储不可用时的异常捕获
 * @param key 键名
 * @returns 是否移除成功
 */
export function safeRemoveItem(key: string) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.warn("无法访问本地存储，可能处于隐私模式:", error);
        return false;
    }
}