import type { CommentItem, CommentQueryOptions } from "~/types";
import cache from "~/utils/cache";
import { useLoading } from "./useLoading";

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
  const { wrap: withLoading } = useLoading();

  const { setUserAvatar, setUserLocation, getUserAvatarUrl, getUserLocation } = useUserMeta();

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
    options?: CommentQueryOptions
  ): Promise<CommentItem[]> => {
    const fetchComments = async () => {
      try {
        const filterKey = type === "content" ? "content_id" : "parent_comment_id";
        // @ts-ignore
        const response = await $directus.request<CommentItem[]>($content.readItems("comments", {
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

    // 使用缓存包装，评论列表缓存 2 分钟
    return await cache.wrap(
      `comments:${type}:${id}`,
      () => withLoading(fetchComments),
      2 * 60 * 1000, // 2 分钟
      { type, id, ...options }
    );
  };

  /**
 * 获取全站最新评论（评论和回复，不区分 contentId）
 * @param options - 查询选项，包含排序、分页等条件
 * @returns Promise<CommentItem[]> 最新评论列表
 */
  const getRecentComments = async (
    options?: CommentQueryOptions
  ): Promise<CommentItem[]> => {
    const fetchRecentComments = async () => {
      try {
        // @ts-ignore
        const response = await $directus.request<CommentItem[]>($content.readItems("comments", {
            ...options,
            sort: ["-date_created"],
          })
        );
        return response;
      } catch (error: any) {
        throw new Error(error.errors?.[0]?.message || "最新评论获取失败");
      }
    };

    // 使用缓存包装，最新评论缓存 1 分钟
    return await cache.wrap(
      "comments:recent",
      () => withLoading(fetchRecentComments),
      60 * 1000, // 1 分钟
      options
    );
  };

  /**
   * 创建新评论或回复
   * @param data - 评论数据，包含内容、关联ID等信息
   * @returns Promise<Comments.Item> 创建成功的评论
   * @throws Error 当 API 请求失败时抛出错误
   */
  const createComment = async (data: Partial<CommentItem>): Promise<CommentItem> => {
    try {
      // @ts-ignore
      const response = await $directus.request<CommentItem>($content.createItem("comments", data));
      
      // 清除相关缓存
      if (data.content_id) {
        cache.delete(`comments:content:${data.content_id}`);
      }
      if (data.parent_comment_id) {
        cache.delete(`comments:reply:${data.parent_comment_id}`);
      }
      cache.delete("comments:recent");
      
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "创建评论失败");
    }
  };

  /**
   * 删除评论或回复（会递归删除所有子回复）
   * @param commentId - 评论ID
   * @returns Promise<void>
   */
  const deleteComment = async (commentId: string): Promise<void> => {
    try {
      // 先获取评论信息，用于清除缓存
      // @ts-ignore
      const comment = await $directus.request<CommentItem>($content.readItem("comments", commentId, {
          fields: ["id", "content_id", "parent_comment_id"]
        })
      );
      
      // 先查找所有子回复
      // @ts-ignore
      const replies = await $directus.request<CommentItem[]>($content.readItems("comments", {
          filter: {
            parent_comment_id: { _eq: commentId },
          },
          fields: ["id"],
        })
      );
      // 递归删除所有子回复
      for (const reply of replies) {
        await deleteComment(reply.id);
      }
      // 删除主评论
      // @ts-ignore
      await $directus.request($content.deleteItem("comments", commentId));
      
      // 清除相关缓存
      if (comment.content_id) {
        cache.delete(`comments:content:${comment.content_id}`);
      }
      if (comment.parent_comment_id) {
        cache.delete(`comments:reply:${comment.parent_comment_id}`);
      }
      cache.delete("comments:recent");
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "删除评论失败");
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
    let commentSubscription: any;
    let userSubscription: any;
    const { addCleanup, runCleanup } = createCleanup();

    try {
      // 订阅评论更新
      const commentSub = await $realtimeClient.subscribe("comments", {
        query: {
          filter: {
            content_id: { _eq: contentId },
          },
        },
      });
      commentSubscription = commentSub.subscription;
      addCleanup(() => commentSubscription?.return());

      // 订阅用户头像、地理位置更新
      const userSub = await $realtimeClient.subscribe("directus_users", {
        query: {
          fields: ["id", "avatar", "location"],
        },
      });
      userSubscription = userSub.subscription;
      addCleanup(() => userSubscription?.return());

      // 处理评论更新
      (async () => {
        try {
          for await (const item of commentSubscription) {
            callback(item);
          }
        } catch (error) {
          console.error("Error in comment subscription:", error);
        }
      })();

      // 处理用户头像、地理位置更新
      (async () => {
        try {
          for await (const item of userSubscription) {
            if (item.event === "update") {
              const userData = item.data[0];
              if (userData?.avatar) {
                setUserAvatar(userData.id, userData.avatar);
              }
              if (userData?.location) {
                setUserLocation(userData.id, userData.location);
              }
            }
          }
        } catch (error) {
          console.error("Error in user subscription:", error);
        }
      })();

      return () => {
        runCleanup();
      };
    } catch (error) {
      // 确保在发生错误时清理订阅
      runCleanup();
      throw error;
    }
  };

  return {
    getCommentsList,
    getRecentComments,
    createComment,
    deleteComment,
    subscribeComments,
    getUserAvatarUrl,
    getUserLocation,
  };
};
