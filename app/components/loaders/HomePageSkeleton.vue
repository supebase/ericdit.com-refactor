<script setup>
const items = Array.from({ length: 3 }, () => ({
  type: ["text", "single", "carousel"][Math.floor(Math.random() * 3)],
}));
</script>

<template>
  <div>
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
          <!-- 文本内容 -->
          <div
            v-if="item.type === 'text'"
            class="space-y-3">
            <!-- 标题和时间 -->
            <div class="flex items-center space-x-3">
              <div
                class="w-24 h-6 bg-neutral-200/40 dark:bg-neutral-800/40 rounded-full animate-pulse"></div>
              <div
                class="w-20 h-6 bg-neutral-200/40 dark:bg-neutral-800/40 rounded-full animate-pulse"></div>
            </div>
            <!-- 文本段落 -->
            <div class="space-y-2">
              <div class="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 animate-pulse"></div>
              <div
                class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full animate-pulse"></div>
              <div
                class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-11/12 animate-pulse"></div>
            </div>
          </div>

          <!-- 单图模式 -->
          <div
            v-if="item.type === 'single'"
            class="relative">
            <div
              class="aspect-[16/9] bg-neutral-200 dark:bg-neutral-800 rounded-xl w-full animate-pulse"></div>
            <!-- 右上角时间 -->
            <div class="absolute top-4 right-4">
              <div
                class="w-24 h-6 bg-neutral-200/40 dark:bg-neutral-800/40 rounded-full animate-pulse"></div>
            </div>
            <!-- 底部渐变标题区 -->
            <div
              class="absolute bottom-0 left-0 right-0 p-4">
              <div
                class="h-6 bg-neutral-100 dark:bg-neutral-900/80 rounded mb-2 animate-pulse"></div>
              <div
                class="h-4 bg-neutral-100 dark:bg-neutral-900/80 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>

          <!-- 轮播图模式 -->
          <div
            v-if="item.type === 'carousel'"
            class="relative">
            <div class="flex space-x-4 overflow-hidden">
              <div class="flex-none w-4/5">
                <div
                  class="aspect-[16/9] bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse"></div>
              </div>
              <div class="flex-none w-4/5 opacity-40">
                <div
                  class="aspect-[16/9] bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <template #footer>
          <div class="flex justify-between items-center mt-4 px-1">
            <div class="w-16 h-5 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
            <div class="w-16 h-5 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
            <div class="w-16 h-5 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
