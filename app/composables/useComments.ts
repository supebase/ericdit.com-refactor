import type { Comments } from "~/types";

/**
 * 评论管理组合式函数
 * 提供评论相关的功能：
 * - 获取文章评论列表
 * - 获取评论回复列表
 * - 创建新评论
 * - 订阅评论更新
 */
export const useComments = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();

  // 用户头像缓存状态
  const userAvatars = useState<Record<string, string>>("comments:userAvatars", () => ({}));
  // 用户地理位置缓存状态
  const userLocations = useState<Record<string, string>>("comments:userLocations", () => ({}));

  /**
   * 获取评论列表，可以是文章的评论或评论的回复
   * @param options - 查询选项，包含过滤、排序、分页等条件
   * @param type - 查询类型：'content' 获取文章评论，'reply' 获取评论回复
   * @param id - 文章ID或父评论ID
   * @returns Promise<Comments.Item[]> 评论列表
   * @throws Error 当 API 请求失败时抛出错误
   */
  const getCommentsList = async (
    type: "content" | "reply",
    id: string,
    options?: Comments.QueryOptions
  ): Promise<Comments.Item[]> => {
    try {
      const filterKey = type === "content" ? "content_id" : "parent_comment_id";
      const response = await $directus.request<Comments.Item[]>(
        $content.readItems("comments", {
          ...options,
          filter: {
            ...options?.filter,
            [filterKey]: { _eq: id },
          },
        })
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.errors?.[0]?.message || `获取${type === "content" ? "评论" : "回复"}列表失败`
      );
    }
  };

  /**
   * 创建新评论或回复
   * @param data - 评论数据，包含内容、关联ID等信息
   * @returns Promise<Comments.Item> 创建成功的评论
   * @throws Error 当 API 请求失败时抛出错误
   */
  const createComment = async (data: Partial<Comments.Item>): Promise<Comments.Item> => {
    try {
      const response = await $directus.request<Comments.Item>(
        $content.createItem("comments", data)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "创建评论失败");
    }
  };

  /**
   * 订阅指定文章的评论更新
   * @param contentId - 文章ID
   * @param callback - 数据变化时的回调函数
   * @returns 取消订阅的清理函数
   */
  const subscribeComments = async (
    contentId: string,
    callback: (item: any) => void
  ): Promise<() => void> => {
    // 订阅评论更新
    const { subscription: commentSubscription } = await $realtimeClient.subscribe("comments", {
      query: {
        filter: {
          content_id: { _eq: contentId },
        },
      },
    });

    // 订阅用户头像、地理位置更新
    const { subscription: userSubscription } = await $realtimeClient.subscribe("directus_users", {
      query: {
        fields: ["id", "avatar", "location"],
      },
    });

    // 处理评论更新
    (async () => {
      for await (const item of commentSubscription) {
        callback(item);
      }
    })();

    // 处理用户头像、地理位置更新
    (async () => {
      for await (const item of userSubscription) {
        if (item.event === "update") {
          const userData = item.data[0];
          if (userData?.avatar) {
            userAvatars.value[userData.id] = useAssets(userData.avatar);
          }
          if (userData?.location) {
            userLocations.value[userData.id] = userData.location;
          }
        }
      }
    })();

    // 返回清理函数
    return () => {
      commentSubscription.return();
      userSubscription.return();
    };
  };

  /**
   * 获取用户头像URL
   * @param userId - 用户ID
   * @param avatarId - 头像ID
   */
  const getUserAvatarUrl = (userId: string, avatarId: string | null): string | null => {
    if (!avatarId) return null;
    if (!userAvatars.value[userId]) {
      userAvatars.value[userId] = useAssets(avatarId);
    }
    return userAvatars.value[userId];
  };

  // 添加获取用户地理位置的方法
  const getUserLocation = (userId: string): string | null => {
    return userLocations.value[userId] || null;
  };

  return {
    getCommentsList,
    createComment,
    subscribeComments,
    getUserAvatarUrl,
    getUserLocation,
  };
};
