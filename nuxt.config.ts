import { createResolver } from "@nuxt/kit";

const { resolve } = createResolver(import.meta.url);

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  ssr: false,
  modules: ["@nuxt/ui", "@nuxt/image", "@vueuse/nuxt", "@nuxtjs/mdc", "nuxt-emoji-picker"],

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
  },

  runtimeConfig: {
    public: {
      siteUrl: import.meta.env.SITE_URL,
      directusApiUrl: import.meta.env.DIRECTUS_API_URL,
      directusDefaultPageSize: import.meta.env.DIRECTUS_DEFAULT_PAGE_SIZE,
      directusWebSocketUrl: import.meta.env.DIRECTUS_WEBSOCKET_URL,
      ipDataApiUrl: import.meta.env.PUBLIC_IPDATA_API_URL,
    },
    privateGitHubToken: process.env.PRIVATE_GITHUB_ACCESS_TOKENS,
  },

  app: {
    keepalive: true,
    head: {
      htmlAttrs: {
        lang: "zh-CN",
      },
      viewport:
        "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover",
    },
  },

  vue: {
    propsDestructure: true,
  },

  vite: {
    build: {
      target: "esnext",
      minify: "esbuild",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            "vue-vendor": ["vue", "vue-router"],
            directus: ["@directus/sdk"],
            vueuse: ["@vueuse/core"],
          },
        },
      },
      modulePreload: {
        polyfill: false,
      },
      reportCompressedSize: false,
      chunkSizeWarningLimit: 700,
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "@vueuse/core", "@directus/sdk", "debug"],
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
        maxAge: 60 * 60 * 24 * 90,
      },
    ],
  },

  routeRules: {
    "/": {
      prerender: true,
    },
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
