<template>
  <div>
    <div
      v-if="isLoading && !replies.length"
      class="flex justify-center pb-4">
      <UProgress
        animation="swing"
        color="neutral"
        size="sm"
        class="max-w-[60px]" />
    </div>

    <div
      class="space-y-6"
      v-else>
      <CommentReplyItem
        v-for="reply in displayReplies"
        :key="reply.id"
        :reply="reply" />

      <div
        v-if="replies.length > 2"
        class="text-sm ml-10">
        <button
          class="text-neutral-500 nums tabular-nums cursor-pointer"
          @click="toggleExpand">
          {{ isExpanded ? "收起回复" : `查看全部回复` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Comments } from "~/types";

const props = defineProps<{
  commentId: string;
}>();

const { getCommentsList } = useComments();
const replies = ref<Comments.Item[]>([]);
const isExpanded = ref(false);
const isLoading = ref(false);

const fetchReplies = async () => {
  isLoading.value = true;
  try {
    replies.value =
      (await getCommentsList("reply", props.commentId, {
        fields: ["id", "comment", "user_created.*", "date_created"],
        sort: ["-date_created"],
      })) || [];
  } finally {
    isLoading.value = false;
  }
};

const displayReplies = computed(() => {
  return isExpanded.value ? replies.value : replies.value.slice(0, 2);
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const repliesCount = computed(() => replies.value.length);

onMounted(fetchReplies);

defineExpose({
  refresh: fetchReplies,
  repliesCount,
});
</script>
