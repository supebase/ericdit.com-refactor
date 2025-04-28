/**
 * @file app.config.ts
 * @description 应用全局配置文件，包含UI主题、组件和交互行为的默认配置
 */

export default defineAppConfig({
  // UI 主题与组件配置
  ui: {
    // 颜色主题配置
    colors: {
      primary: "amber", // 主色调：橙色
      neutral: "zinc", // 中性色：石灰色
    },
    // 图标配置
    icons: {
      loading: "svg-spinners:ring-resize", // 加载动画图标
    },
    // 按钮组件配置
    button: {
      slots: {
        base: "rounded-[calc(var(--ui-radius)*1)]", // 按钮圆角大小
      },
      compoundVariants: [
        {
          class: {
            leadingIcon: "animate-none size-5", // 禁用按钮前置图标的动画效果
          },
        },
      ],
    },
    card: {
      slots: {
        root: "rounded-[calc(var(--ui-radius)*1)]", // 卡片圆角大小
      },
    },
    alert: {
      slots: {
        root: "rounded-[calc(var(--ui-radius)*1)]", // 警告框圆角大小
      },
    },
    drawer: {
      compoundVariants: [
        {
          class: {
            content: "rounded-b-[calc(var(--ui-radius)*1.5)]", // 抽屉内内容圆角大小
          },
        },
      ],
    },
    modal: {
      variants: {
        fullscreen: {
          false: {
            content: "rounded-sm", // 模态框内内容圆角大小
          }
        },
      },
    },
    popover: {
      slots: {
        content: "rounded-[calc(var(--ui-radius)*1)]", // 弹出框内容圆角大小
      },
    },
    carousel: {
      variants: {
        active: {
          true: {
            dot: "bg-primary-500" // 激活的轮播点颜色
          }
        }
      }
    },
  },

  // 消息提示配置
  toaster: {
    position: "top-right" as const, // 消息提示位置
    expand: false, // 禁用消息展开效果
    duration: 3000, // 消息显示持续时间（毫秒）
  },

  // 工具提示配置
  tooltip: {
    delayDuration: 300, // 提示显示延迟时间（毫秒）
  },
});
