<template>
  <div class="container select-none">
    <!-- 新内容提示 -->
    <div class="flex justify-center duration-500 ease-in-out transition-all"
      :class="newContentCount > 0 ? 'translate-y-2.5 opacity-100' : '-translate-y-8 opacity-0 -mb-8'">
      <UButton color="primary" variant="solid" @click="handleLoadNewContent">
        <UIcon name="hugeicons:sparkles" class="mr-1 size-5" />
        发现
        <SharedAnimateNumber :value="newContentCount" class="font-bold" />
        条新内容
      </UButton>
    </div>

    <div v-if="isLoading && !contents?.length" class="fixed inset-0 flex justify-center items-center">
      <UIcon name="svg-spinners:ring-resize" class="size-7 text-neutral-400 dark:text-orange-200" />
    </div>
    <div v-else-if="error" class="flex items-center justify-center min-h-[50vh]">
      <UAlert color="error" variant="soft" icon="hugeicons:alert-02" :description="error?.message || '加载失败，请稍后重试'">
      </UAlert>
    </div>
    <template v-else>
      <div ref="el" class="my-2">
        <SharedFadeIn v-for="(content, index) in contents" :key="content.id" :delay="index * 50" class="py-3"
          enter-active-class="transition-all duration-500 ease-in-out"
          enter-from-class="transform translate-y-3 opacity-0" enter-to-class="transform translate-y-0 opacity-100">
          <ContentCard :content="content" />
        </SharedFadeIn>
      </div>
      <div v-if="contents?.length === 0"
        class="flex flex-col items-center justify-center space-y-4 min-h-[calc(100vh-14rem)] pt-16">
        <UIcon name="hugeicons:ai-content-generator-01" class="text-4xl text-neutral-300 dark:text-neutral-700" />
        <p class="text-neutral-300 dark:text-neutral-700 text-sm font-medium">信息矩阵仍处待填充态</p>
      </div>

      <!-- 加载更多按钮 -->
      <div class="flex justify-center pb-4" v-if="hasMore && isNearBottom">
        <UButton @click="loadMore" color="neutral" :disabled="isFetchingNextPage" :loading="isFetchingNextPage">
          加载更多
        </UButton>
      </div>

      <!-- 没有更多内容的提示 -->
      <div v-if="!hasMore && contents && contents.length > 0"
        class="text-center text-sm text-neutral-300 dark:text-neutral-700 pb-4">
        已显示全部内容
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const ContentCard = defineAsyncComponent(() => import("~/components/content/ContentCard.vue"));

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

const {
  public: { directusDefaultPageSize },
} = useRuntimeConfig();

// 分页相关状态
const page = ref(1);
const limit = Number(directusDefaultPageSize);
const hasMore = ref(true);
const isFetchingNextPage = ref(false);
const el = ref<HTMLElement | null>(null);
// 从布局接收滚动状态
const { isNearBottom } = inject('scrollState', { isNearBottom: ref(false) });

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

// 新内容计数
const newContentCount = ref(0);

// 处理加载新内容
async function handleLoadNewContent() {
  page.value = 1;
  hasMore.value = true;
  newContentCount.value = 0;
  await refresh();
}

onMounted(() => {
  subscribeContents(
    {
      fields: [...CONTENT_FIELDS],
    },
    async (event) => {
      if (event.event === "create") {
        newContentCount.value++;
      } else if (["update", "delete"].includes(event.event)) {
        page.value = 1;
        hasMore.value = true;
        await refresh();
      }
    }
  );
});

useSeo({
  site_name: "探索",
  site_description: "",
  seo_keywords: "",
  maintenance_mode: false,
  donate_images: [],
});
</script>