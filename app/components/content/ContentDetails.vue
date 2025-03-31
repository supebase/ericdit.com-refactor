<template>
  <article class="py-4 space-y-5">
    <div class="text-xl font-bold">{{ content.title }}</div>
    <div
      class="flex justify-between items-center text-sm text-neutral-500 nums tabular-nums select-none">
      <div class="flex items-center space-x-3">
        <UAvatar
          :src="useAssets(content.user_created.avatar) || undefined"
          size="sm" />
        <div class="text-base text-neutral-50 font-medium">
          {{ content.user_created.first_name }}
        </div>
        <UIcon
          name="hugeicons:arrow-right-01"
          class="size-3 text-neutral-500" />
        <div>
          {{ useDateFormatter(content.date_created) }}
        </div>
      </div>
      <div>阅读约 {{ useArticleMetrics(content.body) }}</div>
    </div>

    <Suspense>
      <template #default>
        <MDC
          :value="content.body"
          class="prose dark:prose-invert mdc-prose" />
      </template>
      <template #fallback>
        <div class="flex justify-center items-center text-neutral-500 space-x-2 h-42 animate-pulse">
          <UIcon
            name="hugeicons:ai-content-generator-01"
            class="size-6" />
          <div class="text-sm">正在渲染，请稍等。</div>
        </div>
      </template>
    </Suspense>

    <div class="flex justify-between items-center select-none">
      <SharedLikeButton
        :content-id="content.id"
        :icon-size="20" />
      <div class="flex items-center space-x-6">
        <UIcon
          name="hugeicons:share-05"
          class="size-5 text-neutral-400 cursor-pointer"
          @click="shareButton(content.title, getPreviewText(content.body))" />
        <SharedBookmarkButton
          :content-id="content.id"
          :icon-size="20" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { isClient } from "@vueuse/shared";
import type { Contents } from "~/types";

const toast = useToast();

defineProps<{
  content: Contents.Item;
}>();

const { share, isSupported } = useShare();

const shareButton = (title: string, text: string) => {
  if (isSupported) {
    return share({
      title: title,
      text: text,
      url: isClient ? location.href : "",
    }).catch((err) => err);
  } else {
    toast.add({
      title: "分享通知",
      description: "当前浏览器不支持分享功能。",
      icon: "hugeicons:share-05",
      color: "warning",
    });
  }
};

// 添加预览文本处理函数
const getPreviewText = (text: string) => {
  const maxLength = 50; // 设置预览文本的最大长度
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

// 创建一个异步组件包装器，仅测试加载效果
// const MDC = defineAsyncComponent(async () => {
// 添加延迟用于测试
//   await new Promise((resolve) => setTimeout(resolve, 300000));
//   return import("~/app.vue");
// });
</script>
