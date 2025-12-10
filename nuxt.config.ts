import { createResolver } from "@nuxt/kit";

const { resolve } = createResolver(import.meta.url);

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  ssr: false,
  modules: ["@nuxt/ui", "@nuxt/image", "@vueuse/nuxt", "@nuxtjs/mdc", "nuxt-emoji-picker"],

  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.SITE_URL,
      directusApiUrl: process.env.DIRECTUS_API_URL,
      directusDefaultPageSize: process.env.DIRECTUS_DEFAULT_PAGE_SIZE,
      directusWebSocketUrl: process.env.DIRECTUS_WEBSOCKET_URL,
      ipDataApiUrl: process.env.PUBLIC_IPDATA_API_URL,
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
      baseURL: process.env.DIRECTUS_API_URL + "/assets",
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

  ui: {
    fonts: false,
  },

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

  css: ["~/assets/css/app.css"],
});
