interface UserStatsReturn {
  commentsCount: Ref<number>;
  likesCount: Ref<number>;
  fetchStats: (userId: string) => Promise<void>;
}

/**
 * 用户统计数据组合式函数
 * 提供用户评论数和点赞数的统计功能
 */
export const useUserMetrics = (): UserStatsReturn => {
  const { $directus, $content } = useNuxtApp();
  const { getLikes } = useLikes();

  const commentsCount = ref<number>(0);
  const likesCount = ref<number>(0);

  const fetchStats = async (userId: string) => {
    if (!userId) return;

    try {
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
