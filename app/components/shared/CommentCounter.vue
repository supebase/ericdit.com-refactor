<template>
  <div class="flex justify-end items-center space-x-2">
    <UIcon :name="!allowComments
      ? 'hugeicons:comment-block-02'
      : commentsCount > 0
        ? 'hugeicons:comment-01'
        : 'hugeicons:comment-02'
      " :size="iconSize" class="text-neutral-400 dark:text-neutral-500" />
    <span class="text-sm text-neutral-400 dark:text-neutral-500"
      :class="{ 'flex items-center': !allowComments }">
      <template v-if="!allowComments">
        <span class="tabular-nums">0</span>
      </template>
      <template v-else>
        <SharedAnimateNumber :value="commentsCount" />
      </template>
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  contentId: string;
  iconSize?: number;
  allowComments?: boolean;
}>();

const { getCommentsList, subscribeComments } = useComments();
const commentsCount = ref(0);

// 封装订阅逻辑
function useCommentsSubscription(contentId: string, onUpdate: () => void) {
  let unsubscribe: (() => void) | null = null;

  const start = async () => {
    if (unsubscribe) unsubscribe();
    unsubscribe = await subscribeComments(contentId, async (event) => {
      if (["create", "delete"].includes(event.event)) {
        await onUpdate();
      }
    });
  };

  const stop = () => {
    if (unsubscribe) unsubscribe();
    unsubscribe = null;
  };

  return { start, stop };
}

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

let subscription = useCommentsSubscription(props.contentId, fetchCommentsCount);

onMounted(async () => {
  await fetchCommentsCount();
  subscription.start();
});

onUnmounted(() => {
  subscription.stop();
});

watch(
  () => props.contentId,
  async (newId, oldId) => {
    if (newId !== oldId) {
      await fetchCommentsCount();
      subscription.stop();
      subscription = useCommentsSubscription(newId, fetchCommentsCount);
      subscription.start();
    }
  }
);
</script>