<template>
  <div class="select-none py-8">
    <div v-if="isLoading && !bookmarks" class="fixed inset-0 flex justify-center items-center">
      <UIcon name="svg-spinners:ring-resize" class="size-7 text-primary-500" />
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-[50vh]">
      <UAlert color="error" variant="soft" icon="hugeicons:alert-02" :description="error?.message || '加载失败，请稍后重试'" />
    </div>

    <div v-else-if="bookmarks?.length === 0"
      class="flex flex-col items-center justify-center space-y-4 min-h-[calc(100vh-14rem)]">
      <UIcon name="hugeicons:bookmark-block-02" class="text-4xl text-neutral-300 dark:text-neutral-700" />
      <p class="text-neutral-300 dark:text-neutral-700 text-sm font-medium">收藏夹当前为空置状态</p>
    </div>

    <div v-else class="space-y-4">
      <div class="flex items-center justify-center gap-2 text-neutral-500 animate-pulse">
        <UIcon name="hugeicons:swipe-left-09" class="size-5" />
        <span class="text-sm font-medium">向左滑动可删除收藏</span>
      </div>

      <div v-for="(bookmark, index) in bookmarks" :key="bookmark.id"
        class="relative overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
        @touchstart="handleDragStart($event, index)" @touchmove="handleDragMove($event, index)"
        @touchend="handleDragEnd(index)" @touchcancel="handleDragEnd(index)"
        @mousedown.prevent="handleDragStart($event, index)" @mousemove.prevent="handleDragMove($event, index)"
        @mouseup="handleDragEnd(index)" @mouseleave="handleDragEnd(index)">
        <div class="relative transform transition-transform duration-200 ease-out"
          :style="{ transform: `translateX(${offsets[index] || 0}px)` }">
          <UCard variant="soft" class="relative">
            <div class="flex items-center space-x-3">
              <SharedAvatar :src="bookmark.user_created.avatar" :alt="bookmark.user_created.first_name" size="sm" />
              <div class="flex-1 min-w-0">
                <NuxtLink :to="{ name: 'article-id', params: { id: getContentId(bookmark.content_id) } }"
                  @click.stop="handleLinkClick(index, $event)">
                  <div class="text-[15px] font-medium line-clamp-1">
                    {{ getContentTitle(bookmark.content_id) }}
                  </div>
                </NuxtLink>
                <div class="text-xs text-neutral-500 mt-0.5">
                  {{ useDateFormatter(bookmark.date_created) }}收藏
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <div class="absolute top-0 right-0 h-full">
          <button
            class="bg-red-500 h-full px-6 rounded-lg flex items-center justify-center cursor-pointer text-white transition-all duration-200 ease-out origin-right"
            :style="{
              opacity: Math.min(Math.abs(offsets[index] || 0) / 75, 1),
              transform: `translateX(${75 - Math.abs(offsets[index] || 0)}px)`
            }" @click.stop="() => handleDelete(bookmark, index)">
            <UIcon v-if="!processingIds.includes(bookmark.id)" name="hugeicons:bookmark-minus-02" class="size-5" />
            <UIcon v-else name="svg-spinners:ring-resize" class="size-5" />
          </button>
        </div>
      </div>
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
const processingIds = ref<string[]>([]);
const offsets = ref<number[]>([]);
const dragStartX = ref<number[]>([]);
const isDragging = ref<boolean[]>([]);
const currentOpenIndex = ref<number | null>(null);
const dragThreshold = 10; // 新增：滑动阈值，单位 px
const hasMoved = ref<boolean[]>([]); // 新增：记录每个 item 是否发生过滑动

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

const getEventX = (event: MouseEvent | TouchEvent): number => {
  if (event instanceof MouseEvent) {
    return event.clientX;
  }
  return event.touches?.[0]?.clientX ?? 0;
};

