/**
 * 资源 URL 缓存
 * 用于存储已经生成的资源 URL，避免重复计算
 * key: 原始资源路径
 * value: 完整的资源访问 URL
 */
const assetCache = new Map<string, string>();

// 存储基础 URL，避免重复计算
let baseUrlString: string | null = null;

/**
 * 资源 URL 生成组合式函数
 * 将相对资源路径转换为完整的 Directus 资源访问 URL
 *
 * @param image - 资源路径（可以是相对路径或完整 URL）
 * @returns 完整的资源访问 URL
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
  if (assetCache.has(image)) {
    return assetCache.get(image)!;
  }

  // 懒加载并缓存基础URL
  if (!baseUrlString) {
    // 从运行时配置获取 Directus API URL
    const { directusApiUrl } = useRuntimeConfig().public;

    // 构建基础 URL，确保以 /assets/ 结尾
    const baseUrl = new URL(directusApiUrl);
    baseUrl.pathname = baseUrl.pathname.endsWith("/")
      ? `${baseUrl.pathname}assets/`
      : `${baseUrl.pathname}/assets/`;

    baseUrlString = baseUrl.toString();
  }

  // 生成完整的资源 URL 并缓存
  const url = new URL(image, baseUrlString).toString();
  assetCache.set(image, url);

  return url;
};
