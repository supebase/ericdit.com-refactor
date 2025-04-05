// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  ssr: false,
  modules: ["@nuxt/ui", "@vueuse/nuxt", "@nuxtjs/mdc", "nuxt-emoji-picker"],

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
    asyncContext: true, // 添加异步上下文支持
    componentIslands: true, // 启用组件孤岛架构
    treeshakeClientOnly: true, // 优化客户端代码
    crossOriginPrefetch: true, // 启用跨域预取优化
  },

  runtimeConfig: {
    public: {
      directusApiUrl: import.meta.env.DIRECTUS_API_URL,
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
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
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
      minify: "terser",
      target: "esnext",
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.info"],
          passes: 2,
          unsafe: true, // 启用不安全但有效的压缩
          unsafe_arrows: true, // 优化箭头函数
        },
        mangle: {
          toplevel: true, // 启用顶级变量名混淆
        },
      },
      rollupOptions: {
        treeshake: true, // 启用 tree shaking
      },
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "@vueuse/core", "@directus/sdk"],
      exclude: ["nuxt-emoji-picker"], // 排除不需要预构建的包
    },
    css: {
      devSourcemap: false,
    },
  },

  nitro: {
    minify: true,
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
    sourceMap: false,
    timing: false,
    esbuild: {
      options: {
        target: "esnext",
        minify: true,
        treeShaking: true,
        minifyIdentifiers: true,
        minifySyntax: true,
        minifyWhitespace: true,
        legalComments: "none", // 移除所有注释
      },
    },
    prerender: {
      crawlLinks: true,
      routes: ["/"],
    },
    publicAssets: [
      {
        dir: "public",
        maxAge: 60 * 60 * 24 * 365,
      },
    ],
    routeRules: {
      // 静态资源缓存策略
      "/_nuxt/**": {
        headers: {
          "cache-control": "public, max-age=31536000, immutable",
        },
      },
      // API 路由缓存策略
      "/api/**": {
        cors: true,
        headers: {
          "cache-control": "public, max-age=3600",
        },
      },
    },
  },

  build: {
    transpile: ["vue-router"],
    analyze: true,
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
      path: "./components",
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
