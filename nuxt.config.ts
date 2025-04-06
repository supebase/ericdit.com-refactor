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
        output: {
          // 使用函数形式的 manualChunks
          manualChunks(id) {
            // Vue 相关库
            if (id.includes("node_modules/vue") || id.includes("node_modules/vue-router")) {
              return "vue-vendor";
            }
            // UI 组件库
            if (id.includes("node_modules/@nuxt/ui")) {
              return "ui-vendor";
            }
            // VueUse 工具库
            if (id.includes("node_modules/@vueuse")) {
              return "vueuse-vendor";
            }
            // Directus SDK
            if (id.includes("node_modules/@directus/sdk")) {
              return "directus-vendor";
            }
            // Emoji Picker
            if (id.includes("node_modules/nuxt-emoji-picker")) {
              return "emoji-vendor";
            }
            // MDC 相关
            if (id.includes("node_modules/@nuxtjs/mdc")) {
              return "mdc-vendor";
            }
            // 其他第三方库
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
        },
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
      // 首页路由优化
      "/": {
        prerender: true, // 预渲染首页
        cache: {
          // 缓存首页
          maxAge: 60 * 10, // 10分钟
        },
      },
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
      // 添加静态资源的缓存策略
      "/static/**": {
        headers: {
          "cache-control": "public, max-age=31536000, immutable",
        },
      },
      // 图片资源缓存策略
      "/**/*.{jpg,jpeg,png,svg,webp}": {
        headers: {
          "cache-control": "public, max-age=31536000, immutable",
        },
      },
    },
  },

  build: {
    transpile: ["vue-router"],
    analyze: false,
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
      pathPrefix: false,
      extensions: [".vue"],
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
