import type { CleanupController } from "~/types";

/**
 * createCleanup
 * 创建清理控制器，用于统一管理组件/模块中的清理逻辑
 * - 支持注册多个清理函数
 * - 支持批量执行并自动清空
 * @returns CleanupController 实例
 */
export const createCleanup = (): CleanupController => {
    // 存储所有注册的清理函数
    const cleanupFns: (() => void)[] = [];

    /**
     * 注册清理函数
     * @param fn 清理回调
     */
    const addCleanup = (fn: () => void) => {
        cleanupFns.push(fn);
    };

    /**
     * 执行所有清理函数，并清空队列
     */
    const runCleanup = () => {
        cleanupFns.forEach(fn => fn());
        cleanupFns.length = 0;
    };

    return {
        addCleanup,
        runCleanup
    };
};