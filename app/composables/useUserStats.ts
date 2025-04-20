import type { UserStatsReturn } from "~/types";

/**
 * useUserStats
 * 用户统计相关的组合式函数
 * - 提供获取全站活跃用户总数的能力
 * - 内置缓存与加载状态，防止频繁请求
 */
export const useUserStats = (): UserStatsReturn => {
    // 获取 Nuxt 注入的 Directus 客户端和用户模块
    const { $directus, $user } = useNuxtApp();

    // 全站活跃用户总数（全局响应式状态）
    const totalUsers = useState<number>("stats:totalUsers", () => 0);

    // 加载状态（全局响应式状态）
    const isLoading = useState<boolean>("stats:loading", () => false);

    // 添加获取锁，防止并发请求
    let isFetching = false;
    // 上次获取时间
    const lastFetchTime = ref(0);
    // 缓存有效期（5分钟）
    const CACHE_DURATION = 5 * 60 * 1000;

    /**
     * 获取全站活跃用户总数
     * - 若缓存未过期则直接返回
     * - 防止并发请求
     * - 请求 Directus 用户接口，统计活跃用户数量
     */
    const fetchTotalUsers = async () => {
        const now = Date.now();
        // 如果数据已存在且未过期，直接返回
        if (totalUsers.value > 0 && (now - lastFetchTime.value) < CACHE_DURATION) {
            return;
        }

        if (isFetching) return;

        try {
            isFetching = true;
            isLoading.value = true;
            // 添加延迟以确保加载动画显示
            await new Promise(resolve => setTimeout(resolve, 300));

            const users = await $directus.request(
                $user.readUsers({
                    fields: ["id"],
                    filter: {
                        status: { _eq: "active" },
                    },
                })
            );
            totalUsers.value = users.length;
            lastFetchTime.value = now;
        } catch (error) {
            console.error("Failed to fetch total users:", error);
            totalUsers.value = 0;
        } finally {
            isFetching = false;
            isLoading.value = false;
        }
    };

    return {
        totalUsers,
        fetchTotalUsers,
        isLoading,
    };
};