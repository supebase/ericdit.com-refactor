import type { AppSettings } from "~/types";

function deepUnref<T>(val: T): any {
  return isRef(val) ? deepUnref(val.value) : val;
}

export function useSeo(options: AppSettings) {
  const config = useRuntimeConfig();
  const route = useRoute();
  const { getSettings } = useAppSettings();

  const { data: settings } = useAsyncData('seo-settings', getSettings);

  // 关键：deepUnref 放到 computed 内部
  const siteTitle = computed(() =>
    deepUnref(options.site_name) || settings.value?.site_name || ""
  );
  const siteDescription = computed(() =>
    deepUnref(options.site_description) || settings.value?.site_description || ""
  );
  const siteKeywords = computed(() =>
    deepUnref(options.seo_keywords) || settings.value?.seo_keywords || ""
  );

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