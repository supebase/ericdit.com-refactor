<template>
  <div class="select-none pb-10">
    <div class="fixed bottom-17 z-30 left-1/2 -translate-x-1/2">
      <UButtonGroup
        class="shadow-lg rounded-2xl hover:shadow-xl ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 transition-shadow duration-300 backdrop-blur-sm bg-white/90 dark:bg-neutral-950/90">
        <UButton :ui="{
          base: 'rounded-[calc(var(--ui-radius)*2)] transition-transform duration-200 hover:bg-white dark:hover:bg-neutral-950',
        }" color="neutral" variant="ghost" size="lg">
          <SharedLikeButton :content-id="contentId" :icon-size="21" likeType="clap" />
        </UButton>
        <USeparator :ui="{ border: 'border-neutral-200 dark:border-neutral-700/70' }" class="h-4 w-2 my-auto"
          orientation="vertical" />
        <UButton :ui="{
          base: 'rounded-[calc(var(--ui-radius)*2)] transition-transform duration-200 hover:bg-white dark:hover:bg-neutral-950',
        }" color="neutral" variant="ghost" size="lg" class="cursor-pointer">
          <SharedCommentCounter :content-id="contentId" :allow-comments="allowComments" :icon-size="18"
            @click="scrollToComments" />
        </UButton>
        <USeparator :ui="{ border: 'border-neutral-200 dark:border-neutral-700/70' }"
          class="h-4 w-2 my-auto transition-all duration-300 ease-out"
          :class="showBackToTop ? 'opacity-100' : 'opacity-0 w-0 p-0'" orientation="vertical" />
        <UButton :ui="{
          base: 'rounded-[calc(var(--ui-radius)*2)] transition-all duration-300 ease-out hover:bg-white dark:hover:bg-neutral-950',
        }" color="neutral" variant="ghost" size="lg" class="cursor-pointer"
          :class="showBackToTop ? 'w-auto opacity-100' : 'w-0 p-1 opacity-0 overflow-hidden'" @click="scrollToTop">
          <UIcon name="hugeicons:circle-arrow-up-02"
            class="size-5 text-primary-500 dark:text-orange-200 transition-transform duration-500"
            :class="showBackToTop ? 'rotate-0' : 'rotate-180'" />
        </UButton>
      </UButtonGroup>
    </div>

    <UAlert v-if="!allowComments" :ui="{ wrapper: 'flex items-center' }" color="neutral" variant="soft"
      description="本评论区已启动勿扰模式" class="mb-8 text-neutral-500">
    </UAlert>

    <template v-else>
      <UAlert v-if="error" :ui="{ wrapper: 'flex items-center' }" color="error" variant="soft"
        :description="error?.message || '加载评论失败，请稍后重试。'" class="mb-8">
      </UAlert>

      <div v-else-if="isLoading && !comments" class="flex flex-col justify-center items-center space-y-3 py-8">
        <UProgress animation="swing" color="neutral" size="sm" class="max-w-[80px]" />
        <div class="text-sm text-neutral-400 dark:text-neutral-600">正在加载评论</div>
      </div>

      <template v-else>
        <UAlert v-if="!totalComments" :ui="{ wrapper: 'flex items-center' }" color="neutral" variant="soft"
          description="评论区竟无人类交互记录" class="mb-8 text-neutral-500">
        </UAlert>

        <div id="comments">
          <div class="transform transition-all duration-300 ease-in-out" :class="showMainCommentForm
            ? 'translate-y-0 opacity-100 max-h-[200px]'
            : 'translate-y-3 opacity-0 max-h-0 overflow-hidden'
            ">
            <div :class="!totalComments ? 'mb-8' : ''">
              <CommentEditor :is-submitting="isSubmitting" :placeholder="randomPlaceholder" @submit="handleSubmit"
                :clear-input="clearMainInput" />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-center gap-2 text-neutral-500 animate-pulse my-5"
          v-if="allowComments && totalComments">
          <UIcon name="hugeicons:swipe-left-09" class="size-5" />
          <span class="text-sm font-medium">向左滑动删除评论或回复</span>
        </div>

        <div v-if="rootComments.length" class="mb-8">
          <SharedFadeIn v-for="(comment, index) in rootComments" :key="comment.id" :delay="index * 100">
            <CommentThreadItem :comment="comment" :is-replying="activeReplyId === comment.id"
              :is-submitting="replySubmitting[comment.id] || false" :clear-input="clearReplyInput[comment.id] || false"
              @reply="handleReply" @reply-start="handleReplyStart(comment.id)" @reply-end="handleReplyEnd(comment.id)"
              :ref="(el) => setCommentRef(comment.id, el)" />
          </SharedFadeIn>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { AUTH_ERROR_MESSAGES } from "~/types/auth";

const CommentThreadItem = defineAsyncComponent(() => import("~/components/comment/ThreadItem.vue"));

interface ReplyData {
  commentId: string;
  content: string;
}

