import type { UserMetricsReturn } from "~/types";

/**
 * 用户统计数据组合式函数
 * 提供用户评论数和点赞数的统计功能
 */
export const useUserMetrics = (): UserMetricsReturn => {
  // 获取 Nuxt 注入的 Directus 客户端和内容模块
  const { $directus, $content } = useNuxtApp();
  // 获取点赞相关方法
  const { getLikes } = useLikes();

  // 用户评论数
  const commentsCount = ref<number>(0);
  // 用户点赞数
  const likesCount = ref<number>(0);

  /**
 * 获取指定用户的评论数和点赞数
 * @param userId 用户ID
 * @returns {Promise<void>}
 * @throws {Error} 当 API 请求失败时抛出错误
 */
  const fetchStats = async (userId: string): Promise<void> => {
    if (!userId) return;

    try {
      // 并发获取评论和点赞数据
      const [comments, likes] = await Promise.all([
        $directus.request(
          $content.readItems("comments", {
            fields: ["id"],
            filter: {
              user_created: { _eq: userId },
            },
          })
        ),
        getLikes({
          fields: ["id"],
          filter: {
            user_created: { _eq: userId },
          },
        }),
      ]);

      commentsCount.value = comments.length;
      likesCount.value = likes.length;
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
      commentsCount.value = 0;
      likesCount.value = 0;
    }
  };

  return {
    commentsCount,
    likesCount,
    fetchStats,
  };
};