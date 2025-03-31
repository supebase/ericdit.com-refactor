<template>
  <div>
    <div class="flex items-center">
      <div class="mr-3">
        <UChip
          inset
          position="bottom-right"
          :color="usersStatus[reply.user_created.id] ? 'primary' : 'neutral'">
          <UAvatar
            :src="userAvatarUrl || undefined"
            :alt="!reply.user_created.avatar ? reply.user_created.first_name : undefined"
            size="sm"
            loading="lazy"
            class="uppercase" />
        </UChip>
      </div>

      <div class="flex-1 mb-1.5">
        <div class="flex justify-between items-center">
          <div class="flex items-center text-sm space-x-2 nums tabular-nums">
            <div class="text-base font-medium">{{ reply.user_created.first_name }}</div>
            <div class="text-neutral-600">{{ useDateFormatter(reply.date_created) }}</div>
            <UIcon
              name="hugeicons:arrow-right-01"
              class="size-3 text-neutral-600" />
            <div class="text-neutral-600">
              {{ reply.user_created.location }}
            </div>
          </div>

          <SharedLikeButton
            :comment-id="reply.id"
            :icon-size="18" />
        </div>
      </div>
    </div>
    <div class="ml-10 text-neutral-400">{{ reply.comment }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Comments } from "~/types";

const props = defineProps<{
  reply: Comments.Item;
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
