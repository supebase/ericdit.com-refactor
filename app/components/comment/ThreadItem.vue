<template>
  <UCard :ui="{
    root: replyCount ? 'divide-neutral-100 dark:divide-neutral-900 divide-y-2' : 'divide-none',
    body: replyCount ? 'p-4 sm:p-6' : 'p-0 sm:p-0',
  }" variant="soft" class="my-4">
    <template #header>
      <div class="flex items-center">
        <div class="mr-3">
          <UChip inset size="sm" position="bottom-right" :color="userStatus ? 'success' : 'neutral'">
            <SharedAvatar :src="userAvatarUrl || undefined"
              :alt="!comment.user_created.avatar ? comment.user_created.first_name : undefined" size="xs"
              class="uppercase" />
          </UChip>
        </div>

        <div class="flex-1 mb-1">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2 text-[13px] nums tabular-nums">
              <div class="text-sm font-medium">{{ comment.user_created.first_name }}</div>
              <div class="text-neutral-400 dark:text-neutral-600">
                {{ useDateFormatter(comment.date_created) }}
              </div>
              <span class="text-neutral-400 dark:text-neutral-600">&bull;</span>
              <div class="text-neutral-400 dark:text-neutral-600">
                {{ userLocation }}
              </div>
            </div>

            <SharedLikeButton :comment-id="comment.id" :icon-size="18" likeType="heart" />
          </div>
        </div>
      </div>

      <div class="mt-1 cursor-pointer text-[15px] text-neutral-600 dark:text-neutral-400" @click="toggleReplyInput">
        {{ safeComment }}
      </div>
      <div class="mt-1" :class="isReplying ? 'hidden' : ''">
        <button @click="toggleReplyInput" class="text-[13px] text-neutral-500 nums tabular-nums cursor-pointer">
          {{ replyCount > 0 ? `${replyCount} 条回复` : "回复" }}
        </button>
      </div>

      <div class="transform transition-all duration-300 ease-in-out" :class="isReplying
        ? 'translate-y-0 opacity-100 max-h-[200px]'
        : '-translate-y-3 opacity-0 max-h-0 overflow-hidden'
        ">
        <div>
          <CommentEditor :placeholder="`回复：${comment.user_created.first_name}`" :is-submitting="isSubmitting"
            :clear-input="clearInput" @submit="handleSubmit" />
          <UIcon v-if="isReplying" @click="cancelReply" name="hugeicons:cancel-circle"
            class="size-5 text-neutral-500 cursor-pointer absolute -top-2 -right-1" />
        </div>
      </div>
    </template>

    <template #default>
      <CommentReplyThread ref="replyListRef" :comment-id="comment.id" />
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { Comments } from "~/types";
const { isAuthenticated } = useAuth();

const props = defineProps<{
  comment: Comments.Item;
  isReplying: boolean;
  isSubmitting?: boolean;
  clearInput?: boolean;
}>();

const { getUserAvatarUrl, getUserLocation } = useUserMeta();

const userAvatarUrl = computed(() =>
  getUserAvatarUrl(props.comment.user_created.id, props.comment.user_created.avatar)
);
const userLocation = computed(
  () => getUserLocation(props.comment.user_created.id, props.comment.user_created.location)
);

const emit = defineEmits<{
  (e: "reply", data: { commentId: string; content: string }): void;
  (e: "reply-start"): void;
  (e: "reply-end"): void;
}>();

const replyListRef = ref();

const refreshReplies = async () => {
  await replyListRef.value?.refresh();
};

const toggleReplyInput = () => {
  if (!isAuthenticated.value) return;

  if (!props.isReplying) {
    emit("reply-start");
  } else {
    emit("reply-end");
  }
};

const cancelReply = () => {
  emit("reply-end");
};

const handleSubmit = (content: string) => {
  emit("reply", {
    commentId: props.comment.id,
    content: content.trim(),
  });
};

const replyCount = computed(() => replyListRef.value?.repliesCount || 0);

const safeComment = computed(() => escapeHtml(props.comment.comment));

defineExpose({
  refreshReplies,
  comment: props.comment,
});

const { checkUserStatus, subscribeUserStatus, cleanup, usersStatus } = usePresence() as {
  checkUserStatus: (userId: string) => Promise<boolean>;
  subscribeUserStatus: (userId: string) => Promise<void>;
  cleanup: () => void;
  usersStatus: Ref<Record<string, boolean>>;
};
const userStatus = ref(false);

onMounted(async () => {
  if (import.meta.client) {
    await subscribeUserStatus(props.comment.user_created.id);
    userStatus.value = await checkUserStatus(props.comment.user_created.id);

    watch(
      () => usersStatus.value[props.comment.user_created.id],
      (newStatus) => {
        if (newStatus !== undefined) {
          userStatus.value = newStatus;
        }
      },
      { immediate: true }
    );
  }
});

onUnmounted(() => {
  cleanup();
});

onDeactivated(() => {
  emit("reply-end");
});
</script>