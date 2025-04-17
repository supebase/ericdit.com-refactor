import type { AppSettings } from "~/types";

export function useSeo(options: AppSettings) {
  const config = useRuntimeConfig();
  const route = useRoute();
  const { getSettings } = useAppSettings();

  const { data: settings } = useAsyncData('seo-settings', getSettings);

  const siteTitle = computed(() =>
    unref(options.site_name) || settings.value?.site_name || ""
  );
  const siteDescription = computed(() =>
    unref(options.site_description) || settings.value?.site_description || ""
  );
  const siteKeywords = computed(() =>
    unref(options.seo_keywords) || settings.value?.seo_keywords || ""
  );

  useSeoMeta({
    title: siteTitle,
    description: siteDescription,
    keywords: siteKeywords,
    ogTitle: computed(() => `${siteTitle.value}`),
    ogDescription: siteDescription,
    ogUrl: `${config.public.siteUrl}${route.path}`,
    ogType: options.type || "website",
    twitterTitle: computed(() => `${siteTitle.value}`),
    twitterDescription: siteDescription,
    robots: options.noindex ? "noindex, nofollow" : "index, follow",
  });
}
