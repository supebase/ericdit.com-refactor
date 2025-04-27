<template>
    <div class="relative flex flex-col items-center bg-white/50 dark:bg-neutral-800/50 rounded-sm">
        <!-- 内容区块，头像与内容并排 -->
        <NuxtLink :to="{ name: 'article-id', params: { id: talk.id } }"
            class="w-full flex-1 flex flex-col items-center">
            <div class="px-4 pt-4 flex flex-row">
                <div class="min-w-11 mt-1">
                    <SharedAvatar :src="userAvatarUrl || undefined" size="sm"
                        :alt="talk.user_created.first_name" />
                </div>
                <div class="flex flex-col items-start">
                    <div class="text-neutral-500 dark:text-neutral-400 text-lg">
                        {{ cleanBody }}
                    </div>
                    <span class="block text-sm text-neutral-400 dark:text-neutral-600 mt-2">
                        大约 {{ useDateFormatter(talk.date_created) }}
                    </span>
                </div>
            </div>
            <div v-if="talk.images.length" class="w-full flex justify-center pt-3">
                <NuxtImg provider="directus" :src="talk.images?.[0]?.directus_files_id"
                    loading="eager" fetchpriority="high" preload placeholder format="webp"
                    quality="80" sizes="(max-width: 768px) 100vw, 768px"
                    class="aspect-[16/7] object-cover" />
            </div>
        </NuxtLink>
        <!-- 底部信息区 -->
        <div class="w-full flex items-center justify-end p-4 gap-10">
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
onMounted(() => {
    if (props.talk.images?.[0]) {
        const img = new Image();
        img.src = props.talk.images[0].directus_files_id;
    }
});
</script>