<template>
  <div class="p-4 bg-white/50 dark:bg-neutral-800/50 rounded-md">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-1.5">
        <SharedAvatar
          :src="userAvatarUrl || undefined"
          size="sm"
          :alt="talk.user_created.first_name"
          class="mr-0.5" />
        <span class="text-[15px] text-neutral-600 dark:text-neutral-400 font-medium">{{
          talk.user_created.first_name
        }}</span>
        <span class="mx-1 text-neutral-300 dark:text-neutral-700 pt-0.5">&bull;</span>
        <div class="text-sm text-neutral-400 dark:text-neutral-600">
          阅读约 {{ useArticleMetrics(talk.body) }}
        </div>
      </div>
      <SharedBookmarkButton
        :content-id="talk.id"
        :icon-size="19" />
    </div>
    <NuxtLink
      :aria-label="talk.title"
      @click.prevent="handleLinkClick"
      class="block hover:no-underline cursor-pointer">
      <div class="text-neutral-500 dark:text-neutral-400 line-clamp-3 mb-4">
        {{ cleanBody }}
      </div>
    </NuxtLink>
    <div class="flex justify-between items-center text-neutral-400 dark:text-neutral-600">
      <span class="text-sm text-neutral-400 dark:text-neutral-600 pt-0.5">{{
        useDateFormatter(talk.date_created)
      }}</span>
      <div class="flex gap-10">
        <div class="flex items-center gap-1">
          <SharedLikeButton
            :content-id="talk.id"
            :icon-size="21"
            likeType="clap" />
        </div>
        <div class="flex items-center gap-1">
          <SharedCommentCounter
            :content-id="talk.id"
            :allow-comments="talk.allow_comments"
            :icon-size="18" />
        </div>
        <div class="flex items-center gap-1">
          <SharedContentViews
            :content-id="talk.id"
            :icon-size="19" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContentItem } from "~/types";

const props = defineProps<{
  talk: ContentItem;
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
  navigateTo({ name: "article-id", params: { id: props.talk.id } });
};

const userAvatarUrl = computed(() =>
  getUserAvatarUrl(props.talk.user_created.id, props.talk.user_created.avatar)
);

// 处理后的文本内容
const cleanBody = computed(() => cleanMarkdown(props.talk.body));
</script>
