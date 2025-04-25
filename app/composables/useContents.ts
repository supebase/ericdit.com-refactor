import type { ContentItem, ContentQueryOptions } from "~/types";

/**
 * 内容管理组合式函数
 * 提供内容相关的查询和实时订阅功能：
 * - 获取内容列表
 * - 获取单个内容详情
 * - 订阅内容更新
 */
export const useContents = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();

  const { setUserAvatar, getUserAvatarUrl } = useUserMeta();

  /**
   * 获取内容列表
   * @param options - 查询选项，包含过滤、排序、分页等条件
   * @returns Promise<Contents.Item[]> 内容列表
   * @throws Error 当 API 请求失败时抛出错误
   */
  const getContents = async (options?: ContentQueryOptions): Promise<ContentItem[] | null> => {
    try {
      const response = await $directus.request<ContentItem[]>(
        $content.readItems("contents", options)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "获取内容列表失败");
    }
  };

  /**
   * 获取单个内容详情
   * @param id - 内容ID
   * @param options - 查询选项，可指定需要返回的字段等
   * @returns Promise<Contents.Item> 内容详情
   * @throws Error 当 API 请求失败时抛出错误
   */
  const getContent = async (
    id: string,
    options?: ContentQueryOptions
  ): Promise<ContentItem | null> => {
    try {
      const response = await $directus.request<ContentItem>(
        $content.readItem("contents", id, options)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "获取内容详情失败");
    }
  };

  /**
   * 清理 Markdown 语法，返回纯文本
   * @param text - 包含 Markdown 语法的文本
   * @returns 清理后的纯文本
   */
  const cleanMarkdown = (text: string): string => {
    // 类型和边界检查：只处理字符串类型
    if (typeof text !== "string" || !text) return "";

    const cleaned = text
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/\[(.+?)\]\(.+?\)({target=_blank})?/g, "$1") // 处理带有 target=_blank 的链接
      .replace(/`(.+?)`/g, "$1")
      .replace(/~~(.+?)~~/g, "$1")
      .replace(/>\s(.+)/g, "$1")
      .replace(/\n\s*[-*+]\s/g, "\n")
      .replace(/\n\s*\d+\.\s/g, "\n");

    return escapeHtml(cleaned);
  };

  /**
   * 订阅内容更新
   * @param query - 订阅查询条件，用于过滤需要监听的内容
   * @param callback - 数据变化时的回调函数
   * @returns 取消订阅的清理函数
   */
  const subscribeContents = async (
    query: ContentQueryOptions,
    callback: (item: any) => void
  ): Promise<() => void> => {
    let contentSubscription: any;
    let userSubscription: any;
    const { addCleanup, runCleanup } = createCleanup();

    try {
      // 订阅内容更新
      const contentSub = await $realtimeClient.subscribe("contents", { query });
      contentSubscription = contentSub.subscription;
      addCleanup(() => contentSubscription?.return());

      // 订阅用户头像更新
      const userSub = await $realtimeClient.subscribe("directus_users", {
        query: {
          fields: ["id", "avatar"],
        },
      });
      userSubscription = userSub.subscription;
      addCleanup(() => userSubscription?.return());

      // 处理内容更新
      (async () => {
        try {
          for await (const item of contentSubscription) {
            callback(item);
          }
        } catch (error) {
          console.error("Error in content subscription:", error);
        }
      })();

      // 处理用户头像更新
      (async () => {
        try {
          for await (const item of userSubscription) {
            if (item.event === "update") {
              const userData = item.data[0];
              if (userData?.avatar) {
                setUserAvatar(userData.id, userData.avatar);
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

  /**
   * 增加内容的浏览次数
   * @param id - 内容ID
   * @returns Promise<void>
   * @description 先获取当前内容的浏览次数，然后加1后写回
   */
  const incrementContentViews = async (id: string) => {
    try {
      // 先获取当前 views
      const content = await $directus.request<ContentItem>(
        $content.readItem("contents", id, { fields: ["views"] })
      );
      const currentViews = content?.views ?? 0;
      // 更新 views
      await $directus.request(
        $content.updateItem("contents", id, {
          views: currentViews + 1,
        })
      );
    } catch (error: any) {
      // 可以选择静默失败
      // console.warn("增加浏览次数失败", error);
    }
  };

  return {
    getContents,
    getContent,
    cleanMarkdown,
    subscribeContents,
    getUserAvatarUrl,
    incrementContentViews,
  };
};
