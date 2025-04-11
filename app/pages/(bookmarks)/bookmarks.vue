<template>
  <div class="select-none py-8">
    <div
      v-if="isLoading && !bookmarks"
      class="fixed inset-0 flex justify-center items-center">
      <UIcon
        name="svg-spinners:ring-resize"
        class="size-7 text-primary-500" />
    </div>

    <div
      v-else-if="error"
      class="flex items-center justify-center min-h-[50vh]">
      <UAlert
        color="error"
        variant="soft"
        icon="hugeicons:alert-02"
        :description="error?.message || '加载失败，请稍后重试'">
      </UAlert>
    </div>

    <div
      v-else-if="bookmarks?.length === 0"
      class="flex flex-col items-center justify-center space-y-4 min-h-[calc(100vh-14rem)]">
      <UIcon
        name="hugeicons:bookmark-block-02"
        class="text-4xl text-neutral-300 dark:text-neutral-700" />
      <p class="text-neutral-300 dark:text-neutral-700 text-sm font-medium">暂无收藏任何内容</p>
    </div>

    <div
      v-else
      class="space-y-6">
      <UCard
        v-for="bookmark in bookmarks"
        :key="bookmark.id"
        variant="soft"
        class="relative">
        <div class="flex items-center space-x-3">
          <SharedAvatar
            :src="bookmark.user_created.avatar"
            :alt="bookmark.user_created.first_name"
            size="sm" />
          <NuxtLink :to="{ name: 'article-id', params: { id: getContentId(bookmark.content_id) } }">
            <div class="text-base font-medium line-clamp-1">
              {{ getContentTitle(bookmark.content_id) }}
            </div>
            <div class="text-sm text-neutral-500">
              {{ useDateFormatter(bookmark.date_created) }}收藏
            </div>
          </NuxtLink>
        </div>

        <div class="absolute -top-2 -right-2">
          <UButton
            :ui="{ leadingIcon: 'size-4' }"
            icon="hugeicons:cancel-circle"
            color="error"
            variant="soft"
            size="xs"
            class="cursor-pointer rounded-full"
            :loading="processingIds.includes(bookmark.id)"
            :disabled="processingIds.includes(bookmark.id)"
            @click="() => removeBookmark(bookmark)" />
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bookmarks } from "~/types";
import { useDateFormatter } from "~/composables/useDateFormatter";

definePageMeta({
  middleware: ["auth"],
});

const { getBookmarks, deleteBookmark, subscribeBookmarks } = useBookmarks();
const { user } = useAuth();
const processingIds = ref<string[]>([]);

const {
  data: bookmarks,
  refresh,
  status,
  error,
} = await useLazyAsyncData(async () => {
  if (!user.value?.id) return [];

  return getBookmarks({
    fields: ["id", "content_id.*", "user_created.*", "date_created"],
    sort: ["-date_created"],
    filter: {
      user_created: { _eq: user.value.id },
    },
  });
});

const isLoading = computed(() => status.value === "pending");

const getContentId = (contentId: string | { id: string; title: string }): string => {
  return typeof contentId === "string" ? contentId : contentId.id;
};

const getContentTitle = (contentId: string | { id: string; title: string }): string => {
  return typeof contentId === "string" ? "未知标题" : contentId.title;
};

const removeBookmark = async (bookmark: Bookmarks.Item) => {
  if (processingIds.value.includes(bookmark.id)) return;

  try {
    processingIds.value.push(bookmark.id);
    await deleteBookmark(bookmark.id);
    await refresh();
  } catch (error) {
    console.error("Failed to remove bookmark:", error);
  } finally {
    processingIds.value = processingIds.value.filter((id) => id !== bookmark.id);
  }
};

onMounted(() => {
  subscribeBookmarks(
    {
      fields: ["id", "content_id.*", "date_created"],
      filter: {
        user_created: { _eq: user.value?.id },
      },
    },
    async (event) => {
      if (["create", "delete"].includes(event.event)) {
        await refresh();
      }
    }
  );
});

watch(user, () => {
  if (user.value?.id) {
    refresh();
  } else {
    bookmarks.value = [];
  }
});

useSeo({
  title: "我的收藏",
  noindex: true,
});
</script>
