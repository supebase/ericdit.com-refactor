<template>
    <div class="relative flex flex-col items-center bg-white/50 dark:bg-neutral-800/50 rounded-md">
        <NuxtLink :to="{ name: 'article-id', params: { id: talk.id } }" :aria-label="talk.id"
            class="w-full flex-1 flex flex-col items-center">
            <div v-if="talk.images?.length" class="w-full flex justify-center relative">
                <NuxtImg provider="directus" :src="talk.images?.[0]?.directus_files_id" alt="预览图片"
                    loading="eager" fetchpriority="high" preload placeholder format="webp"
                    quality="80" sizes="(max-width: 768px) 100vw, 768px"
                    class="aspect-[16/4] object-cover rounded-t-md w-full mask-b-from-0" />
                <!-- 悬浮头像（有图片时带outline） -->
                <div
                    class="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-10 rounded-full outline-3 outline-neutral-100/50 dark:outline-neutral-800/50">
                    <SharedAvatar :src="userAvatarUrl || undefined" size="md"
                        :alt="talk.user_created.first_name" />
                </div>
            </div>
            <!-- 无图片时仅显示头像（不带outline） -->
            <div v-else class="w-full flex justify-center relative pt-4">
                <div class="rounded-full">
                    <SharedAvatar :src="userAvatarUrl || undefined" size="md"
                        :alt="talk.user_created.first_name" />
                </div>
            </div>
            <div class="px-4 flex flex-col justify-center items-center w-full"
                :class="talk.images?.length ? 'pt-6' : 'pt-1'">
                <div class="flex flex-col items-center mt-2">
                    <div
                        class="text-neutral-500 dark:text-neutral-400 text-base text-center italic">
                        {{ cleanBody }}
                    </div>
                    <div
                        class="block text-sm text-neutral-400 dark:text-neutral-600 mt-2 text-center">
                        {{ useDateFormatter(talk.date_created) }}
                    </div>
                </div>
            </div>
        </NuxtLink>
        <!-- 底部信息区，居中 -->
        <div class="w-full flex items-center justify-center p-4 gap-10">
            <div class="flex items-center gap-1 group">
                <SharedLikeButton :content-id="talk.id" :icon-size="21" likeType="clap" />
            </div>
            <div class="flex items-center gap-1 group">
                <SharedCommentCounter :content-id="talk.id" :allow-comments="talk.allow_comments"
                    :icon-size="18" />
            </div>
            <div class="flex items-center gap-1 group">
                <SharedContentViews :content-id="talk.id" :icon-size="19" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ContentItem } from "~/types";

const props = defineProps<{
    talk: ContentItem;
}>();

const { cleanMarkdown } = useContents();
const { getUserAvatarUrl } = useUserMeta();

const userAvatarUrl = computed(() =>
    getUserAvatarUrl(props.talk.user_created.id, props.talk.user_created.avatar)
);

// 处理后的文本内容
const cleanBody = computed(() => cleanMarkdown(props.talk.body));

// 预加载图片
watch(
    () => props.talk.images?.[0]?.directus_files_id,
    (imgSrc) => {
        if (imgSrc) {
            const img = new window.Image();
            img.src = imgSrc;
        }
    },
    { immediate: true }
);
</script>