<template>
  <UCard :ui="{ body: '!p-0 border-none', footer: '!px-4' }" variant="soft" class="select-none">
    <!-- 单图显示 -->
    <div v-if="displayType === 'single'" class="relative overflow-hidden rounded-t-md">
      <NuxtLink :aria-label="content.title" @click.prevent="handleLinkClick" class="cursor-pointer">
        <NuxtImg provider="directus" :src="content.images[0].directus_files_id" alt="预览图片" loading="eager"
          fetchpriority="high" preload placeholder format="webp" quality="80" sizes="(max-width: 480px) 100vw, 480px"
          class="aspect-16/7 object-cover w-full" />
        <!-- 标题叠加在图片下方，带模糊背景 -->
        <div class="absolute bottom-0 left-0 w-full px-4 py-3 bg-neutral-900/40 backdrop-blur-sm">
          <div class="font-bold text-white text-shadow-md/30">
            {{ content.title }}
          </div>
        </div>
      </NuxtLink>
    </div>
    <!-- 图库轮播显示（新布局） -->
    <div v-else class="overflow-hidden">
      <NuxtLink :aria-label="content.title" @click.prevent="handleLinkClick" class="cursor-pointer">
        <div class="px-4 pt-4 font-bold">
          {{ content.title }}
        </div>
      </NuxtLink>
      <!-- 作者、名字、时间和收藏 -->
      <div class="flex items-center justify-between px-4 pt-3">
        <div class="flex items-center gap-1.5">
          <SharedAvatar :src="userAvatarUrl || undefined" size="2xs" :alt="content.user_created.first_name"
            class="mr-0.5" />
          <span class="text-[15px] text-neutral-600 dark:text-neutral-400 font-medium">{{
            content.user_created.first_name }}</span>
          <span class="mx-1 text-neutral-300 dark:text-neutral-700 pt-0.5">&bull;</span>
          <span class="text-sm text-neutral-400 dark:text-neutral-600 pt-0.5">{{
            useDateFormatter(content.date_created)
          }}</span>
        </div>
        <div class="text-sm text-neutral-400 dark:text-neutral-600">阅读约 {{ useArticleMetrics(content.body) }}</div>
      </div>
      <!-- 轮播居中 -->
      <div class="relative overflow-hidden py-4">
        <UCarousel v-slot="{ item, index }: { item: any, index: number }" dots autoplay class-names wheel-gestures
          :items="carouselImages" :ui="{
            item: 'basis-[80%] transition-all duration-500 scale-100 [&:not(.is-snapped)]:opacity-10 [&:not(.is-snapped)]:scale-93',
            dots: '-bottom-4',
            dot: 'w-4 h-1 transition-all duration-500'
          }">
          <div class="relative">
            <NuxtLink :aria-label="content.title" @click.prevent="handleLinkClick" class="cursor-pointer">
              <NuxtImg provider="directus" :src="item.directus_files_id" alt="预览图片" preload loading="lazy" placeholder
                class="aspect-16/7 object-cover w-full outline-2 outline-neutral-200 dark:outline-neutral-800 my-1"
                :class="[
                  index === 0 && content.images.length === 1
                    ? 'rounded-md'
                    : index === 0
                      ? 'rounded-tr-md rounded-br-md'
                      : index === content.images.length - 1
                        ? 'rounded-tl-md rounded-bl-md'
                        : 'rounded-md'
                ]" />
            </NuxtLink>
            <!-- 当前图片序号/总数 -->
            <UBadge color="neutral" variant="soft"
              class="absolute top-3 right-3 bg-accented/50 backdrop-blur-sm tabular-nums shadow-xl">
              {{ index + 1 }} / {{ content.images.length }}
            </UBadge>
          </div>
        </UCarousel>
      </div>
    </div>
    <!-- 内容区 -->
    <template #footer>
      <div class="flex items-center justify-between mb-3" v-if="displayType === 'single'">
        <div class="flex items-center gap-1.5">
          <SharedAvatar :src="userAvatarUrl || undefined" size="2xs" :alt="content.user_created.first_name"
            class="mr-0.5" />
          <span class="text-[15px] text-neutral-600 dark:text-neutral-400 font-medium">{{
            content.user_created.first_name }}</span>
          <span class="mx-1 text-neutral-300 dark:text-neutral-700 pt-0.5">&bull;</span>
          <span class="text-sm text-neutral-400 dark:text-neutral-600 pt-0.5">{{
            useDateFormatter(content.date_created)
            }}</span>
        </div>
        <div class="text-sm text-neutral-400 dark:text-neutral-600">阅读约 {{ useArticleMetrics(content.body) }}</div>
      </div>
      <NuxtLink v-if="displayType === 'single'" :aria-label="content.title" @click.prevent="handleLinkClick"
        class="block hover:no-underline cursor-pointer">
        <div class="text-neutral-500 dark:text-neutral-400 line-clamp-3 mb-4">
          {{ cleanBody }}
        </div>
      </NuxtLink>
      <div class="flex justify-between items-center text-neutral-400 dark:text-neutral-600">
        <div class="flex gap-10">
          <div class="flex items-center gap-1">
            <SharedLikeButton :content-id="content.id" :icon-size="21" likeType="clap" />
          </div>
          <div class="flex items-center gap-1">
            <SharedCommentCounter :content-id="content.id" :allow-comments="content.allow_comments" :icon-size="18" />
          </div>
          <div class="flex items-center gap-1">
            <SharedContentViews :content-id="content.id" :icon-size="19" />
          </div>
        </div>
        <SharedBookmarkButton :content-id="content.id" :icon-size="19" />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { ContentItem } from "~/types";

const props = defineProps<{
  content: ContentItem;
}>();

const { cleanMarkdown } = useContents();
const { getUserAvatarUrl } = useUserMeta();

const handleLinkClick = () => {
  const scrollContainer = document.querySelector(".overflow-y-auto");
  if (scrollContainer) {
    sessionStorage.setItem(
      "homeScrollPosition",
      JSON.stringify({
        top: scrollContainer.scrollTop,
        left: scrollContainer.scrollLeft,
      })
    );
  }
  // Manually navigate
  navigateTo({ name: 'article-id', params: { id: props.content.id } });
};

const userAvatarUrl = computed(() =>
  getUserAvatarUrl(props.content.user_created.id, props.content.user_created.avatar)
);

// 处理后的文本内容
const cleanBody = computed(() => cleanMarkdown(props.content.body));

// 计算显示类型（简化）
const displayType = computed(() =>
  props.content.images?.length === 1 ? "single" : "carousel"
);

// 过滤有效图片
const carouselImages = computed(() =>
  (props.content.images ?? []).filter(
    (img): img is { directus_files_id: string } =>
      !!img && typeof img.directus_files_id === "string"
  )
);

// 预加载图片
watch(
  () => [displayType.value, props.content.images?.[0]?.directus_files_id],
  ([type, imgSrc]) => {
    if (type === "single" && imgSrc) {
      const img = new window.Image();
      img.src = imgSrc;
    }
  },
  { immediate: true }
);
</script>
