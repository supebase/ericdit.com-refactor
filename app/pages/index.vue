<template>
  <div class="container select-none">
    <div v-if="isLoading && !contents?.length" class="flex flex-col justify-center items-center space-y-3 min-h-[calc(100vh-14rem)]">
      <UProgress animation="swing" color="primary" size="sm" class="max-w-20" />
        <div class="text-sm text-neutral-400 dark:text-neutral-600">正在加载数据</div>
    </div>
    <div v-else-if="error" class="flex items-center justify-center min-h-[50vh]">
      <UAlert color="error" variant="soft" icon="hugeicons:alert-02"
        :description="error?.message || '加载失败，请稍后重试'">
      </UAlert>
    </div>
    <template v-else>
      <div ref="el" class="my-2">
        <SharedFadeIn v-for="(content, index) in contents" :key="content.id" :delay="index * 10"
          class="py-3" enter-active-class="transition-all duration-500 ease-in-out"
          enter-from-class="transform translate-y-3 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100">
          <template #default>
            <div class="relative overflow-hidden">
              <span v-if="content.pinned"
                class="absolute top-3 -right-8 z-10 rotate-45 px-8 py-0.5 font-medium text-[11px] text-inverted uppercase bg-primary-500 backdrop-blur-sm">
                pinned
              </span>
              <component v-bind="getContentComponentAndProps(content).props"
                :is="getContentComponentAndProps(content).is" />
            </div>
          </template>
        </SharedFadeIn>
      </div>
      <div v-if="contents?.length === 0"
        class="flex flex-col items-center justify-center space-y-4 min-h-[calc(100vh-14rem)] pt-16">
        <UIcon name="hugeicons:ai-content-generator-01"
          class="text-4xl text-neutral-300 dark:text-neutral-700" />
        <p class="text-neutral-400 dark:text-neutral-700 text-sm font-medium">信息矩阵仍处待填充态</p>
      </div>

      <!-- 加载更多按钮 -->
      <div class="flex justify-center pb-2.5" v-if="hasMore && contents && contents.length >= limit">
        <UButton @click="loadMore" variant="soft" color="primary" :disabled="isFetchingNextPage"
          :loading="isFetchingNextPage">
          加载更多
        </UButton>
      </div>

      <!-- 没有更多内容的提示 -->
      <div v-if="!hasMore && contents && contents.length >= limit"
        class="text-center text-sm text-neutral-400 dark:text-neutral-700 pb-2.5">
        已显示全部内容
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ContentItem } from '~/types';

function getContentComponentAndProps(content: any) {
  if (content.github_repo) {
    return { is: resolveComponent('ContentGithubCard'), props: { 'github-repo': content.github_repo } };
  }
  if (!content.title) {
    return { is: resolveComponent('ContentTalkCard'), props: { talk: content } };
  }
  return { is: resolveComponent('ContentCard'), props: { content } };
}

const { getContents, subscribeContents } = useContents();

const CONTENT_FIELDS = [
  "id",
  "title",
  "body",
  "images.*",
  "allow_comments",
  "pinned",
  "github_repo",
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

const {
  data: contents,
  status,
  error,
} = await useLazyAsyncData<ContentItem[] | null>("contents", () =>
  getContents({
    fields: [...CONTENT_FIELDS],
    sort: ["-pinned", "-date_created"],
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
      sort: ["-pinned", "-date_created"],
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

async function refreshAllPages() {
  let allContents: ContentItem[] = [];
  for (let p = 1; p <= page.value; p++) {
    const pageContents = await getContents({
      fields: [...CONTENT_FIELDS],
      sort: ["-pinned", "-date_created"],
      filter: {
        status: { _eq: "published" },
      },
      limit,
      page: p,
    });
    if (pageContents && pageContents.length > 0) {
      allContents = [...allContents, ...pageContents];
      if (pageContents.length < limit) {
        hasMore.value = false;
        break;
      }
    } else {
      hasMore.value = false;
      break;
    }
  }
  contents.value = allContents;
  // 如果第一页就不足 limit，说明没有更多内容
  if (allContents.length < limit * page.value) {
    hasMore.value = false;
  } else {
    hasMore.value = true;
  }
}

const subscriptionCleanup = ref<(() => void) | null>(null);

const setupSubscription = async () => {
  if (subscriptionCleanup.value) {
    subscriptionCleanup.value();
    subscriptionCleanup.value = null;
  }
  subscriptionCleanup.value = await subscribeContents(
    {
      fields: [...CONTENT_FIELDS],
    },
    async (event) => {
      if (["create", "update", "delete"].includes(event.event)) {
        // 保持当前已加载页数，刷新所有已加载内容
        setTimeout(async () => {
          await refreshAllPages();
        }, 1500);
      }
    }
  );
};

onMounted(() => {
  setupSubscription();
});

onUnmounted(() => {
  if (subscriptionCleanup.value) {
    subscriptionCleanup.value();
    subscriptionCleanup.value = null;
  }
});

useSeo({
  site_name: "探索",
  site_description: "",
  seo_keywords: "",
  maintenance_mode: false,
  donate_images: "",
});
</script>