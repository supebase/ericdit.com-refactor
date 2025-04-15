import type { UserStatsReturn } from "~/types";

export const useUserStats = (): UserStatsReturn => {
    const { $directus, $user } = useNuxtApp();
    const totalUsers = useState<number>("stats:totalUsers", () => 0);
    const isLoading = useState<boolean>("stats:loading", () => false);

    // 添加获取锁，防止并发请求
    let isFetching = false;
    const lastFetchTime = ref(0);
    const CACHE_DURATION = 5 * 60 * 1000;

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