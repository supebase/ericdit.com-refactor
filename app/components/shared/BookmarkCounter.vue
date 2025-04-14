<template>
  <div v-if="loading && bookmarksCount == null">
    <UIcon name="svg-spinners:3-dots-scale" class="size-5 text-neutral-400 dark:text-orange-200" />
  </div>
  <div v-else class="select-none">
    <UChip :color="bookmarksCount ? 'primary' : 'neutral'" :ui="{ base: 'py-2 px-1.5 font-bold' }"
      :show="bookmarksCount !== null && bookmarksCount > 0" :text="bookmarksCount ?? undefined">
      <NuxtLink to="/bookmarks">
        <UIcon name="hugeicons:bookmark-02" class="size-5 text-neutral-600 dark:text-neutral-400"
          :class="{ 'bookmark-animation': showAnimation }" />
      </NuxtLink>
    </UChip>
  </div>
</template>

<script setup lang="ts">
const { getBookmarks, subscribeBookmarks } = useBookmarks();
const { user } = useAuth();
const bookmarksCount = ref<number | null>(null);
const loading = ref(false);
const showAnimation = ref(false);
const previousCount = ref<number | null>(null);

const triggerAnimation = () => {
  showAnimation.value = true;
  setTimeout(() => {
    showAnimation.value = false;
  }, 500);
};

const fetchBookmarksCount = async () => {
  if (!user.value?.id) return;

  try {
    loading.value = true;
    const bookmarks = await getBookmarks({
      fields: ["id"],
      filter: {
        user_created: { _eq: user.value.id },
      },
    });

    // 保存之前的计数
    previousCount.value = bookmarksCount.value;
    bookmarksCount.value = bookmarks.length;

    // 如果计数发生变化且不是初始加载，触发动画
    if (previousCount.value !== null && previousCount.value !== bookmarksCount.value) {
      triggerAnimation();
    }
  } catch (error) {
    console.error("Failed to fetch bookmarks count:", error);
    bookmarksCount.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchBookmarksCount();

  subscribeBookmarks(
    {
      fields: ["id"],
      filter: {
        user_created: { _eq: user.value?.id },
      },
    },
    async (event) => {
      if (["create", "delete"].includes(event.event)) {
        await fetchBookmarksCount();
      }
    }
  );
});

watch(user, () => {
  fetchBookmarksCount();
});
</script>

<style scoped>
.bookmark-animation {
  animation: bookmark-effect 0.5s ease-in-out;
  transform-origin: center;
}

@keyframes bookmark-effect {
  0% {
    transform: scale(1) rotate(0);
  }

  25% {
    transform: scale(1.2) rotate(-15deg);
  }

  50% {
    transform: scale(1.3) rotate(10deg);
  }

  75% {
    transform: scale(1.2) rotate(-5deg);
  }

  100% {
    transform: scale(1) rotate(0);
  }
}
</style>
