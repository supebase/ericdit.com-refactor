import type { LikeItem, LikeQueryOptions } from "~/types";

/**
 * 点赞功能组合式函数
 * 提供点赞相关的 CRUD 操作和实时订阅功能：
 * - 获取点赞列表
 * - 创建新的点赞
 * - 删除已有点赞
 * - 订阅点赞变化
 */
export const useLikes = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();

  /**
   * 获取点赞列表
   * @param options - 查询选项，包含过滤、排序等条件
   * @returns Promise<Likes.Item[]> 点赞列表
   * @throws Error 当 API 请求失败时抛出错误
   */
  const getLikes = async (options?: LikeQueryOptions): Promise<LikeItem[]> => {
    try {
      // @ts-ignore
      const response = await $directus.request<LikeItem[]>($content.readItems("likes", options));
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "获取点赞列表失败");
    }
  };

  /**
   * 创建新的点赞记录
   * @param data - 点赞数据，包含必要的关联信息
   * @returns Promise<Likes.Item> 创建成功的点赞记录
   * @throws Error 当 API 请求失败时抛出错误
   */
  const createLike = async (data: Partial<LikeItem>): Promise<LikeItem> => {
    try {
      // @ts-ignore
      const response = await $directus.request<LikeItem>($content.createItem("likes", data));
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "创建点赞失败");
    }
  };

  /**
   * 删除指定的点赞记录
   * @param id - 要删除的点赞记录 ID
   * @throws Error 当 API 请求失败时抛出错误
   */
  const deleteLike = async (id: string): Promise<void> => {
    try {
      // @ts-ignore
      await $directus.request($content.deleteItem("likes", id));
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "删除点赞失败");
    }
  };

  /**
   * 订阅点赞变化
   * @param query - 订阅查询条件
   * @param callback - 数据变化时的回调函数
   * @returns 取消订阅的清理函数
   */
  const subscribeLikes = async (
    query: LikeQueryOptions,
    callback: (item: any) => void
  ): Promise<() => void> => {
    const { subscription } = await $realtimeClient.subscribe("likes", { query });

    for await (const item of subscription) {
      callback(item);
    }

    return () => {
      subscription.return();
    };
  };

  return {
    getLikes,
    createLike,
    deleteLike,
    subscribeLikes,
  };
};
