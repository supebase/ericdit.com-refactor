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
   * 创建新内容
   * @param data - 内容信息
   * @returns Promise<Content.Item> 创建成功的内容
   * @throws Error 当 API 请求失败时抛出错误
   */
  const createContent = async (data: Partial<ContentItem>): Promise<ContentItem> => {
    try {
      const response = await $directus.request<ContentItem>($content.createItem("contents", data));
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "创建内容失败");
    }
  };

  /**
   * 创建 contents_files 关联记录
   * @param contents_id - 内容ID
   * @param directus_files_id - 文件ID
   * @returns Promise<{ id: string }> 新建的 contents_files 记录
   */
  const createContentFiles = async (contents_id: string, directus_files_id: string) => {
    try {
      const response = await $directus.request(
        $content.createItem("contents_files", {
          contents_id,
          directus_files_id,
        })
      );
      return response; // response.id 即为 contents_files 的 id
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "创建 contents_files 失败");
    }
  };

  /**
   * 更新内容
   * @param id - 内容ID
   * @param data - 更新的数据
   * @returns Promise<ContentItem>
   */
  const updateContent = async (id: string, data: Partial<ContentItem>): Promise<ContentItem> => {
    try {
      const response = await $directus.request<ContentItem>(
        $content.updateItem("contents", id, data)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "更新内容失败");
    }
  };

  /**
   * 删除内容
   * @param id - 内容ID
   * @returns Promise<void>
   */
  const deleteContent = async (id: string): Promise<void> => {
    try {
      await $directus.request($content.deleteItem("contents", id));
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "删除内容失败");
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
   * @description 先获取当前内容的浏览次数，使用队列来存储需要更新的内容ID，然后每30秒批量更新一次
   */
  // 浏览量上报队列
  const viewQueue: string[] = [];

  // 统计队列中每个内容ID出现次数
  const getViewBatch = () => {
    const countMap: Record<string, number> = {};
    viewQueue.forEach(id => {
      countMap[id] = (countMap[id] || 0) + 1;
    });
    return Object.entries(countMap).map(([id, count]) => ({ id, count }));
  };

  // 增加内容浏览量（只入队，不直接请求后端）
  const incrementContentViews = (id: string) => {
    viewQueue.push(id);
  };

  // 批量上报函数
  const flushViewQueue = async () => {
    if (viewQueue.length === 0) return;
    const batch = getViewBatch();
    viewQueue.length = 0; // 清空队列
    try {
      await $fetch("/api/batch-increment-views", {
        method: "POST",
        body: batch,
      });
    } catch (e) {
      // 失败时重新放回队列
      batch.forEach(item => {
        for (let i = 0; i < item.count; i++) {
          viewQueue.push(item.id);
        }
      });
    }
  };

  // 定时每30秒上报一次
  setInterval(flushViewQueue, 30000);

  // 页面关闭时兜底上报
  if (import.meta.client) {
    window.addEventListener("beforeunload", () => {
      if (viewQueue.length > 0) {
        try {
          const batch = getViewBatch();
          navigator.sendBeacon(
            "/api/batch-increment-views",
            JSON.stringify(batch)
          );
          viewQueue.length = 0;
        } catch (e) {
          // 忽略兜底上报异常
        }
      }
    });
  }

  // 可选：暴露手动上报方法
  const forceFlushViews = flushViewQueue;

  return {
    getContents,
    getContent,
    createContent,
    createContentFiles,
    updateContent,
    deleteContent,
    cleanMarkdown,
    subscribeContents,
    getUserAvatarUrl,
    incrementContentViews,
    forceFlushViews,
  };
};
