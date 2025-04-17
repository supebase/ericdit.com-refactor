<template>
  <main class="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900" role="main"
    aria-labelledby="error-title">
    <div class="text-center">
      <div class="mb-8 flex justify-center">
        <NavigationLogo />
      </div>
      <h1 id="error-title" class="text-xl font-extrabold mb-3"
        :aria-label="error?.statusCode === 404 ? '页面未找到' : '系统错误'">
        {{ error?.statusCode === 404 ? "页面未找到" : "发生错误" }}
      </h1>
      <p class="text-base text-neutral-500 mb-8" role="alert">
        {{ error?.message }}
      </p>
      <UButton variant="solid" color="neutral" to="/">返回首页</UButton>
    </div>
  </main>
</template>

<script setup lang="ts">
/**
 * 导入 Nuxt 错误类型定义
 */
import type { NuxtError } from "#app";

/**
 * 组件属性定义
 * @property {NuxtError} error - Nuxt错误对象，包含错误状态码和消息
 */
interface Props {
  error: NuxtError;
}

defineProps<Props>();

const NavigationLogo = defineAsyncComponent(() => import('./components/shared/NavigationLogo.vue'))
</script>
