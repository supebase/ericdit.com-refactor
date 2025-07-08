<template>
    <UDrawer
        :ui="{ overlay: 'backdrop-blur-xs', header: 'hidden', content: 'ring-0 bg-neutral-100 dark:bg-neutral-900', container: 'ml-3', handle: '!bg-neutral-300 dark:!bg-accented' }"
        handle-only direction="right" v-model:open="open" title="最新评论" description="查看最新评论">
        <UButton variant="link" icon="hugeicons:comment-01"
            class="size-5 text-neutral-500 cursor-pointer p-0 hover:text-primary-500" />
        <template #body>
            <div class="select-none w-[280px] py-3 overflow-x-hidden flex flex-col h-[calc(100vh-32px)]">
                <UAlert v-if="error" :ui="{ wrapper: 'flex items-center' }" color="error" variant="soft"
                    :description="error?.message || '加载最新评论失败，请稍后重试。'" class="mt-6">
                </UAlert>
                <div v-else-if="isLoading && !recentComments.length"
                    class="fixed inset-0 flex justify-center items-center">
                    <div class="flex flex-col justify-center items-center space-y-3">
                        <UProgress animation="swing" color="primary" size="sm" class="max-w-[110px]" />
                        <div class="text-sm text-neutral-400 dark:text-neutral-600">正在加载最新评论</div>
                    </div>
                </div>
                <template v-else>
                    <UAlert v-if="!recentComments.length" :ui="{ wrapper: 'flex items-center' }" color="neutral"
                        variant="soft" description="暂无最新评论"
                        class="mt-6 text-neutral-500 relative overflow-hidden alert-diagonal-bg">
                    </UAlert>
                    <div v-else class="flex flex-col flex-1 min-h-0">
                        <USeparator type="dashed" class="mb-4 shrink-0">
                            <span class="text-neutral-400 dark:text-neutral-600 text-sm">最新评论</span>
                        </USeparator>
                        <div class="flex-1 min-h-0 overflow-auto">
                            <TransitionGroup name="fade-slide" tag="div">
                                <div v-for="(comment, index) in recentComments" :key="comment.id" class="mb-4 flex">
                                    <SharedAvatar :src="comment.user_created?.avatar" size="xs"
                                        class="mt-0.5 shrink-0" />
                                    <div
                                        class="flex-1 ml-2 py-2 px-3 rounded-md bg-white dark:bg-neutral-800/60 break-words">
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="font-medium text-sm text-neutral-800 dark:text-neutral-200">{{
                                                comment.user_created?.first_name
                                                }}</span>
                                            <span class="text-xs text-neutral-500 ml-auto">
                                                {{ useDateFormatter(comment.date_created) }}
                                            </span>
                                        </div>
                                        <div class="text-neutral-700 dark:text-neutral-300 text-sm break-all">
                                            {{ comment.comment }}
                                        </div>
                                    </div>
                                </div>
                            </TransitionGroup>
                        </div>
                    </div>
                </template>
            </div>
        </template>
    </UDrawer>
</template>

<script setup lang="ts">
import type { RecentComment } from "~/types";

const props = defineProps<{
    limit?: number
}>();

const { getRecentComments, subscribeComments } = useComments();

const open = ref(false);
const isLoading = ref(true);
const error = ref<Error | null>(null);
const recentComments = ref<RecentComment[]>([]);

// 清理函数管理
const { addCleanup, runCleanup } = createCleanup();

const fetchRecentComments = async () => {
    if (!open.value) return;
    isLoading.value = true;
    error.value = null;
    try {
        const newComments = await getRecentComments({
            fields: ["id", "comment", "user_created.*", "date_created", "parent_comment_id.*"],
            sort: ["-date_created"],
            limit: props.limit || 5,
        }) || [];
        recentComments.value = newComments;
    } catch (e: any) {
        error.value = e;
        recentComments.value = [];
    } finally {
        isLoading.value = false;
    }
};

// 处理评论更新
const handleCommentUpdate = (updatedComment: RecentComment) => {
    // 检查是否为新评论
    const existingIndex = recentComments.value.findIndex(c => c.id === updatedComment.id);
    if (existingIndex === -1) {
        // 新评论，添加到列表开头
        recentComments.value.unshift(updatedComment);
        // 保持列表长度限制
        if (props.limit && recentComments.value.length > props.limit) {
            recentComments.value.pop();
        }
    } else {
        // 更新现有评论
        recentComments.value[existingIndex] = updatedComment;
    }
};

watch(open, async (val) => {
    if (val) {
        await fetchRecentComments();
        // 订阅评论更新
        const cleanup = await subscribeComments("", handleCommentUpdate);
        addCleanup(cleanup);
    } else {
        runCleanup();
    }
});

onUnmounted(() => {
    runCleanup();
});
</script>