<template>
  <UModal v-model:open="isOpen"
    :ui="{ overlay: 'backdrop-blur-xs', content: 'bg-neutral-50 dark:bg-neutral-950' }"
    title="Search" description="站内搜索">
    <UIcon name="hugeicons:search-01"
      class="size-5 text-neutral-500 hover:text-primary-500 cursor-pointer" />
    <template #content>
      <UCommandPalette v-model:search-term="searchQuery" :loading="isLoading" :groups="groups"
        icon="hugeicons:search-01" :placeholder="'请输入至少 ' + MIN_SEARCH_LENGTH + ' 个字符'"
        class="h-[30vh]" close @update:open="isOpen = $event" @update:model-value="onSelect"
        @compositionstart="handleCompositionStart" @compositionend="handleCompositionEnd">
        <template #item="{ item }">
          <div class="flex items-center justify-between mr-2 rounded-md w-full">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div
                class="w-8 h-8 shrink-0 rounded-sm overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <NuxtImg provider="directus" v-if="item.avatar" :src="item.avatar.src"
                  :alt="item.label" class="w-full h-full object-cover" />
                <UIcon v-else name="hugeicons:file-01"
                  class="size-5 text-neutral-400 dark:text-neutral-600" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-medium line-clamp-1">{{ item.label }}</span>
                <span class="text-xs text-neutral-400 dark:text-neutral-600 shrink-0">{{
                  item.suffix
                }}</span>
              </div>
            </div>
          </div>
        </template>
        <template #empty>
          <div
            class="flex flex-col items-center justify-center py-4 gap-2 text-neutral-400 dark:text-neutral-600">
            <p v-if="error">{{ error }}</p>
            <p v-else-if="searchQuery && searchQuery.length < MIN_SEARCH_LENGTH"
              class="animate-pulse">请继续输入关键字</p>
            <p v-else-if="searchQuery && !isLoading && !searchResults.length">检索记录中无对应关键词数据</p>
            <p v-else>输入关键词，进行信息检索操作。</p>
          </div>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const MIN_SEARCH_LENGTH = 2;
const isOpen = ref(false);
const searchQuery = ref("");
const isLoading = ref(false);
const searchResults = ref<any[]>([]);
const error = ref<string | null>(null);

const isComposing = ref(false);

function handleCompositionStart() {
  isComposing.value = true;
}
function handleCompositionEnd() {
  isComposing.value = false;
  // 组合输入结束后，立即触发一次搜索
  debouncedSearch();
}

const { getContents, cleanMarkdown } = useContents();

const performSearch = async () => {
  const query = searchQuery.value.trim();

  error.value = null;

  if (!query) {
    searchResults.value = [];
    return;
  }

  if (query.length < MIN_SEARCH_LENGTH) {
    return;
  }

  isLoading.value = true;
  try {
    const results = await getContents({
      filter: {
        status: { _eq: "published" },
        _or: [{ title: { _icontains: query } }, { body: { _icontains: query } }],
      },
      fields: ["id", "title", "body", "date_created", "images.directus_files_id"],
      sort: ["-date_created"],
      limit: 20,
    });

    searchResults.value = results || [];
  } catch (error: any) {
    console.error("搜索失败:", error);
    error.value = error?.message || "搜索出现错误，请稍后重试";
    searchResults.value = [];
  } finally {
    isLoading.value = false;
  }
};

const debouncedSearch = useThrottleFn(performSearch, 200);

watch(searchQuery, (newVal) => {
  if (isComposing.value) return; // 输入法组合中不触发搜索
  if (!newVal.trim()) {
    searchResults.value = [];
    error.value = null;
    return;
  }
  debouncedSearch();
});

const groups = computed(() => [
  {
    id: "articles",
    items: searchResults.value.map((article) => ({
      id: article.id,
      label: article.title ? article.title : cleanMarkdown(article.body),
      suffix: useDateFormatter(article.date_created).value,
      to: `/article/${article.id}`,
      avatar: article.images?.[0]?.directus_files_id
        ? {
          src: article.images[0].directus_files_id,
        }
        : undefined,
    })),
    ignoreFilter: true,
  },
]);

function onSelect() {
  isOpen.value = false;
}

watch(isOpen, (val) => {
  if (!val) {
    searchQuery.value = "";
    searchResults.value = [];
    error.value = null;
  }
});
</script>