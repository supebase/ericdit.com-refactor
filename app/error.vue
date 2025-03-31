<template>
  <main
    class="min-h-screen flex items-center justify-center"
    role="main"
    aria-labelledby="error-title">
    <div class="text-center">
      <h1
        id="error-title"
        class="text-4xl font-bold mb-4"
        :aria-label="error?.statusCode === 404 ? '页面未找到' : '系统错误'">
        {{ error?.statusCode === 404 ? "页面未找到" : "发生错误" }}
      </h1>
      <p
        class="text-gray-600 mb-6"
        role="alert">
        {{ error?.message }}
      </p>
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
</script>
