<template>
  <UCard :ui="{
    root: 'bg-white dark:bg-neutral-900 rounded-lg shadow-none border-0',
    body: '!p-0',
    footer: '!p-0',
  }" variant="soft" class="select-none">
    <NuxtLink :to="{ name: 'article-id', params: { id: content.id } }" class="block hover:no-underline">
      <!-- 单图显示 -->
      <div v-if="displayType === 'single'" class="relative overflow-hidden rounded-lg">
        <NuxtImg provider="directus" :src="content.images[0].directus_files_id" loading="eager" fetchpriority="high"
          preload placeholder format="webp" quality="80" sizes="(max-width: 768px) 100vw, 768px"
          class="aspect-[16/7] object-cover w-full transition-transform duration-500" />
        <!-- 标题叠加在图片下方，带模糊背景 -->
        <div class="absolute bottom-0 left-0 w-full px-4 py-2 bg-neutral-900/40 backdrop-blur-sm">
          <div class="font-bold text-white">
            {{ content.title }}
          </div>
        </div>
      </div>
      <!-- 图库轮播显示 -->
      <div v-else class="relative overflow-hidden rounded-lg">
        <UCarousel v-slot="{ item, index }: { item: { directus_files_id: string }, index: number }" autoplay class-names
          wheel-gestures :items="content.images">
          <div class="relative">
            <NuxtImg provider="directus" :src="item.directus_files_id" loading="lazy" placeholder
              class="aspect-[16/7] object-cover w-full rounded-lg transition-transform duration-500" />
            <!-- 当前图片序号/总数 -->
            <UBadge color="neutral" size="sm"
              class="absolute top-3 right-3 text-white nums tabular-nums bg-neutral-900/40 backdrop-blur-sm">
              {{ index + 1 }} / {{ content.images.length }}
            </UBadge>
          </div>
        </UCarousel>
        <!-- 标题叠加在图片下方，带模糊背景 -->
        <div class="absolute bottom-0 left-0 w-full px-4 py-2 rounded-b-lg bg-neutral-900/40 backdrop-blur-sm">
          <div class="font-bold text-white">
            {{ content.title }}
          </div>
        </div>
      </div>
    </NuxtLink>
    <!-- 内容区 -->
    <div class="py-4 bg-white dark:bg-neutral-900 rounded-b-lg">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-1.5">
          <SharedAvatar :src="userAvatarUrl || undefined" size="2xs" :alt="content.user_created.first_name" class="mr-0.5" />
          <span class="text-[15px] font-medium">{{ content.user_created.first_name }}</span>
          <span class="mx-1 text-neutral-400 dark:text-neutral-600">&bull;</span>
          <span class="text-sm text-neutral-500">{{ useDateFormatter(content.date_created) }}</span>
        </div>
        <SharedBookmarkButton :content-id="content.id" :icon-size="18"
          class="text-neutral-300 hover:text-primary-500 transition" />
      </div>
      <NuxtLink :to="{ name: 'article-id', params: { id: content.id } }" class="block hover:no-underline">
        <div class="text-neutral-500 dark:text-neutral-400 line-clamp-3 mb-4">
          {{ cleanBody }}
        </div>
      </NuxtLink>
      <div class="flex justify-between items-center text-sm text-neutral-500">
        <div class="flex gap-10">
          <div class="flex items-center gap-1">
            <SharedLikeButton :content-id="content.id" :icon-size="21" likeType="clap" />
          </div>
          <div class="flex items-center gap-1">
            <SharedCommentCounter :content-id="content.id" :allow-comments="content.allow_comments" :icon-size="18" />
          </div>
          <div class="flex items-center gap-1">
            <SharedContentViews :content-id="content.id" :icon-size="20" />
          </div>
        </div>
        <div>阅读约 {{ useArticleMetrics(content.body) }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Contents } from "~/types";

const props = defineProps<{
  content: Contents.Item;
}>();

const { cleanMarkdown } = useContents();
const { getUserAvatarUrl } = useUserMeta();

const userAvatarUrl = computed(() =>
  getUserAvatarUrl(props.content.user_created.id, props.content.user_created.avatar)
);

// 处理后的文本内容
const cleanBody = computed(() => cleanMarkdown(props.content.body));

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

// 预加载图片
onMounted(() => {
  if (displayType.value === "single" && props.content.images?.[0]) {
    const img = new Image();
    img.src = props.content.images[0].directus_files_id;
  }
});
</script>
