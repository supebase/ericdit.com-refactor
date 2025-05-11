<template>
    <div class="flex justify-end items-center space-x-1.5">
        <UIcon name="hugeicons:tinder" :size="iconSize"
            class="text-neutral-400 dark:text-neutral-500" />
        <span class="text-sm text-neutral-400 dark:text-neutral-500 flex items-center">
            <template v-if="viewsCount < 1000">
                <SharedAnimateNumber :value="viewsCount" />
            </template>
            <template v-else>
                <span class="tabular-nums">{{ formattedViewsCount }}</span>
            </template>
        </span>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    contentId: string;
    iconSize?: number;
}>();

const { getContent, subscribeContents } = useContents();
const viewsCount = ref(0);

// 封装订阅逻辑
function useContentSubscription(contentId: string, onUpdate: () => void) {
    let unsubscribe: (() => void) | null = null;

    const start = async () => {
        if (unsubscribe) unsubscribe();
        unsubscribe = await subscribeContents(
            {
                fields: ["id", "views"],
                filter: { id: { _eq: contentId } },
            },
            async (event) => {
                if (["update"].includes(event.event)) {
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

const formatViewsCount = (num: number) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
};

const formattedViewsCount = computed(() => formatViewsCount(viewsCount.value));

const fetchViewsCount = async () => {
    try {
        const content = await getContent(props.contentId, { fields: ["views"] });
        viewsCount.value = content?.views || 0;
    } catch (error) {
        console.error("Failed to fetch views count:", error);
    }
};

let subscription = useContentSubscription(props.contentId, fetchViewsCount);

onMounted(async () => {
    await fetchViewsCount();
    await subscription.start();
});

onUnmounted(() => {
    subscription.stop();
});

watch(
    () => props.contentId,
    async (newId, oldId) => {
        if (newId !== oldId) {
            await fetchViewsCount();
            subscription.stop();
            subscription = useContentSubscription(newId, fetchViewsCount);
            await subscription.start();
        }
    }
);
</script>