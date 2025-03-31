/**
 * 资源 URL 缓存配置
 */
const CACHE_CONFIG = {
  MAX_SIZE: 100, // 最大缓存条目数
  CLEANUP_RATIO: 0.2, // 清理比例，每次清理 20% 的缓存
} as const;

/**
 * 资源 URL 缓存
 * 用于存储已经生成的资源 URL，避免重复计算
 * key: 原始资源路径
 * value: { url: 完整的资源访问 URL, timestamp: 缓存时间 }
 */
const assetCache = new Map<
  string,
  {
    url: string;
    timestamp: number;
  }
>();

// 存储基础 URL，避免重复计算
let baseUrlString: string | null = null;

/**
 * 清理过期缓存
 */
const cleanupCache = () => {
  if (assetCache.size <= CACHE_CONFIG.MAX_SIZE) return;

  const cleanupCount = Math.floor(assetCache.size * CACHE_CONFIG.CLEANUP_RATIO);
  const entries = Array.from(assetCache.entries());

  // 按时间戳排序，删除最旧的条目
  entries
    .sort(([, a], [, b]) => a.timestamp - b.timestamp)
    .slice(0, cleanupCount)
    .forEach(([key]) => assetCache.delete(key));
};

/**
 * 资源 URL 生成组合式函数
 * 将相对资源路径转换为完整的 Directus 资源访问 URL
 *
 * @param image - 资源路径（可以是相对路径或完整 URL）
 * @returns 完整的资源访问 URL
 * @throws Error 当 API URL 配置无效时抛出错误
 *
 * @example
 * ```ts
 * const avatarUrl = useAssets('users/avatar.jpg')
 * // 返回: https://api.example.com/assets/users/avatar.jpg
 *
 * const logoUrl = useAssets('brand/logo.png')
 * // 返回: https://api.example.com/assets/brand/logo.png
 * ```
 */
export const useAssets = (image: string): string => {
  // 如果传入的是空字符串或已经是完整URL，直接返回
  if (!image || image.startsWith("http")) {
    return image;
  }

  // 检查缓存中是否已存在该资源的 URL
  const cached = assetCache.get(image);
  if (cached) {
    return cached.url;
  }

  try {
    // 懒加载并缓存基础URL
    if (!baseUrlString) {
      const { directusApiUrl } = useRuntimeConfig().public;

      if (!directusApiUrl) {
        throw new Error("Directus API URL 未配置");
      }

      // 构建基础 URL，确保以 /assets/ 结尾
      const baseUrl = new URL(directusApiUrl);
      baseUrl.pathname = baseUrl.pathname.endsWith("/")
        ? `${baseUrl.pathname}assets/`
        : `${baseUrl.pathname}/assets/`;

      baseUrlString = baseUrl.toString();
    }

    // 生成完整的资源 URL 并缓存
    const url = new URL(image, baseUrlString).toString();

    // 检查并清理缓存
    cleanupCache();

    // 添加新的缓存条目
    assetCache.set(image, {
      url,
      timestamp: Date.now(),
    });

    return url;
  } catch (error) {
    console.error("生成资源 URL 失败:", error);
    return image; // 发生错误时返回原始路径
  }
};