const props = defineProps<{
  contentId: string;
  allowComments: boolean;
}>();

const { getCommentsList, createComment, subscribeComments } = useComments();
const toast = useToast();

const isSubmitting = ref(false);
const replySubmitting = ref<Record<string, boolean>>({});
const showMainCommentForm = ref(true);
const activeReplyId = ref<string | null>(null);
const commentRefs = ref<Record<string, { refreshReplies: () => Promise<void> }>>({});

const clearMainInput = ref(false);
const clearReplyInput = ref<Record<string, boolean>>({});

const {
  data: comments,
  refresh: refreshComments,
  status,
  error,
} = await useLazyAsyncData(`comments-${props.contentId}`, () =>
  getCommentsList("content", props.contentId, {
    fields: ["id", "comment", "user_created.*", "date_created", "parent_comment_id.*"],
    sort: ["-date_created"],
  })
);

const PLACEHOLDERS = [
  "灵感来袭？快写下您的独特见解！",
  "分享您的故事或经验，让大家听听吧！",
  "欢迎加入讨论，畅所欲言~",
] as const;

const randomPlaceholder = ref("");

const generateRandomPlaceholder = () => {
  const randomIndex = Math.floor(Math.random() * PLACEHOLDERS.length);
  randomPlaceholder.value = PLACEHOLDERS[randomIndex] ?? "";
};

const hideMainCommentForm = () => {
  showMainCommentForm.value = false;
};

const toggleMainCommentFormShow = () => {
  showMainCommentForm.value = true;
};

const handleReplyStart = (commentId: string) => {
  activeReplyId.value = commentId;
  hideMainCommentForm();
};

const handleReplyEnd = (commentId?: string) => {
  if (commentId) {
    clearReplyInput.value[commentId] = true;
    setTimeout(() => { clearReplyInput.value[commentId] = false }, 100);
  }
  activeReplyId.value = null;
  toggleMainCommentFormShow();
};

const isLoading = computed(() => status.value === "pending");

const rootComments = computed(
  () => comments.value?.filter((comment) => !comment.parent_comment_id) ?? []
);

const totalComments = computed(() => comments.value?.length ?? 0);

const setCommentRef = (id: string, el: any) => {
  if (el) {
    commentRefs.value[id] = el;
  } else {
    delete commentRefs.value[id];
  }
};

const handleSubmit = async (content: string) => {
  try {
    isSubmitting.value = true;
    await createComment({
      content_id: props.contentId,
      comment: content,
    });
    await refreshComments();

    clearMainInput.value = true;
    setTimeout(() => { clearMainInput.value = false }, 100);

    toast.add({
      title: "评论成功",
      description: "您的评论已发表成功，非常感谢。",
      icon: "hugeicons:checkmark-circle-02",
      color: "success",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? AUTH_ERROR_MESSAGES[error.message] || error.message
        : "发生错误，请稍后再试。";

    toast.add({
      title: "评论失败",
      description: errorMessage,
      icon: "hugeicons:alert-02",
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

const handleReply = async ({ commentId, content }: ReplyData) => {
  replySubmitting.value[commentId] = true;
  try {
    await createComment({
      content_id: props.contentId,
      parent_comment_id: commentId,
      comment: content.trim(),
    });

    const targetRef = commentRefs.value[commentId];
    if (targetRef) {
      await targetRef.refreshReplies();
    }

    clearReplyInput.value[commentId] = true;
    setTimeout(() => { clearReplyInput.value[commentId] = false }, 100);

    toast.add({
      title: "回复成功",
      description: "您的回复已发表成功，非常感谢。",
      icon: "hugeicons:checkmark-circle-02",
      color: "success",
    });

    handleReplyEnd();
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? AUTH_ERROR_MESSAGES[error.message] || error.message
        : "发生错误，请稍后再试。";

    toast.add({
      title: "回复失败",
      description: errorMessage,
      icon: "hugeicons:alert-02",
      color: "error",
    });
  } finally {
    replySubmitting.value[commentId] = false;
  }
};

const refreshAllComments = async () => {
  await refreshComments();
  await Promise.all(Object.values(commentRefs.value).map((ref) => ref?.refreshReplies()));
};

const scrollToComments = () => {
  const commentsElement = document.getElementById("comments");
  if (commentsElement) {
    commentsElement.scrollIntoView({ behavior: "smooth" });
  }
};

const { showBackToTop, scrollToTop } = inject('scrollState', {
  showBackToTop: ref(false),
  scrollToTop: () => { }
}) as {
  showBackToTop: Ref<boolean>,
  scrollToTop: () => void
};

onMounted(() => {
  subscribeComments(props.contentId, async (event) => {
    if (["create", "update", "delete"].includes(event.event)) {
      await refreshAllComments();
    }
  });

  generateRandomPlaceholder();
});

onActivated(() => {
  generateRandomPlaceholder();
  clearMainInput.value = true;
  setTimeout(() => { clearMainInput.value = false }, 100);
});
</script>