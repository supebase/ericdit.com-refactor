<template>
  <div class="relative overflow-hidden touch-none select-none active:cursor-grabbing"
    :class="{ 'cursor-grab': canDelete }" @touchstart="handleDragStart($event, 0)"
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
                <span class="text-neutral-400 dark:text-neutral-600">&bull;</span>
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