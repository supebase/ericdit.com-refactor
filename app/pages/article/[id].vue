<template>
  <div class="container">
    <div v-if="status === 'pending' && !content"
      class="fixed inset-0 flex justify-center items-center">
      <UIcon name="svg-spinners:ring-resize" class="size-7 text-primary-500" />
    </div>
    <div v-else-if="error" class="flex items-center justify-center min-h-[50vh]">
      <UAlert color="error" variant="soft" icon="hugeicons:alert-02"
        :description="error?.message || '加载失败，请稍后重试'">
      </UAlert>
    </div>
    <ContentDetails v-else-if="content" :content="content" />
    <CommentThread v-if="content" :content-id="content.id"
      :allow-comments="content.allow_comments" />
  </div>
</template>

<script setup lang="ts">
const CommentThread = defineAsyncComponent(() => import("~/components/comment/CommentThread.vue"));

const route = useRoute();
const { getContent, subscribeContents, cleanMarkdown } = useContents();

const CONTENT_FIELDS = [
  "id",
  "title",
  "body",
  "allow_comments",
  "user_created.*",
  "date_created",
  "date_updated",
  "views",
] as const;

const {
  data: content,
  refresh,
  status,
  error,
} = await useLazyAsyncData(
  `content-${route.params.id}`,
  () =>
    getContent(route.params.id as string, {
      fields: [...CONTENT_FIELDS],
    }),
  {
    // 添加缓存控制
    watch: [() => route.params.id],
    server: true,
  }
);

onMounted(() => {
  subscribeContents(
    {
      fields: [...CONTENT_FIELDS],
    },
    async (event) => {
      if (["update"].includes(event.event)) {
        await refresh();
      }
    }
  );
});

useSeo({
  site_name: computed(() => content.value?.title || "正在加载"),
  site_description: computed(() => cleanMarkdown(content.value?.body?.substring(0, 100) || "")),
  seo_keywords: "",
  maintenance_mode: false,
  donate_images: [],
});
</script>
