export function safeSetItem(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.warn("无法访问本地存储，可能处于隐私模式:", error);
        return false;
    }
}

export function safeGetItem(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn("无法访问本地存储，可能处于隐私模式:", error);
        return null;
    }
}

export function safeRemoveItem(key: string) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.warn("无法访问本地存储，可能处于隐私模式:", error);
        return false;
    }
}