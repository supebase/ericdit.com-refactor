<template>
  <div v-if="loading && bookmarksCount === null">
    <UIcon name="svg-spinners:3-dots-scale" class="size-5 text-neutral-500 dark:text-orange-200" />
  </div>
  <div v-else class="select-none">
    <UChip :color="bookmarksCount ? 'primary' : 'neutral'"
      :ui="{ base: 'py-[7px] px-[5px] font-bold' }"
      :show="bookmarksCount !== null && bookmarksCount > 0" :text="bookmarksCount ?? undefined">
      <NuxtLink to="/collections">
        <UIcon name="hugeicons:bookmark-02" class="size-5 text-neutral-500 hover:text-primary-500"
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

const unsubscribe = ref<null | (() => void)>(null);

const setupSubscription = async () => {
  try {
    if (unsubscribe.value) {
      unsubscribe.value();
      unsubscribe.value = null;
    }
    if (!user.value?.id) return;

    unsubscribe.value = await subscribeBookmarks(
      {
        fields: ["id"],
        filter: {
          user_created: { _eq: user.value.id },
        },
      },
      async (event) => {
        if (["create", "delete"].includes(event.event)) {
          await fetchBookmarksCount();
        }
      }
    );
  } catch (error) {
    console.error("Failed to setup subscription:", error);
  }
};

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    // 添加延迟确保页面完全激活
    setTimeout(() => {
      fetchBookmarksCount();
      setupSubscription();
    }, 300);
  } else {
    // 页面不可见时清理订阅
    if (unsubscribe.value) {
      unsubscribe.value();
      unsubscribe.value = null;
    }
  }
};

onMounted(async () => {
  await fetchBookmarksCount();
  setupSubscription();
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  if (unsubscribe.value) unsubscribe.value();
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

watch(() => user.value?.id, () => {
  fetchBookmarksCount();
  setupSubscription();
});
</script>

