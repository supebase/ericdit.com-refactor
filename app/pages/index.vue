<template>
  <div class="container">
    <div v-if="isLoading && !contents">
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
    </template>

    <hr class="my-5" />
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

const {
  data: contents,
  refresh,
  status,
  error,
} = await useLazyAsyncData(() =>
  getContents({
    fields: [...CONTENT_FIELDS],
    sort: ["-date_created"],
    filter: {
      status: { _eq: "published" },
    },
  })
);

const isLoading = computed(() => status.value === "pending");

onMounted(() => {
  subscribeContents(
    {
      fields: [...CONTENT_FIELDS],
    },
    async (event) => {
      if (["create", "update", "delete"].includes(event.event)) {
        await refresh();
      }
    }
  );
});
</script>
