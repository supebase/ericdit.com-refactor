<template>
  <div class="relative overflow-hidden touch-pan-y select-none active:cursor-grabbing"
    :class="{ 'cursor-grab': canDelete }" @touchstart="handleDragStart($event, 0)" @touchmove.passive="false"
    @touchmove="handleDragMove($event, 0)" @touchend="handleDragEnd(0)" @touchcancel="handleDragEnd(0)"
    @mousedown.prevent="handleDragStart($event, 0)" @mousemove.prevent="handleDragMove($event, 0)"
    @mouseup="handleDragEnd(0)" @mouseleave="handleDragEnd(0)">
    <div class="relative transform transition-transform duration-200 ease-out"
      :style="{ transform: `translateX(${offsets[0] || 0}px)` }">
      <div class="relative">
        <div v-if="showArrow" class="absolute top-0 left-2">
          <UIcon name="hugeicons:arrow-move-down-right" class="size-5 text-neutral-300/80 dark:text-neutral-700/80" />
        </div>
        <div class="flex items-center ml-10">
          <div class="mr-3">
            <UChip inset size="sm" position="bottom-right" :color="userStatus ? 'success' : 'neutral'">
              <SharedAvatar :src="userAvatarUrl || undefined"
                :alt="!reply.user_created.avatar ? reply.user_created.first_name : undefined" size="xs"
                class="uppercase" />
            </UChip>
          </div>
          <div class="flex-1 mb-1">
            <div class="flex justify-between items-center">
              <div class="flex items-center text-[13px] space-x-2 nums tabular-nums">
                <div class="text-sm font-medium">{{ reply.user_created.first_name }}</div>
                <div class="text-neutral-500">
                  {{ useDateFormatter(reply.date_created) }}
                </div>
                <span class="text-neutral-300 dark:text-neutral-700">&bull;</span>
                <div class="text-neutral-500">
                  {{ userLocation }}
                </div>
              </div>
              <SharedLikeButton :comment-id="reply.id" :icon-size="18" likeType="heart" />
            </div>
          </div>
        </div>
        <div class="ml-10 mt-1 text-[15px] text-neutral-600 dark:text-neutral-400">
          {{ safeComment }}
        </div>
      </div>
    </div>
    <div>
      <button v-if="canDelete"
        class="absolute top-0.5 right-0 text-red-500 p-1 flex items-center justify-center cursor-pointer transition-all duration-200 ease-out origin-right"
        :style="{
          opacity: Math.min(Math.abs(offsets[0] || 0) / 60, 1),
          transform: `translateX(${60 - Math.abs(offsets[0] || 0)}px)`
        }" @click.stop="handleDelete(0)">
        <UIcon v-if="!isDeleting" name="hugeicons:remove-circle-half-dot" class="size-[18px]" />
        <UIcon v-else name="svg-spinners:ring-resize" class="size-[18px]" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Comments } from "~/types";

const { user } = useAuth();
const { deleteComment } = useComments();

const props = defineProps<{
  reply: Comments.Item;
  showArrow?: boolean;
}>();

const { getUserAvatarUrl, getUserLocation } = useUserMeta();

const userAvatarUrl = computed(() =>
  getUserAvatarUrl(props.reply.user_created.id, props.reply.user_created.avatar)
);
const userLocation = computed(
  () => getUserLocation(props.reply.user_created.id, props.reply.user_created.location)
);

const { checkUserStatus, subscribeUserStatus, cleanup, usersStatus } = usePresence() as {
  checkUserStatus: (userId: string) => Promise<boolean>;
  subscribeUserStatus: (userId: string) => Promise<void>;
  cleanup: () => void;
  usersStatus: Ref<Record<string, boolean>>;
};
const userStatus = ref(false);

const safeComment = computed(() => escapeHtml(props.reply.comment));

const canDelete = computed(() => user.value?.id === props.reply.user_created.id);

const isDeleting = ref(false);

// 使用抽离的滑动删除逻辑
const {
  offsets,
  handleDragStart,
  handleDragMove,
  handleDragEnd,
  currentOpenIndex,
} = useSwipeToDelete(() => canDelete.value);

const handleDelete = async (index: number) => {
  if (Math.abs(offsets.value[index] || 0) < 35) return;
  if (isDeleting.value) return;
  isDeleting.value = true;
  try {
    await deleteComment(props.reply.id);
    offsets.value[index] = 0;
    currentOpenIndex.value = null;
  } catch (e) {
    // 错误处理
  } finally {
    isDeleting.value = false;
  }
};

onMounted(async () => {
  await subscribeUserStatus(props.reply.user_created.id);
  userStatus.value = await checkUserStatus(props.reply.user_created.id);

  watch(
    () => usersStatus.value[props.reply.user_created.id],
    (newStatus) => {
      if (newStatus !== undefined) {
        userStatus.value = newStatus;
      }
    },
    { immediate: true }
  );
});

onUnmounted(() => {
  cleanup();
});

onBeforeRouteLeave(() => {
  offsets.value = [0];
  currentOpenIndex.value = null;
});
</script>