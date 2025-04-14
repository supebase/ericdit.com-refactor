<template>
  <UCard :ui="{
    root: 'bg-white dark:bg-neutral-900 divide-none',
    body: '!p-0',
    footer: '!p-0',
  }" variant="soft" class="select-none first:pt-0 last:pb-0">
    <NuxtLink :to="{ name: 'article-id', params: { id: content.id } }">
      <!-- 非单图模式的标题显示 -->
      <div v-if="displayType !== 'single' && displayType === 'text'" class="flex items-center space-x-2 mb-3">
        <div class="font-bold text-lg">
          {{ content.title }}
        </div>
      </div>

      <!-- 单图显示 -->
      <div v-if="displayType === 'single'" class="group relative overflow-hidden rounded-xl">
        <div v-if="singleImageLoading"
          class="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
          <UIcon name="hugeicons:image-03" class="size-7 text-neutral-400 dark:text-neutral-600 animate-pulse" />
        </div>
        <NuxtImg provider="directus" :src="content.images[0].directus_files_id" @load="onImageLoad('single')"
          loading="eager" fetchpriority="high" preload placeholder format="webp" quality="80"
          sizes="(max-width: 768px) 100vw, 768px"
          class="aspect-[16/9] object-cover w-full transform group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute top-4 right-4">
          <UBadge variant="soft" color="neutral" class="nums tabular-nums shadow-lg">
            {{ useDateFormatter(content.date_created) }}
          </UBadge>
        </div>
        <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-black/10 backdrop-blur-sm">
          <div class="text-base text-white font-bold mb-2">
            {{ content.title }}
          </div>
          <div class="text-sm text-neutral-200 line-clamp-1">
            {{ cleanBody }}
          </div>
        </div>
      </div>

      <!-- 文本内容显示 -->
      <div v-else-if="displayType === 'text'" class="group">
        <div class="flex justify-between items-center space-x-3 text-sm mb-2">
          <UBadge variant="soft" color="neutral" class="nums tabular-nums">
            {{ useDateFormatter(content.date_created) }}
          </UBadge>
          <div class="text-neutral-500">
            阅读约 {{ useArticleMetrics(content.body) }}
          </div>
        </div>
        <div class="prose prose-neutral dark:prose-invert max-w-none">
          <div class="line-clamp-3 text-base leading-relaxed">
            {{ cleanBody }}
          </div>
        </div>
      </div>

      <!-- 图库轮播显示 -->
      <div v-else class="relative group">
        <UCarousel v-slot="{ item }: { item: { directus_files_id: string }, index: number }" autoplay class-names
          wheel-gestures :items="content.images" :ui="{
            item: 'basis-[80%] transition-all duration-500 [&:not(.is-snapped)]:opacity-40 [&:not(.is-snapped)]:scale-90 [&:not(.is-snapped)]:grayscale hover:cursor-grab active:cursor-grabbing',
          }">
          <div class="relative overflow-hidden rounded-xl">
            <div v-if="carouselImageLoading"
              class="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
              <UIcon name="hugeicons:image-03" class="size-7 text-neutral-400 dark:text-neutral-600 animate-pulse" />
            </div>
            <NuxtImg provider="directus" :src="item.directus_files_id" @load="onImageLoad('carousel')" loading="lazy"
              class="aspect-[16/9] object-cover w-full transform hover:scale-105 transition-transform duration-500" />
          </div>
        </UCarousel>
      </div>
    </NuxtLink>

    <template #footer>
      <div class="flex justify-between items-center mt-4 px-1">
        <SharedCommentCounter :content-id="content.id" :allow-comments="content.allow_comments" :icon-size="18" />
        <SharedLikeButton :content-id="content.id" :icon-size="20" likeType="clap" />
        <SharedBookmarkButton :content-id="content.id" :icon-size="18" />
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

// 预加载图片
onMounted(() => {
  if (displayType.value === "single" && props.content.images?.[0]) {
    const img = new Image();
    img.src = props.content.images[0].directus_files_id;
  }
});
</script>
