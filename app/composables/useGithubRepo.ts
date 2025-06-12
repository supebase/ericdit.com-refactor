import type { GitHubProjectInfo, CacheItem } from "~/types";

// 缓存最大数量，防止内存泄漏
const MAX_CACHE_SIZE = 100;
// 缓存过期时间（毫秒），例如 1 小时
const CACHE_EXPIRATION_TIME = 1000 * 60 * 60;

// 使用 Map 作为简单的内存缓存，避免重复请求同一个仓库信息
const projectCache = new Map<string, CacheItem<GitHubProjectInfo>>();

function setCache(key: string, value: GitHubProjectInfo) {
  if (projectCache.size >= MAX_CACHE_SIZE) {
    // 删除最早的缓存
    const firstKey = projectCache.keys().next().value;
    if (firstKey) {
      projectCache.delete(firstKey);
    }
  }
  projectCache.set(key, { data: value, timestamp: Date.now() });
}

/**
 * 用于获取并缓存指定 GitHub 仓库项目信息的组合式函数
 * @param githubRepo 仓库名（格式如 "owner/repo"）
 * @returns 包含加载状态、项目信息、错误信息及获取方法的响应式对象
 */
export function useGithubRepo(githubRepo: string) {
  // 标记数据是否已加载
  const isLoaded = ref(false);
  // 存储获取到的项目信息
  const projectInfo = shallowRef<GitHubProjectInfo | null>(null);
  // 存储错误信息
  const error = ref<string | null>(null);

  /**
   * 异步获取 GitHub 项目信息
   * 优先从缓存读取，若无则通过 API 请求获取
   * @returns Promise<GitHubProjectInfo | null>
   */
  const fetchProjectInfo = (): Promise<GitHubProjectInfo | null> => {
    return new Promise(async (resolve, reject) => {
      // 如果缓存中已有数据且未过期，直接返回缓存内容
      if (projectCache.has(githubRepo)) {
        const cachedItem = projectCache.get(githubRepo)!;
        if (Date.now() - cachedItem.timestamp < CACHE_EXPIRATION_TIME) {
          projectInfo.value = cachedItem.data;
          isLoaded.value = true;
          error.value = null;
          resolve(projectInfo.value);
          return;
        } else {
          // 缓存过期，删除旧缓存
          projectCache.delete(githubRepo);
        }
      }

      // 重置加载状态和错误信息
      isLoaded.value = false;
      error.value = null;
      try {
        // 通过后端 API 获取项目信息
        const data = await $fetch("/api/github", {
          method: "POST",
          body: { githubRepo },
        });
        // 类型断言并存入响应式变量
        projectInfo.value = data as GitHubProjectInfo;
        // 写入缓存，提升后续访问效率
        setCache(githubRepo, projectInfo.value);
        resolve(projectInfo.value);
      } catch (err: any) {
        // 捕获并处理异常，记录错误信息
        error.value = err?.message || "获取 GitHub 项目信息失败";
        projectInfo.value = null;
        reject(error.value);
      } finally {
        // 无论成功与否都标记为已加载
        isLoaded.value = true;
      }
    });
  };

  // 返回响应式数据和方法，便于组件调用
  return {
    isLoaded,
    projectInfo,
    error,
    fetchProjectInfo,
  };
}
