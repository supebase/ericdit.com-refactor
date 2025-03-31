<template>
  <div class="container">
    <div class="space-y-6 mt-3">
      <article
        v-for="i in 3"
        :key="i"
        class="py-1">
        <div class="space-y-3">
          <!-- 标题骨架 -->
          <div class="text-lg mb-2 bg-neutral-800 h-6 w-3/4 rounded-md animate-pulse"></div>

          <!-- 图片/内容骨架 -->
          <div
            class="bg-neutral-800 rounded-lg aspect-[calc(4*3+1)/8] object-cover w-full animate-pulse"></div>

          <!-- 底部操作栏 -->
          <div class="flex justify-between items-center space-x-4">
            <!-- 头像和时间 -->
            <div class="flex items-center space-x-2">
              <div class="w-7 h-7 rounded-full bg-neutral-800 animate-pulse"></div>
              <div class="w-16 h-4 bg-neutral-800 rounded-md animate-pulse"></div>
            </div>

            <div class="flex items-center space-x-15">
              <div class="w-8 h-4 bg-neutral-800 rounded-md animate-pulse"></div>
              <div class="w-8 h-4 bg-neutral-800 rounded-md animate-pulse"></div>
              <div class="w-8 h-4 bg-neutral-800 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
