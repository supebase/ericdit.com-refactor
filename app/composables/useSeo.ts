/**
 * SEO 元数据配置接口
 * @interface SeoOptions
 */
interface SeoOptions {
  /** 页面标题 */
  title: string | Ref<string>;
  /** 页面描述，用于 meta description 和社交媒体分享 */
  description?: string | Ref<string>;
  /** 页面类型，用于 Open Graph 协议 */
  type?: "website" | "article";
  /** 关键词数组，用于 meta keywords */
  keywords?: string[];
  /** 是否禁止搜索引擎索引此页面 */
  noindex?: boolean;
}

/**
 * SEO 元数据管理组合式函数
 * 用于统一管理页面的 SEO 相关元数据，支持:
 * - 基础 SEO 元数据
 * - Open Graph 协议
 * - Twitter Cards
 * - 搜索引擎索引控制
 *
 * @param {SeoOptions} options - SEO 配置选项
 * @example
 * ```ts
 * // 基础用法
 * useSeo({
 *   title: '页面标题',
 *   description: '页面描述'
 * })
 *
 * // 文章页面用法
 * useSeo({
 *   title: computed(() => article.value?.title),
 *   description: computed(() => article.value?.description),
 *   type: 'article'
 * })
 * ```
 */
export function useSeo(options: SeoOptions) {
  const config = useRuntimeConfig();
  const route = useRoute();

  // 从运行时配置获取站点 URL
  const siteUrl = config.public.siteUrl;
  const defaultDescription = "";

  // 设置所有 SEO 相关的元数据
  useSeoMeta({
    // 基础 SEO 元数据
    title: computed(() => `${unref(options.title)}`),
    description: unref(options.description) || defaultDescription,
    keywords: options.keywords?.join(", "),

    // Open Graph 协议元数据
    ogTitle: computed(() => `${unref(options.title)} - Eric`),
    ogDescription: unref(options.description) || defaultDescription,
    ogUrl: `${siteUrl}${route.path}`,
    ogType: options.type || "website",

    // Twitter Cards 元数据
    twitterTitle: computed(() => `${unref(options.title)} - Eric`),
    twitterDescription: unref(options.description) || defaultDescription,

    // 搜索引擎索引控制
    robots: options.noindex ? "noindex, nofollow" : "index, follow",
  });
}
