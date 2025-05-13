<template>
    <div v-if="!isLoaded"
        class="flex flex-col items-center justify-center mx-auto pt-3 space-y-3 h-[100px] bg-white/50 dark:bg-neutral-800/50 rounded-md">
        <UProgress animation="swing" color="primary" size="sm" class="max-w-[130px]" />
        <div class="text-sm text-neutral-400 dark:text-neutral-600">正在获取 GitHub 数据</div>
    </div>
    <div v-else-if="error">
        <UAlert :ui="{ wrapper: 'flex items-center' }" color="error" variant="soft" :description="error">
        </UAlert>
    </div>
    <div v-else-if="projectInfo">
        <div
            class="flex flex-col bg-white/50 dark:bg-neutral-800/50 relative w-full justify-center rounded-md overflow-hidden">
            <div class="p-4 flex flex-col justify-between relative">
                <div class="flex justify-between items-center mb-1.5 z-2">
                    <div class="flex flex-col gap-2.5">
                        <a :href="`https://github.com/${projectInfo.owner}/${projectInfo.repo}`"
                            rel="noopener noreferrer" target="_blank" class="flex items-center text-base space-x-1.5"
                            tabindex="-1">
                            <SharedAvatar :src="projectInfo.projectAvatarUrl" size="2xs"
                                :alt="projectInfo.projectAuthor" />
                            <span class="text-neutral-400 dark:text-neutral-500 ml-0.5">{{
                                projectInfo.projectAuthor }}</span>
                            <span class="text-neutral-300 dark:text-neutral-700">/</span>
                            <span class="text-primary-500 font-bold">{{ projectInfo.repo }}</span>
                        </a>
                        <div class="text-neutral-400 dark:text-neutral-500 space-y-1">
                            <span class="text-neutral-500 dark:text-neutral-400 line-clamp-3">
                                {{ projectInfo.projectDescription }}</span>
                        </div>
                    </div>
                </div>
                <div class="flex justify-between mt-3">
                    <a :href="`https://github.com/${projectInfo.owner}/${projectInfo.repo}/stargazers`"
                        rel="noopener noreferrer" target="_blank"
                        class="flex items-center space-x-1.5 text-neutral-400 dark:text-neutral-500">
                        <UIcon name="hugeicons:star" class="size-[18px]" />
                        <div class="tabular-nums text-sm mt-[3px]">{{
                            formatStarCount(projectInfo.stargazersCount) }}
                        </div>
                    </a>
                    <UBadge variant="soft" color="primary" class="z-2">
                        {{ projectInfo.mainLanguage }}
                    </UBadge>
                    <UBadge variant="soft" color="neutral" class="z-2">
                        <a :href="`https://github.com/${projectInfo.owner}/${projectInfo.repo}/watchers`"
                            rel="noopener noreferrer" target="_blank">{{ projectInfo.watchersCount }} 人关注</a>
                    </UBadge>
                    <UBadge variant="soft" color="neutral" class="z-2">
                        {{ formattedDate }}更新
                    </UBadge>
                </div>

                <UIcon name="hugeicons:github"
                    class="z-1 text-[14em] text-neutral-300/20 dark:text-neutral-950/20 absolute -top-6 -right-10" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    githubRepo: string;
}>();

const { isLoaded, projectInfo, error, fetchProjectInfo } = useGithubRepo(props.githubRepo);

const formattedDate = computed(() => {
    return projectInfo.value?.projectUpdatedAt
        ? useDateFormatter(projectInfo.value.projectUpdatedAt)
        : ""
})

// 使用 Intl.NumberFormat 优雅格式化星标数量
const formatStarCount = (num: number) => {
    if (num >= 1000) {
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(num);
    }
    return num.toString();
};

// 使用 watchEffect 监听 githubRepo 变化自动刷新
watchEffect(() => {
    fetchProjectInfo();
});
</script>