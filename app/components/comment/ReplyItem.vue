<template>
  <div class="relative">
    <div v-if="showArrow" class="absolute top-0 left-2">
      <UIcon name="hugeicons:arrow-move-down-right" class="size-5 text-neutral-300/80 dark:text-neutral-700/80" />
    </div>
    <div class="flex items-center ml-10">
      <div class="mr-3">
        <UChip inset size="sm" position="bottom-right" :color="userStatus ? 'success' : 'neutral'">
          <SharedAvatar :src="userAvatarUrl || undefined"
            :alt="!reply.user_created.avatar ? reply.user_created.first_name : undefined" size="xs" class="uppercase" />
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
</template>

<script setup lang="ts">
import type { Comments } from "~/types";

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
</script>