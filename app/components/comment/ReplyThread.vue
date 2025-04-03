<template>
  <div>
    <div class="space-y-6">
      <CommentReplyItem
        v-for="(reply, index) in displayReplies"
        :key="reply.id"
        :reply="reply"
        :show-arrow="index === 0" />

      <div
        v-if="replies.length > 1"
        class="text-[13px] ml-10">
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
  return isExpanded.value ? replies.value : replies.value.slice(0, 1);
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
