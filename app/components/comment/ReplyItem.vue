<template>
  <div class="relative">
    <div
      v-if="showArrow"
      class="absolute top-0 left-2">
      <UIcon
        name="hugeicons:arrow-move-down-right"
        class="size-5 text-neutral-300/80 dark:text-neutral-700/80" />
    </div>
    <div class="flex items-center ml-10">
      <div class="mr-3">
        <UChip
          inset
          size="xs"
          position="bottom-right"
          :color="usersStatus[reply.user_created.id] ? 'primary' : 'neutral'">
          <SharedAvatar
            :src="userAvatarUrl || undefined"
            :alt="!reply.user_created.avatar ? reply.user_created.first_name : undefined"
            size="sm"
            class="uppercase" />
        </UChip>
      </div>

      <div class="flex-1">
        <div class="flex justify-between items-center">
          <div class="flex items-center text-[13px] space-x-2 nums tabular-nums">
            <div class="text-sm font-medium">{{ reply.user_created.first_name }}</div>
            <div class="text-neutral-400 dark:text-neutral-600">{{ useDateFormatter(reply.date_created) }}</div>
            <UIcon
              name="hugeicons:arrow-right-01"
              class="size-3 text-neutral-400 dark:text-neutral-600" />
            <div class="text-neutral-400 dark:text-neutral-600">
              {{ reply.user_created.location }}
            </div>
          </div>

          <SharedLikeButton
            :comment-id="reply.id"
            :icon-size="18"
            likeType="heart" />
        </div>
      </div>
    </div>
    <div class="ml-10 mt-2 text-[15px] text-neutral-600 dark:text-neutral-400">{{ reply.comment }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Comments } from "~/types";

const props = defineProps<{
  reply: Comments.Item;
  showArrow?: boolean;
}>();

const { getUserAvatarUrl } = useComments();
const userAvatarUrl = computed(() =>
  getUserAvatarUrl(props.reply.user_created.id, props.reply.user_created.avatar)
);

const { usersStatus, subscribeUserStatus } = usePresence();

onMounted(async () => {
  await subscribeUserStatus(props.reply.user_created.id);
});
</script>
