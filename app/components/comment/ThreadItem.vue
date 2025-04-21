<template>
  <UCard :ui="{
    root: replyCount ? 'divide-neutral-100 dark:divide-neutral-900 divide-y-2' : 'divide-none',
    body: replyCount ? 'p-4 sm:p-6' : 'p-0 sm:p-0',
  }" variant="soft" class="my-4">
    <template #header>
      <div class="relative overflow-hidden touch-none select-none active:cursor-grabbing"
        :class="{ 'cursor-grab': canDelete }" @touchstart="handleDragStart($event, 0)"
        @touchmove="handleDragMove($event, 0)" @touchend="handleDragEnd(0)" @touchcancel="handleDragEnd(0)"
        @mousedown.prevent="handleDragStart($event, 0)" @mousemove.prevent="handleDragMove($event, 0)"
        @mouseup="handleDragEnd(0)" @mouseleave="handleDragEnd(0)">
        <div class="relative transform transition-transform duration-200 ease-out"
          :style="{ transform: `translateX(${offsets[0] || 0}px)` }">
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
                  <div class="text-neutral-500">
                    {{ useDateFormatter(comment.date_created) }}
                  </div>
                  <span class="text-neutral-400 dark:text-neutral-600">&bull;</span>
                  <div class="text-neutral-500">
                    {{ userLocation }}
                  </div>
                </div>

                <SharedLikeButton :comment-id="comment.id" :icon-size="18" likeType="heart" />
              </div>
            </div>
          </div>

          <div class="mt-1 text-[15px] text-neutral-600 dark:text-neutral-400">
            {{ safeComment }}
          </div>
          <div class="mt-1" :class="isReplying ? 'hidden' : ''">
            <button @click="handleReply" class="text-[13px] text-neutral-500 nums tabular-nums cursor-pointer">
              {{ replyCount > 0 ? `${replyCount} 条回复` : "回复" }}
            </button>
          </div>
        </div>
        <div class="absolute top-0 right-0 h-full flex items-center">
          <button v-if="canDelete"
            class="bg-white dark:bg-neutral-900 text-red-500 p-2 mr-2 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ease-out origin-right"
            :style="{
              opacity: Math.min(Math.abs(offsets[0] || 0) / 75, 1),
              transform: `translateX(${75 - Math.abs(offsets[0] || 0)}px)`
            }" @click.stop="handleDelete(0)">
            <UIcon v-if="!isDeleting" name="hugeicons:cancel-circle-half-dot" class="size-5" />
            <UIcon v-else name="svg-spinners:ring-resize" class="size-5" />
          </button>
        </div>
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
const { guardAction } = useAuthGuard();
const { user } = useAuth();
const { deleteComment } = useComments();

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

const handleReply = () => {
  guardAction(() => toggleReplyInput());
};

const toggleReplyInput = () => {
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

const canDelete = computed(() => user.value?.id === props.comment.user_created.id);

const offsets = ref<number[]>([0]);
const dragStartX = ref<number[]>([0]);
const isDragging = ref<boolean[]>([false]);
const dragThreshold = 10;
const currentOpenIndex = ref<number | null>(null);
const isDeleting = ref(false);

const handleDragStart = (event: MouseEvent | TouchEvent, index: number) => {
  if (!canDelete.value) return;
  if (currentOpenIndex.value !== null && currentOpenIndex.value !== index) {
    offsets.value[currentOpenIndex.value] = 0;
  }
  isDragging.value[index] = true;
  dragStartX.value[index] = event instanceof MouseEvent ? event.clientX : event.touches?.[0]?.clientX ?? 0;
  offsets.value[index] = offsets.value[index] || 0;
};

const handleDragMove = (event: MouseEvent | TouchEvent, index: number) => {
  if (!canDelete.value) return;
  if (!isDragging.value[index]) return;
  const currentX = event instanceof MouseEvent ? event.clientX : event.touches?.[0]?.clientX ?? 0;
  const diff = currentX - (dragStartX.value[index] ?? 0);
  if (event.type === 'touchmove' && Math.abs(diff) > dragThreshold) event.preventDefault();

  let newOffset = diff;
  if (currentOpenIndex.value === index) {
    newOffset = Math.max(Math.min(diff - 75, 0), -75);
  } else {
    newOffset = Math.max(Math.min(diff, 0), -75);
  }
  offsets.value[index] = newOffset;
};

const handleDragEnd = (index: number) => {
  if (!canDelete.value) return;
  if (!isDragging.value[index]) return;
  const offset = offsets.value[index];
  const isOpen = Math.abs(offset || 0) > 35;
  offsets.value[index] = isOpen ? -75 : 0;
  currentOpenIndex.value = isOpen ? index : null;
  isDragging.value[index] = false;
};

const handleDelete = async (index: number) => {
  if (Math.abs(offsets.value[index] || 0) < 35) return;
  if (isDeleting.value) return;
  isDeleting.value = true;
  try {
    await deleteComment(props.comment.id);
    offsets.value[index] = 0;
    currentOpenIndex.value = null;
  } catch (e) {
    // 错误处理
  } finally {
    isDeleting.value = false;
  }
};

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

onBeforeRouteLeave(() => {
  offsets.value = [0];
  currentOpenIndex.value = null;
});
</script>