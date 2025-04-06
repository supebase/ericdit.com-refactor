<template>
  <NuxtLink
    :to="{ name: 'article-id', params: { id: contentId } }"
    class="flex justify-end items-center space-x-2">
    <UIcon
      :name="
        !allowComments
          ? 'hugeicons:comment-block-02'
          : commentsCount > 0
          ? 'hugeicons:comment-01'
          : 'hugeicons:comment-02'
      "
      :size="iconSize"
      class="text-neutral-400" />
    <span
      class="text-sm text-neutral-400"
      :class="{ 'opacity-60 flex items-center': !allowComments }">
      <template v-if="!allowComments">
        <UIcon
          name="hugeicons:no-signal"
          class="size-3" />
      </template>
      <template v-else>
        <SharedAnimateNumber :value="commentsCount" />
      </template>
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  contentId: string;
  iconSize?: number;
  allowComments?: boolean;
}>();

const { getCommentsList, subscribeComments } = useComments();
const commentsCount = ref(0);

const fetchCommentsCount = async () => {
  try {
    const comments = await getCommentsList("content", props.contentId, {
      fields: ["id"],
    });
    commentsCount.value = comments.length;
  } catch (error) {
    console.error("Failed to fetch comments count:", error);
  }
};

onMounted(async () => {
  await fetchCommentsCount();

  subscribeComments(props.contentId, async (event) => {
    if (["create", "delete"].includes(event.event)) {
      await fetchCommentsCount();
    }
  });
});
</script>
