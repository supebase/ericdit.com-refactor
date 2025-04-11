import { createResolver } from "@nuxt/kit";

const { resolve } = createResolver(import.meta.url);

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  ssr: false,
  modules: [
    "@nuxt/ui",
    "@nuxt/image",
    "@vueuse/nuxt",
    "@nuxtjs/mdc",
    "nuxt-booster",
    "nuxt-emoji-picker",
  ],

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    treeshakeClientOnly: true, // 优化客户端代码
    crossOriginPrefetch: true, // 启用跨域预取优化
  },

  runtimeConfig: {
    public: {
      siteUrl: import.meta.env.SITE_URL,
      directusApiUrl: import.meta.env.DIRECTUS_API_URL,
      directusDefaultPageSize: import.meta.env.DIRECTUS_DEFAULT_PAGE_SIZE,
    },
  },

  app: {
    keepalive: true,
    buildAssetsDir: "static",
    head: {
      htmlAttrs: {
        lang: "zh-CN",
      },
      viewport:
        "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover",
      link: [
        { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" },
      ],
    },
  },

  vue: {
    propsDestructure: true,
  },

  vite: {
    build: {
      target: "esnext",
      rollupOptions: {
        output: {
          manualChunks: {
            "vue-vendor": ["vue", "vue-router"],
            directus: ["@directus/sdk"],
            vueuse: ["@vueuse/core"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "@vueuse/core", "@directus/sdk", "@nuxtjs/mdc"],
    },
  },

  nitro: {
    esbuild: {
      options: {
        target: "esnext",
      },
    },
    prerender: {
      crawlLinks: true,
    },
    publicAssets: [
      {
        dir: resolve("./public"),
        maxAge: 24 * 60 * 60 * 30,
      },
    ],
  },

  routeRules: {
    "/": {
      prerender: true,
    },
  },

  booster: {
    detection: {
      performance: true,
      browserSupport: true,
    },

    performanceMetrics: {
      device: {
        hardwareConcurrency: { min: 2, max: 48 },
        deviceMemory: { min: 2 },
      },
      timing: {
        fcp: 800,
        dcl: 1200,
      },
    },
    targetFormats: ["webp", "avif", "jpg|jpeg|png|gif"],
  },

  image: {
    directus: {
      baseURL: import.meta.env.DIRECTUS_API_URL + "/assets",
      modifiers: {
        withoutEnlargement: "true",
        format: "webp",
        quality: 80,
        lazy: true,
      },
    },
  },

  mdc: {
    headings: {
      anchorLinks: false,
    },
    highlight: {
      theme: {
        default: "github-light",
        dark: "github-dark",
      },
    },
    components: {
      prose: true,
    },
  },

  components: [
    {
      global: true,
      path: "~/components",
    },
  ],

  icon: {
    serverBundle: {
      collections: ["hugeicons", "svg-spinners"],
      externalizeIconsJson: true,
    },
    clientBundle: {
      scan: true,
    },
  },

  colorMode: {
    preference: "dark",
  },

  css: ["~/assets/app.css"],
});
