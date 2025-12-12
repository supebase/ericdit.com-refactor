import type { AppSettings } from "~/types";
import { isRef, isReactive, toRaw } from "vue";

/**
 * 深度解包 ref 或 reactive 对象
 * @param val 可能为 ref/reactive 的值
 * @returns 解包后的原始值
 */
function deepUnref<T>(val: T): any {
  if (isRef(val)) {
    return deepUnref(val.value);
  } else if (isReactive(val)) {
    return toRaw(val);
  }
  return val;
}

/**
 * useSeo
 * SEO 元信息自动设置组合式函数
 * - 支持动态标题、描述、关键词等
 * - 优先使用传入 options，其次 fallback 到全局设置
 * - 自动注入 Open Graph、Twitter、robots 等元标签
 * @param options 页面级 SEO 配置
 */
export function useSeo(options: AppSettings) {
  // 获取运行时配置
  const config = useRuntimeConfig();
  // 获取当前路由信息
  const route = useRoute();
  // 获取全局应用设置
  const { getSettings } = useAppSettings();

  // 异步获取全局 SEO 设置
  const { data: settings } = useAsyncData('seo-settings', getSettings);

  // 计算站点标题，优先使用 options，其次 fallback 到全局设置
  const siteTitle = computed(() =>
    deepUnref(options.site_name) || settings.value?.site_name || ""
  );
  // 计算站点描述
  const siteDescription = computed(() =>
    deepUnref(options.site_description) || settings.value?.site_description || ""
  );
  // 计算站点关键词
  const siteKeywords = computed(() =>
    deepUnref(options.seo_keywords) || settings.value?.seo_keywords || ""
  );

  // 注入 SEO 元信息
  useSeoMeta({
    title: siteTitle,
    description: siteDescription,
    keywords: siteKeywords,
    ogTitle: siteTitle,
    ogDescription: siteDescription,
    ogUrl: computed(() => `${config.public.siteUrl}${route.path}`),
    ogType: computed(() => options.type || "website"),
    twitterTitle: siteTitle,
    twitterDescription: siteDescription,
    robots: computed(() => options.noindex ? "noindex, nofollow" : "index, follow"),
  });
}