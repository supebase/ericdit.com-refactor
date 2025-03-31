<template>
  <div class="select-none">
    <div class="flex items-center my-6">
      <USeparator>
        <div class="text-neutral-600 text-sm nums tabular-nums">我的收藏</div>
      </USeparator>
    </div>

    <div
      v-if="loading"
      class="fixed inset-0 flex justify-center items-center">
      <UIcon
        name="svg-spinners:ring-resize"
        class="size-7 text-primary-500" />
    </div>

    <div
      v-else-if="bookmarks.length === 0"
      class="flex flex-col items-center justify-center py-12 space-y-4">
      <UIcon
        name="hugeicons:bookmark-off-02"
        class="text-4xl text-neutral-600" />
      <p class="text-neutral-600 text-sm">暂无收藏内容</p>
    </div>

    <div
      v-else
      class="space-y-6">
      <UCard
        v-for="bookmark in bookmarks"
        :key="bookmark.id">
        <NuxtLink
          :to="{ name: 'article-id', params: { id: getContentId(bookmark.content_id) } }"
          class="block mb-2">
          <h2 class="text-sm font-medium">
            {{ getContentTitle(bookmark.content_id) }}
          </h2>
        </NuxtLink>

        <div class="flex items-center justify-between">
          <div class="text-xs text-neutral-500">
            {{ useDateFormatter(bookmark.date_created) }}收藏
          </div>
          <UButton
            :ui="{ leadingIcon: 'size-4' }"
            icon="hugeicons:bookmark-remove-02"
            color="neutral"
            variant="link"
            size="xs"
            class="cursor-pointer size-4"
            :loading="isProcessing"
            :disabled="isProcessing"
            @click="() => removeBookmark(bookmark)" />
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bookmarks } from "~/types";

definePageMeta({
  middleware: ["auth"],
});

const { getBookmarks, deleteBookmark, subscribeBookmarks } = useBookmarks();
const { user } = useAuth();
const bookmarks = ref<Bookmarks.Item[]>([]);
const loading = ref(true);
const isProcessing = ref(false);

const fetchBookmarks = async () => {
  if (!user.value?.id) return;

  try {
    loading.value = true;
    const response = await getBookmarks({
      fields: ["id", "content_id.*", "date_created"],
      sort: ["-date_created"],
      filter: {
        user_created: { _eq: user.value.id },
      },
    });
    bookmarks.value = response;
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
  } finally {
    loading.value = false;
  }
};

const getContentId = (contentId: string | { id: string; title: string }): string => {
  return typeof contentId === "string" ? contentId : contentId.id;
};

const getContentTitle = (contentId: string | { id: string; title: string }): string => {
  return typeof contentId === "string" ? "未知标题" : contentId.title;
};

const removeBookmark = async (bookmark: Bookmarks.Item) => {
  if (isProcessing.value) return;

  try {
    isProcessing.value = true;
    await deleteBookmark(bookmark.id);
    bookmarks.value = bookmarks.value.filter((b) => b.id !== bookmark.id);
  } catch (error) {
    console.error("Failed to remove bookmark:", error);
  } finally {
    isProcessing.value = false;
  }
};

onMounted(async () => {
  await fetchBookmarks();

  subscribeBookmarks(
    {
      fields: ["id", "content_id.*", "date_created"],
      filter: {
        user_created: { _eq: user.value?.id },
      },
    },
    async (event) => {
      if (["create", "delete"].includes(event.event)) {
        await fetchBookmarks();
      }
    }
  );
});

watch(user, () => {
  if (user.value?.id) {
    fetchBookmarks();
  } else {
    bookmarks.value = [];
  }
});
</script>
