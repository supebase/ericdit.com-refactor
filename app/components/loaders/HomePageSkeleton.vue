<script setup>
const items = Array.from({ length: 3 }, () => ({
  type: Math.random() > 0.5 ? "image" : "text",
}));
</script>

<template>
  <div class="ml-10">
    <div class="space-y-6 mt-5">
      <UCard
        v-for="(item, index) in items"
        :key="index"
        :ui="{
          root: 'bg-white dark:bg-neutral-900 divide-none',
          body: '!p-0',
          footer: '!p-0',
        }"
        variant="soft"
        class="select-none first:pt-0 last:pb-0">
        <div class="relative">
          <!-- 头像和用户信息 -->
          <div
            v-if="item.type === 'text'"
            class="flex items-center space-x-2 -ml-10">
            <div
              class="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
            <div class="flex justify-between items-center w-full">
              <div class="w-20 h-5 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
              <div class="w-24 h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
            </div>
          </div>

          <!-- 单图模式 -->
          <div
            v-if="item.type === 'image'"
            class="relative">
            <div
              class="aspect-[calc(4*3+1)/8] bg-neutral-200 dark:bg-neutral-800 rounded-lg w-full animate-pulse"></div>
            <!-- 左上角头像 -->
            <div class="absolute top-0 -left-10">
              <div
                class="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
            </div>
            <!-- 左上角用户名 -->
            <div class="absolute top-4 left-4">
              <div
                class="w-20 h-6 bg-neutral-200/40 dark:bg-neutral-800/40 rounded-full animate-pulse"></div>
            </div>
            <!-- 右上角时间 -->
            <div class="absolute top-4 right-4">
              <div
                class="w-24 h-6 bg-neutral-200/40 dark:bg-neutral-800/40 rounded-full animate-pulse"></div>
            </div>
            <!-- 底部标题 -->
            <div
              class="absolute bottom-0 left-0 right-0 p-3 m-2 bg-neutral-300/40 dark:bg-black/30 backdrop-blur-sm rounded-lg">
              <div class="h-6 bg-neutral-200/40 dark:bg-neutral-800/40 rounded animate-pulse"></div>
            </div>
          </div>

          <!-- 文本内容 -->
          <div
            v-if="item.type === 'text'"
            class="space-y-2 mt-2">
            <div class="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 animate-pulse"></div>
            <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full animate-pulse"></div>
            <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-11/12 animate-pulse"></div>
            <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-4/5 animate-pulse"></div>
            <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-10/12 animate-pulse"></div>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <template #footer>
          <div class="flex justify-between items-center mt-3">
            <div class="w-16 h-5 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
            <div class="w-16 h-5 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
            <div class="w-16 h-5 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
