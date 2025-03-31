import type { Bookmarks } from "~/types";

/**
 * 书签功能组合式函数
 * 提供书签相关的 CRUD 操作和实时订阅功能：
 * - 获取书签列表
 * - 创建新的书签
 * - 删除已有书签
 * - 订阅书签变化
 */
export const useBookmarks = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();

  const getBookmarks = async (options?: Bookmarks.QueryOptions): Promise<Bookmarks.Item[]> => {
    try {
      const response = await $directus.request<Bookmarks.Item[]>(
        $content.readItems("bookmarks", options)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "获取书签列表失败");
    }
  };

  const createBookmark = async (data: Partial<Bookmarks.Item>): Promise<Bookmarks.Item> => {
    try {
      const response = await $directus.request<Bookmarks.Item>(
        $content.createItem("bookmarks", data)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "创建书签失败");
    }
  };

  const deleteBookmark = async (id: string): Promise<void> => {
    try {
      await $directus.request($content.deleteItem("bookmarks", id));
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "删除书签失败");
    }
  };

  const subscribeBookmarks = async (
    query: Bookmarks.QueryOptions,
    callback: (item: any) => void
  ): Promise<() => void> => {
    const { subscription } = await $realtimeClient.subscribe("bookmarks", { query });

    for await (const item of subscription) {
      callback(item);
    }

    return () => {
      subscription.return();
    };
  };

  return {
    getBookmarks,
    createBookmark,
    deleteBookmark,
    subscribeBookmarks,
  };
};
