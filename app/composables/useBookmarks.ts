import type { BookmarkItem, BookmarkQueryOptions } from "~/types";

/**
 * 书签功能组合式函数
 * 提供书签相关的 CRUD 操作和实时订阅功能：
 * - 获取书签列表
 * - 创建新的书签
 * - 删除已有书签
 * - 订阅书签变化
 */
export const useBookmarks = () => {
  // 获取 Nuxt 应用中注入的 Directus、内容管理和实时客户端实例
  const { $directus, $content, $realtimeClient } = useNuxtApp();

  /**
   * 获取书签列表
   * @param options 查询参数
   * @returns 书签项数组
   */
  const getBookmarks = async (options?: BookmarkQueryOptions): Promise<BookmarkItem[]> => {
    try {
      const response = await $directus.request<BookmarkItem[]>(
        $content.readItems("bookmarks", options)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "获取书签列表失败");
    }
  };

  /**
 * 创建新的书签
 * @param data 书签数据
 * @returns {Promise<BookmarkItem>} 创建后的书签项
 * @throws {Error} 当 API 请求失败时抛出错误
 */
  const createBookmark = async (data: Partial<BookmarkItem>): Promise<BookmarkItem> => {
    try {
      const response = await $directus.request<BookmarkItem>(
        $content.createItem("bookmarks", data)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "创建书签失败");
    }
  };

  /**
 * 删除指定书签
 * @param id 书签ID
 * @returns {Promise<void>}
 * @throws {Error} 当 API 请求失败时抛出错误
 */
  const deleteBookmark = async (id: string): Promise<void> => {
    try {
      await $directus.request($content.deleteItem("bookmarks", id));
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "删除书签失败");
    }
  };

  /**
 * 若未收藏则添加书签，已收藏则提示
 * @param contentId 内容ID
 * @returns {Promise<BookmarkItem>} 新增的书签项
 * @throws {Error} 已收藏时抛出错误
 */
  const addBookmarkIfNotExists = async (contentId: string): Promise<BookmarkItem> => {
    // 查询当前用户是否已收藏该内容
    const existing = await getBookmarks({
      fields: ["id"],
      filter: {
        user_created: { _eq: useAuth().user.value?.id },
        content_id: { _eq: contentId },
      },
    });
    if (existing.length > 0) {
      // 已收藏，返回提示
      const toast = useToast();
      toast.add({
        title: "收藏提示",
        description: "您已收藏该内容，无需重复收藏。",
        icon: "hugeicons:alert-02",
        color: "warning",
      });

      throw new Error("您已收藏该内容，无需重复收藏");
    }
    // 未收藏，执行添加
    return createBookmark({ content_id: contentId });
  };

  /**
   * 订阅书签数据的实时变化
   * @param query 订阅条件
   * @param callback 数据变化时的回调
   * @returns 取消订阅的函数
   */
  const subscribeBookmarks = async (
    query: BookmarkQueryOptions,
    callback: (item: any) => void
  ): Promise<() => void> => {
    let subscription: any;
    const { addCleanup, runCleanup } = createCleanup();

    try {
      const sub = await $realtimeClient.subscribe("bookmarks", { query });
      subscription = sub.subscription;
      addCleanup(() => subscription?.return());

      (async () => {
        try {
          for await (const item of subscription) {
            callback(item);
          }
        } catch (error) {
          console.error("Error in bookmarks subscription:", error);
        }
      })();

      return () => {
        runCleanup();
      };
    } catch (error) {
      runCleanup();
      throw error;
    }
  };

  // 导出所有书签相关操作
  return {
    getBookmarks,
    createBookmark,
    deleteBookmark,
    addBookmarkIfNotExists,
    subscribeBookmarks,
  };
};
