<template>
  <div class="container select-none">
    <div v-if="isLoading && !contents?.length">
      <LoadersHomePageSkeleton />
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
    <template v-else>
      <SharedFadeIn
        v-for="(content, index) in contents"
        :key="content.id"
        :delay="index * 100">
        <ContentCard :content="content" />
      </SharedFadeIn>
      <div v-if="contents?.length === 0">暂无内容</div>

      <!-- 加载更多的骨架屏 -->
      <div v-if="isFetchingNextPage">
        <LoadersHomePageSkeleton />
      </div>

      <!-- 没有更多内容的提示 -->
      <div
        v-if="!hasMore && contents && contents.length > 0"
        class="text-center text-sm text-neutral-700 py-4">
        已显示全部内容
      </div>

      <!-- 无限滚动触发元素 -->
      <div
        ref="loadMoreTrigger"
        class="h-4"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { getContents, subscribeContents } = useContents();

const CONTENT_FIELDS = [
  "id",
  "title",
  "body",
  "content_type_id.*",
  "images.*",
  "allow_comments",
  "user_created.*",
  "date_created",
] as const;

// 分页相关状态
const page = ref(1);
const limit = 5;
const hasMore = ref(true);
const isFetchingNextPage = ref(false);
const loadMoreTrigger = ref<HTMLElement | null>(null);

const {
  data: contents,
  refresh,
  status,
  error,
} = await useLazyAsyncData("contents", () =>
  getContents({
    fields: [...CONTENT_FIELDS],
    sort: ["-date_created"],
    filter: {
      status: { _eq: "published" },
    },
    limit,
    page: 1,
  })
);

const isLoading = computed(() => status.value === "pending");

// 加载下一页数据
async function loadMore() {
  if (!hasMore.value || isFetchingNextPage.value) return;

  isFetchingNextPage.value = true;
  try {
    const nextPage = page.value + 1;
    const newContents = await getContents({
      fields: [...CONTENT_FIELDS],
      sort: ["-date_created"],
      filter: {
        status: { _eq: "published" },
      },
      limit,
      page: nextPage,
    });

    if (!newContents) {
      hasMore.value = false;
      return;
    }

    if (newContents.length < limit) {
      hasMore.value = false;
    }

    contents.value = [...(contents.value || []), ...newContents];
    page.value = nextPage;
  } catch (err) {
    console.error("Failed to load more contents:", err);
  } finally {
    isFetchingNextPage.value = false;
  }
}

// 设置无限滚动
useInfiniteScroll(loadMoreTrigger, loadMore, { distance: 10 });

onMounted(() => {
  subscribeContents(
    {
      fields: [...CONTENT_FIELDS],
    },
    async (event) => {
      if (["create", "update", "delete"].includes(event.event)) {
        page.value = 1;
        hasMore.value = true;
        await refresh();
      }
    }
  );
});
</script>
