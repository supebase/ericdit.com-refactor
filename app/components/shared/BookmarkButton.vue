<template>
  <div class="flex justify-end items-center">
    <button @click="handleBookmark" :disabled="isProcessing"
      class="text-sm flex items-center space-x-2 text-neutral-500 cursor-pointer disabled:cursor-not-allowed">
      <UIcon name="svg-spinners:ring-resize" :size="iconSize" class="text-neutral-500" v-if="isProcessing" />
      <UIcon v-else :name="isBookmarked ? 'hugeicons:bookmark-check-02' : 'hugeicons:bookmark-add-02'" :size="iconSize"
        :class="[
          { 'bookmark-animation': showAnimation },
          isBookmarked ? 'text-neutral-700 dark:text-neutral-300' : ''
        ]" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  contentId: string;
  iconSize?: number;
}>();

const { guardAction } = useAuthGuard();
const { isAuthenticated } = useAuth();
const { getBookmarks, deleteBookmark, addBookmarkIfNotExists, subscribeBookmarks } = useBookmarks();

const isBookmarked = ref(false);
const currentBookmarkId = ref<string | null>(null);
const isProcessing = ref(false);

const fetchBookmarkStatus = async () => {
  try {
    const bookmarks = await getBookmarks({
      fields: ["id", "user_created.id"],
      filter: {
        content_id: { _eq: props.contentId },
      },
    });

    const currentUserId = useAuth().user.value?.id;
    const userBookmark = bookmarks.find((bookmark) => bookmark.user_created?.id === currentUserId);

    isBookmarked.value = false;
    currentBookmarkId.value = null;

    if (userBookmark) {
      isBookmarked.value = true;
      currentBookmarkId.value = userBookmark.id;
    }
  } catch (error) {
    console.error("Failed to fetch bookmark status:", error);
  }
};

const showAnimation = ref(false);

const handleBookmarkAction = async () => {
  if (isProcessing.value) return;

  try {
    isProcessing.value = true;
    if (isBookmarked.value && currentBookmarkId.value) {
      await deleteBookmark(currentBookmarkId.value);
      isBookmarked.value = false;
      currentBookmarkId.value = null;
    } else {
      const newBookmark = await addBookmarkIfNotExists(props.contentId);
      isBookmarked.value = true;
      currentBookmarkId.value = newBookmark.id;
      showAnimation.value = true;
      setTimeout(() => {
        showAnimation.value = false;
      }, 500);
    }
  } catch (error) {
    console.error("Failed to toggle bookmark:", error);
  } finally {
    isProcessing.value = false;
  }
};

const handleBookmark = () => {
  guardAction(() => handleBookmarkAction(), "登录后即可将内容添加到收藏夹");
};

onMounted(async () => {
  subscribeBookmarks(
    {
      fields: ["id", "user_created.id"],
    },
    async (event) => {
      if (["create", "delete"].includes(event.event)) {
        await fetchBookmarkStatus();
      }
    }
  );

  await fetchBookmarkStatus();
});

watch(isAuthenticated, (newValue) => {
  if (!newValue) {
    isBookmarked.value = false;
    currentBookmarkId.value = null;
  } else {
    fetchBookmarkStatus();
  }
});
</script>

<style scoped>
.bookmark-animation {
  animation: bookmark-effect 0.5s ease-in-out;
  transform-origin: top center;
}

@keyframes bookmark-effect {
  0% {
    transform: translateY(0) scale(1) rotate(0);
  }

  25% {
    transform: translateY(-4px) scale(1.1) rotate(-15deg);
  }

  50% {
    transform: translateY(-2px) scale(1.2) rotate(10deg);
  }

  75% {
    transform: translateY(-1px) scale(1.1) rotate(-5deg);
  }

  100% {
    transform: translateY(0) scale(1) rotate(0);
  }
}
</style>
