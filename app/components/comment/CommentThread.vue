<template>
  <div class="select-none pb-10">
    <div class="fixed bottom-17 z-30 left-1/2 -translate-x-1/2">
      <UButtonGroup
        class="shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm bg-white/90 dark:bg-neutral-800/90">
        <UButton :ui="{
          base: 'rounded-[calc(var(--ui-radius)*2)] transition-transform duration-200 hover:bg-white dark:hover:bg-neutral-800',
        }" color="neutral" variant="ghost" size="lg">
          <SharedLikeButton :content-id="contentId" :icon-size="20" likeType="clap" />
        </UButton>
        <USeparator :ui="{ border: 'border-neutral-300 dark:border-neutral-600' }" class="h-4 w-2 my-auto"
          orientation="vertical" />
        <UButton :ui="{
          base: 'rounded-[calc(var(--ui-radius)*2)] transition-transform duration-200 hover:bg-white dark:hover:bg-neutral-800',
        }" color="neutral" variant="ghost" size="lg" class="cursor-pointer">
          <SharedCommentCounter :content-id="contentId" :allow-comments="allowComments" :icon-size="18"
            @click="scrollToComments" />
        </UButton>
      </UButtonGroup>
    </div>

    <!-- 1. 首先判断评论功能是否关闭 -->
    <UAlert v-if="!allowComments" :ui="{ wrapper: 'flex items-center' }" color="warning" variant="soft"
      description="本页面评论功能已关闭。" class="mb-8">
    </UAlert>

    <template v-else>
      <!-- 2. 评论加载出错显示错误信息 -->
      <UAlert v-if="error" :ui="{ wrapper: 'flex items-center' }" color="error" variant="soft"
        :description="error?.message || '加载评论失败，请稍后重试。'" class="mb-8">
      </UAlert>

      <!-- 3. 评论加载中显示加载动画 -->
      <div v-else-if="isLoading && !comments" class="flex flex-col justify-center items-center space-y-3 mb-8">
        <UProgress animation="swing" color="neutral" size="sm" class="max-w-[80px]" />
        <div class="text-sm text-neutral-400 dark:text-neutral-600">正在加载评论</div>
      </div>

      <!-- 4. 没有评论时显示提示 -->
      <template v-else>
        <UAlert v-if="!totalComments" :ui="{ wrapper: 'flex items-center' }" color="neutral" variant="soft"
          description="暂无评论，快来发表你的观点吧！" class="mb-8 text-neutral-500">
        </UAlert>

        <!-- 5. 有评论时显示评论数量 -->
        <!-- <USeparator
          v-else
          class="mt-3">
          <div class="text-neutral-400 dark:text-neutral-600 text-sm nums tabular-nums">
            <span> 有 {{ totalComments }} 条评论，快来加入讨论！ </span>
          </div>
        </USeparator> -->

        <!-- 评论编辑器和评论列表保持不变 -->
        <div id="comments">
          <div class="transform transition-all duration-300 ease-in-out" :class="showMainCommentForm
              ? 'translate-y-0 opacity-100 max-h-[200px]'
              : '-translate-y-3 opacity-0 max-h-0 overflow-hidden'
            ">
            <div :class="!totalComments ? 'mb-8' : ''">
              <CommentEditor :is-submitting="isSubmitting" :placeholder="randomPlaceholder" @submit="handleSubmit" />
            </div>
          </div>
        </div>

        <div v-if="rootComments.length" class="mb-8">
          <CommentThreadItem v-for="comment in rootComments" :key="comment.id" :comment="comment"
            :is-replying="activeReplyId === comment.id" @reply="handleReply" @reply-start="handleReplyStart(comment.id)"
            @reply-end="handleReplyEnd" :ref="(el) => setCommentRef(comment.id, el)" />
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
const showMainCommentForm = ref(true);
const activeReplyId = ref<string | null>(null);
const commentRefs = ref<Record<string, { refreshReplies: () => Promise<void> }>>({});

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

const handleReplyEnd = () => {
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
  try {
    isSubmitting.value = true;
    await createComment({
      content_id: props.contentId,
      parent_comment_id: commentId,
      comment: content.trim(),
    });

    const targetRef = commentRefs.value[commentId];
    if (targetRef) {
      await targetRef.refreshReplies();
    }

    toast.add({
      title: "回复成功",
      description: "您的回复已发表成功，非常感谢。",
      icon: "hugeicons:checkmark-circle-02",
      color: "success",
    });
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
    isSubmitting.value = false;
    handleReplyEnd();
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

onMounted(() => {
  subscribeComments(props.contentId, async (event) => {
    if (["create", "update", "delete"].includes(event.event)) {
      await refreshAllComments();
    }
  });

  generateRandomPlaceholder();
});

onActivated(generateRandomPlaceholder);
</script>