const handleDragStart = (event: MouseEvent | TouchEvent, index: number) => {
  // 不再在这里 preventDefault
  if (currentOpenIndex.value !== null && currentOpenIndex.value !== index) {
    offsets.value[currentOpenIndex.value] = 0;
  }
  isDragging.value[index] = true;
  dragStartX.value[index] = getEventX(event);
  offsets.value[index] = offsets.value[index] || 0;
  hasMoved.value[index] = false; // 新增
};

const handleDragMove = (event: MouseEvent | TouchEvent, index: number) => {
  if (!isDragging.value[index]) return;

  const currentX = getEventX(event);
  const diff = currentX - (dragStartX.value[index] ?? 0);

  // 新增：只有横向滑动超过阈值才 preventDefault
  if (event.type === 'touchmove' && Math.abs(diff) > dragThreshold) {
    event.preventDefault();
    hasMoved.value[index] = true;
  }

  let newOffset = diff;
  if (currentOpenIndex.value === index) {
    newOffset = Math.max(Math.min(diff - 75, 0), -75);
  } else {
    newOffset = Math.max(Math.min(diff, 0), -75);
  }
  offsets.value[index] = newOffset;
};

const handleDragEnd = (index: number) => {
  if (!isDragging.value[index]) return;

  const offset = offsets.value[index];
  const isOpen = Math.abs(offset || 0) > 35;
  offsets.value[index] = isOpen ? -75 : 0;
  currentOpenIndex.value = isOpen ? index : null;
  isDragging.value[index] = false;
};

const handleDelete = async (bookmark: Bookmarks.Item, index: number) => {
  if (Math.abs(offsets.value[index] || 0) < 35) return;
  if (processingIds.value.includes(bookmark.id)) return;

  try {
    processingIds.value.push(bookmark.id);
    await deleteBookmark(bookmark.id);
    await refresh();
    offsets.value[index] = 0;
    currentOpenIndex.value = null;
  } catch (error) {
    console.error("Failed to remove bookmark:", error);
  } finally {
    processingIds.value = processingIds.value.filter((id) => id !== bookmark.id);
  }
};

const handleLinkClick = (index: number, event: MouseEvent | TouchEvent) => {
  // 新增：判断 hasMoved，只有未滑动才允许点击
  if (isDragging.value[index] || hasMoved.value[index] || Math.abs(offsets.value[index] || 0) > 5) {
    event.preventDefault();
    return;
  }
  event.stopPropagation();
  navigateTo({
    name: 'article-id',
    params: {
      id: getContentId(bookmarks.value?.[index]?.content_id ?? '')
    }
  });
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
  } catch (error) {
    console.error("Failed to setup subscription:", error);
  }
};

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    // 先取消现有订阅
    if (unsubscribe.value) {
      unsubscribe.value();
      unsubscribe.value = null;
    }
    // 重新获取数据并建立订阅
    refresh();
    setupSubscription();
  } else {
    // 页面不可见时清理订阅
    if (unsubscribe.value) {
      unsubscribe.value();
      unsubscribe.value = null;
    }
  }
};

onMounted(async () => {
  await refresh();
  await setupSubscription();
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  if (unsubscribe.value) unsubscribe.value();
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

onBeforeRouteLeave(() => {
  if (bookmarks.value) {
    offsets.value = new Array(bookmarks.value.length).fill(0);
    currentOpenIndex.value = null;
  }
});

watch(bookmarks, () => {
  if (bookmarks.value) {
    const length = bookmarks.value.length;
    offsets.value = new Array(length).fill(0);
    dragStartX.value = new Array(length).fill(0);
    isDragging.value = new Array(length).fill(false);
    hasMoved.value = new Array(length).fill(false); // 新增
    currentOpenIndex.value = null;
  }
}, { immediate: true });

watch(user, () => {
  if (user.value?.id) {
    refresh();
    setupSubscription();
  } else {
    bookmarks.value = [];
  }
});

useSeo({
  site_name: "我的收藏",
  site_description: '',
  seo_keywords: '',
  maintenance_mode: false,
  noindex: true,
  donate_images: [],
});
</script>