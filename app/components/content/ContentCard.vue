<template>
  <UCard
    :ui="{
      root: 'bg-white dark:bg-neutral-900 divide-none',
      body: '!p-0',
      footer: '!p-0',
    }"
    variant="soft"
    class="select-none first:pt-0 last:pb-0">
    <NuxtLink :to="{ name: 'article-id', params: { id: content.id } }">
      <!-- 非单图模式的标题显示 -->
      <div
        v-if="displayType !== 'single' && displayType === 'text'"
        class="flex items-center space-x-2 mb-1">
        <div class="font-bold text-lg">{{ content.title }}</div>
      </div>

      <!-- 单图显示 -->
      <div
        v-if="displayType === 'single'"
        class="relative">
        <div
          v-if="singleImageLoading"
          class="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <UIcon
            name="hugeicons:image-03"
            class="size-7 text-neutral-400 dark:text-neutral-600 animate-pulse" />
        </div>
        <img
          :src="useAssets(content.images[0].directus_files_id) || undefined"
          @load="onImageLoad('single')"
          class="aspect-[calc(4*3+1)/8] object-cover w-full rounded-lg" />
        <div class="absolute top-4 right-4">
          <UBadge
            variant="soft"
            color="neutral"
            class="nums tabular-nums">
            {{ useDateFormatter(content.date_created) }}
          </UBadge>
        </div>
        <div
          class="absolute bottom-0 left-0 right-0 p-3 m-2 bg-neutral-300/40 dark:bg-black/30 backdrop-blur-sm rounded-lg">
          <div class="text-base text-white text-center font-bold line-clamp-1">
            {{ content.title }}
          </div>
        </div>
      </div>

      <!-- 文本内容显示 -->
      <div
        v-else-if="displayType === 'text'"
        class="line-clamp-4 text-[15px] text-neutral-700 dark:text-neutral-300">
        <div class="flex items-center space-x-2 text-sm text-neutral-500 nums tabular-nums mb-1">
          <div>{{ useDateFormatter(content.date_created) }}</div>
          <div>{{ useArticleMetrics(content.body) }}</div>
        </div>
        {{ cleanBody }}
      </div>

      <!-- 图库轮播显示 -->
      <div v-else>
        <UCarousel
          v-slot="{ item, index }: { item: { directus_files_id: string }, index: number }"
          autoplay
          class-names
          wheel-gestures
          :items="content.images"
          :ui="{
            item: 'basis-[80%] transition-all duration-500 [&:not(.is-snapped)]:opacity-30 [&:not(.is-snapped)]:scale-95 [&:not(.is-snapped)]:grayscale',
          }"
          class="ml-0.5">
          <div class="relative">
            <div
              v-if="carouselImageLoading"
              class="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <UIcon
                name="hugeicons:image-03"
                class="size-7 text-neutral-400 dark:text-neutral-600 animate-pulse" />
            </div>
            <img
              :src="useAssets(item.directus_files_id) || undefined"
              @load="onImageLoad('carousel')"
              class="aspect-[calc(4*3+1)/8] object-cover rounded-lg" />
            <div
              class="absolute bottom-2 left-2 nums tabular-nums bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              {{ index + 1 }}/{{ content.images.length }}
            </div>
          </div>
        </UCarousel>
      </div>
    </NuxtLink>

    <template #footer>
      <div class="flex justify-between items-center mt-3">
        <SharedCommentCounter
          :content-id="content.id"
          :allow-comments="content.allow_comments"
          :icon-size="18" />
        <SharedLikeButton
          :content-id="content.id"
          :icon-size="20"
          likeType="clap" />
        <SharedBookmarkButton
          :content-id="content.id"
          :icon-size="18" />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { Contents } from "~/types";

const props = defineProps<{
  content: Contents.Item;
}>();

const { cleanMarkdown } = useContents();

// 处理后的文本内容
const cleanBody = computed(() => cleanMarkdown(props.content.body));

// 图片加载状态
const singleImageLoading = ref(true);
const carouselImageLoading = ref(true);

// 计算显示类型
const displayType = computed(() => {
  const { images, content_type_id } = props.content;

  // 如果没有图片，显示文本
  if (!images?.length) return "text";

  // 如果只有一张图片，显示单图
  if (images.length === 1) return "single";

  // 如果是图库类型且有多张图片，显示轮播
  if (content_type_id.name === "pictures" && images.length > 1) return "carousel";

  // 默认显示文本
  return "text";
});

// 图片加载完成处理函数
const onImageLoad = (type: "single" | "carousel") => {
  if (type === "single") {
    singleImageLoading.value = false;
  } else if (type === "carousel") {
    carouselImageLoading.value = false;
  }
};
</script>
