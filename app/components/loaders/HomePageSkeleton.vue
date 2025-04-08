<script setup>
const items = Array.from({ length: 3 }, () => ({
  type: Math.random() > 0.5 ? "image" : "text",
}));
</script>

<template>
  <div class="container">
    <div class="space-y-6 mt-5">
      <article
        v-for="(item, index) in items"
        :key="index"
        class="py-1">
        <div class="space-y-3">
          <!-- 标题骨架 -->
          <div class="text-lg mb-2 bg-neutral-200 dark:bg-neutral-800 h-6 w-3/4 rounded-md animate-pulse"></div>

          <!-- 图片骨架 -->
          <div
            v-if="item.type === 'image'"
            class="bg-neutral-200 dark:bg-neutral-800 rounded-lg aspect-[calc(4*3+1)/8] object-cover w-full animate-pulse"></div>

          <!-- 文字内容骨架 -->
          <div
            v-else
            class="space-y-2">
            <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full animate-pulse"></div>
            <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-11/12 animate-pulse"></div>
            <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-4/5 animate-pulse"></div>
            <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-9/12 animate-pulse"></div>
            <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-10/12 animate-pulse"></div>
          </div>

          <!-- 底部操作栏 -->
          <div class="flex justify-between items-center space-x-4">
            <!-- 头像和时间 -->
            <div class="flex items-center space-x-2">
              <div class="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
              <div class="w-16 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse"></div>
            </div>

            <div class="flex items-center space-x-15">
              <div class="w-8 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse"></div>
              <div class="w-8 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse"></div>
              <div class="w-8 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
