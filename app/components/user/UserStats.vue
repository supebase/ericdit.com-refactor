<template>
    <div class="py-2 px-4">
        <div class="text-md font-bold text-center h-6 flex items-center justify-center">
            <div v-if="isLoading" class="flex items-center justify-center">
                <UIcon name="svg-spinners:ring-resize" class="size-3.5 text-neutral-400 dark:text-neutral-500" />
            </div>
            <SharedAnimateNumber v-else :value="totalUsers" class="justify-center" />
        </div>
        <div class="text-neutral-500 text-xs text-center">注册用户</div>
    </div>
</template>

<script setup lang="ts">
const { totalUsers, isLoading } = useUserStats();
</script>