export default defineNuxtPlugin({
  enforce: "post",
  setup() {
    // 获取应用配置对象
    const appConfig = useAppConfig();

    // 客户端逻辑：根据本地存储的主题色动态设置应用主题色
    if (import.meta.client) {
      /**
       * 从本地存储读取指定类型的颜色，并更新到 appConfig.ui.colors
       * @param type 颜色类型（primary 或 neutral）
       */
      function updateColor(type: "primary" | "neutral") {
        const color = safeStorage.get(`nuxt-ui-${type}`);
        if (color) {
          appConfig.ui.colors[type] = color;
        }
      }

      // 更新主色和中性色
      updateColor("primary");
      updateColor("neutral");
    }
  },
});
