<template>
  <article class="py-5 space-y-5">
    <div
      class="text-2xl font-bold"
      v-if="content.title">
      {{ content.title }}
    </div>
    <div
      class="flex justify-between items-center text-sm text-neutral-500 tabular-nums select-none">
      <div class="flex items-center space-x-3">
        <div>
          <SharedAvatar
            :src="userAvatarUrl || undefined"
            size="2sm"
            :alt="content.user_created.first_name" />
        </div>
        <div class="flex flex-col">
          <div class="text-[15px] text-neutral-700 dark:text-neutral-300 font-bold">
            {{ content.user_created.first_name }}
          </div>
          <div class="flex items-center text-[13px] space-x-2">
            <div>
              {{ useDateFormatter(content.date_created)
              }}{{ content.title ? "发布" : "留下这条状态" }}
            </div>
            <span
              v-if="content.title"
              class="text-neutral-400 dark:text-neutral-600"
              >&bull;</span
            >
            <div v-if="content.title">阅读约 {{ useArticleMetrics(content.body) }}</div>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <SharedBookmarkButton
          :content-id="content.id"
          :icon-size="19"
          v-if="content.title" />
        <UModal
          v-model:open="showDeleteModal"
          :ui="{ overlay: 'backdrop-blur-xs', content: 'bg-neutral-50 dark:bg-neutral-950' }"
          title="Delete"
          description="删除内容">
          <UIcon
            name="svg-spinners:ring-resize"
            class="size-5"
            v-if="isLoading" />
          <UIcon
            name="hugeicons:delete-01"
            v-else-if="isAdmin"
            class="size-5 cursor-pointer"
            @click="showDeleteModal = true" />
          <template #content>
            <div class="p-6">
              <div class="text-lg font-bold mb-2">丢进垃圾桶</div>
              <div class="mb-4 text-neutral-600 dark:text-neutral-400">
                确定要删除该内容吗？此操作不可恢复。
              </div>
              <div class="flex justify-end space-x-2">
                <UButton
                  color="neutral"
                  label="取消"
                  @click="showDeleteModal = false" />
                <UButton
                  color="error"
                  label="确认删除"
                  :loading="isDeleting"
                  :disabled="isDeleting"
                  @click="handleDelete" />
              </div>
            </div>
          </template>
        </UModal>
      </div>
    </div>

    <Suspense>
      <template #default>
        <MDCCached
          :value="content.body"
          class="prose dark:prose-invert mdc-prose" />
      </template>
      <template #fallback>
        <div
          class="flex justify-center items-center text-neutral-400 dark:text-neutral-700 space-x-2 h-42 animate-pulse">
          <UIcon
            name="hugeicons:ai-content-generator-01"
            class="size-6" />
          <div class="text-sm">正在渲染，请稍等。</div>
        </div>
      </template>
    </Suspense>

    <div class="flex justify-between items-center select-none py-2">
      <div class="flex-1 flex justify-start">
        <SharedContentViews
          :content-id="content.id"
          :icon-size="20" />
      </div>
      <div class="flex-1 flex justify-center">
        <Donate>
          <UIcon
            name="hugeicons:qr-code"
            class="size-5 text-neutral-400 dark:text-neutral-500 hover:text-primary-500 cursor-pointer" />
        </Donate>
      </div>
      <div class="flex-1 flex justify-end">
        <UIcon
          name="hugeicons:share-05"
          class="size-5 text-neutral-400 dark:text-neutral-500 hover:text-primary-500 cursor-pointer"
          @click="shareButton(content.title, getPreviewText(content.body))" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { isClient } from "@vueuse/shared";
import type { ContentItem } from "~/types";
import Donate from "~/components/shared/Donate.vue";

const { deleteContent, incrementContentViews } = useContents();
const toast = useToast();

const { isAdmin, isLoading } = useUserRole();

const props = defineProps<{
  content: ContentItem;
}>();

const showDeleteModal = ref(false);
const isDeleting = ref(false);

const handleDelete = async () => {
  isDeleting.value = true;
  try {
    await deleteContent(props.content.id);
    toast.add({
      title: "删除成功",
      description: "内容已被成功删除。",
      icon: "hugeicons:checkmark-circle-02",
      color: "success",
    });
    showDeleteModal.value = false;
    navigateTo("/");
  } catch (error: any) {
    toast.add({
      title: "删除失败",
      description: error?.message || "删除内容失败，请稍后重试。",
      icon: "hugeicons:alert-02",
      color: "error",
    });
  } finally {
    isDeleting.value = false;
  }
};

const { getUserAvatarUrl } = useUserMeta();

const userAvatarUrl = computed(() =>
  getUserAvatarUrl(props.content.user_created.id, props.content.user_created.avatar)
);

const { share, isSupported } = useShare();

const shareButton = (title: string, text: string) => {
  if (isSupported) {
    return share({
      title: title,
      text: text,
      url: isClient ? location.href : "",
    }).catch((err) => err);
  } else {
    toast.add({
      title: "分享通知",
      description: "当前浏览器不支持分享功能。",
      icon: "hugeicons:share-05",
      color: "warning",
    });
  }
};

// 添加预览文本处理函数
const getPreviewText = (text: string) => {
  const maxLength = 50; // 设置预览文本的最大长度
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

// 创建一个异步组件包装器，仅测试加载效果
// const MDC = defineAsyncComponent(async () => {
// 添加延迟用于测试
//   await new Promise((resolve) => setTimeout(resolve, 300000));
//   return import("~/app.vue");
// });

onMounted(() => {
  if (props.content.id) {
    incrementContentViews(props.content.id);
  }
});
</script>
