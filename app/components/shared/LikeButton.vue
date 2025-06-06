<template>
  <div class="flex justify-end items-center">
    <button aria-label="likes" @click="handleLike" :disabled="isProcessing"
      class="text-sm flex items-center space-x-1.5 text-neutral-400 dark:text-neutral-500 cursor-pointer disabled:cursor-not-allowed">
      <UIcon name="svg-spinners:ring-resize" :size="iconSize"
        class="text-neutral-400 dark:text-neutral-500" v-if="isProcessing" />
      <UIcon v-else :name="getIconName || ''" :size="iconSize" :class="[
        { 'scale-effect': showScale },
        isLiked ? 'text-neutral-700 dark:text-neutral-300' : ''
      ]" />
      <SharedAnimateNumber :value="likesCount"
        :class="isLiked ? 'text-neutral-700 dark:text-neutral-300' : ''" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  commentId?: string;
  contentId?: string;
  iconSize?: number;
  iconName?: string;
  iconNameActive?: string;
  likeType?: "heart" | "clap";
}>();

const { guardAction } = useAuthGuard();
const { isAuthenticated } = useAuth();
const { getLikes, createLike, deleteLike, subscribeLikes } = useLikes();

const isLiked = ref(false);
const likesCount = ref(0);
const currentLikeId = ref<string | null>(null);
const isProcessing = ref(false);

const fetchLikes = async () => {
  try {
    const filter: Record<string, any> = {};
    if (props.commentId) {
      filter.comment_id = { _eq: props.commentId };
    } else if (props.contentId) {
      filter.content_id = { _eq: props.contentId };
    }

    const likes = await getLikes({
      fields: ["id", "user_created.id"],
      filter,
    });

    likesCount.value = likes.length;
    const currentUserId = useAuth().user.value?.id;
    const userLike = likes.find((like) => like.user_created?.id === currentUserId);

    isLiked.value = false;
    currentLikeId.value = null;

    if (userLike) {
      isLiked.value = true;
      currentLikeId.value = userLike.id;
    }
  } catch (error) {
    console.error("Failed to fetch likes:", error);
  }
};

const showScale = ref(false);

const handleLikeAction = async () => {
  if (isProcessing.value) return;

  try {
    isProcessing.value = true;

    if (isLiked.value && currentLikeId.value) {
      await deleteLike(currentLikeId.value);
      likesCount.value--;
      isLiked.value = false;
      currentLikeId.value = null;
    } else {
      const newLike = await createLike({
        comment_id: props.commentId,
        content_id: props.contentId,
      });
      likesCount.value++;
      isLiked.value = true;
      currentLikeId.value = newLike.id;
      showScale.value = true;
      setTimeout(() => {
        showScale.value = false;
      }, 300);
    }
  } catch (error) {
    console.error("Failed to toggle like:", error);
  } finally {
    isProcessing.value = false;
  }
};

const handleLike = () => {
  const message = props.commentId ? "登录后即可为精彩评论点赞" : "登录后即可为喜欢的内容点赞";
  guardAction(() => handleLikeAction(), message);
};

// 计算属性获取图标名称
const getIconName = computed(() => {
  if (props.iconName || props.iconNameActive) {
    return isLiked.value ? props.iconNameActive : props.iconName;
  }
  // 根据点赞类型返回默认图标
  if (props.likeType === "heart") {
    return isLiked.value ? "hugeicons:heart-check" : "hugeicons:favourite";
  } else {
    return isLiked.value ? "hugeicons:waving-hand-02" : "hugeicons:waving-hand-02";
  }
});

// 封装订阅逻辑
function useLikesSubscription(commentId: string | undefined, contentId: string | undefined, onUpdate: () => void) {
  let unsubscribe: (() => void) | null = null;

  const start = async () => {
    if (unsubscribe) unsubscribe();
    const filter: Record<string, any> = {};
    if (commentId) {
      filter.comment_id = { _eq: commentId };
    } else if (contentId) {
      filter.content_id = { _eq: contentId };
    }
    unsubscribe = await subscribeLikes(
      {
        fields: ["id", "user_created.id"],
        filter,
      },
      async (event) => {
        if (["create", "delete"].includes(event.event)) {
          await onUpdate();
        }
      }
    );
  };

  const stop = () => {
    if (unsubscribe) unsubscribe();
    unsubscribe = null;
  };

  return { start, stop };
}

let subscription = useLikesSubscription(props.commentId, props.contentId, fetchLikes);

onMounted(async () => {
  await fetchLikes();
  subscription.start();
});

onUnmounted(() => {
  subscription.stop();
});

watch(isAuthenticated, (newValue) => {
  if (!newValue) {
    isLiked.value = false;
    currentLikeId.value = null;
  } else {
    fetchLikes();
  }
});

watch(
  () => [props.commentId, props.contentId],
  async ([newCommentId, newContentId], [oldCommentId, oldContentId]) => {
    if (newCommentId !== oldCommentId || newContentId !== oldContentId) {
      await fetchLikes();
      subscription.stop();
      subscription = useLikesSubscription(newCommentId, newContentId, fetchLikes);
      subscription.start();
    }
  }
);
</script>