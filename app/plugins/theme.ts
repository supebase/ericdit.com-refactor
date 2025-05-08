export default defineNuxtPlugin({
  enforce: 'post',
  setup() {
    // 获取应用配置对象
    const appConfig = useAppConfig()

    // 客户端逻辑：根据本地存储的主题色动态设置应用主题色
    if (import.meta.client) {
      /**
       * 从本地存储读取指定类型的颜色，并更新到 appConfig.ui.colors
       * @param type 颜色类型（primary 或 neutral）
       */
      function updateColor(type: 'primary' | 'neutral') {
        const color = safeStorage.get(`nuxt-ui-${type}`)
        if (color) {
          appConfig.ui.colors[type] = color
        }
      }

      // 更新主色和中性色
      updateColor('primary')
      updateColor('neutral')
    }

    // 服务端逻辑：在 SSR 阶段动态注入脚本，替换页面中的主题色 CSS 变量
    if (import.meta.server) {
      useHead({
        script: [{
          innerHTML: `
              let html = document.querySelector('style#nuxt-ui-colors').innerHTML;
  
              if (safeGetItem('nuxt-ui-primary')) {
                const primaryColor = safeGetItem('nuxt-ui-primary');
                if (primaryColor !== 'black') {
                  html = html.replace(
                    /(--ui-color-primary-\\d{2,3}:\\s*var\\(--color-)${appConfig.ui.colors.primary}(-\\d{2,3}.*?\\))/g,
                    \`$1\${primaryColor}$2\`
                  );
                }
              }
              if (safeGetItem('nuxt-ui-neutral')) {
                let neutralColor = safeGetItem('nuxt-ui-neutral');
                html = html.replace(
                  /(--ui-color-neutral-\\d{2,3}:\\s*var\\(--color-)${appConfig.ui.colors.neutral}(-\\d{2,3}.*?\\))/g,
                  \`$1\${neutralColor === 'neutral' ? 'old-neutral' : neutralColor}$2\`
                );
              }
  
              document.querySelector('style#nuxt-ui-colors').innerHTML = html;
              `.replace(/\s+/g, ' '),
          type: 'text/javascript',
          tagPriority: -1

        }]
      })
    }
  }
})