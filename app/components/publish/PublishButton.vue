<template>
    <div v-if="isLoading">
        <UIcon name="svg-spinners:3-dots-scale"
            class="size-5 translate-y-[3px] text-neutral-500 dark:text-orange-200" />
    </div>
    <UButton v-else-if="isAdmin" variant="link" icon="hugeicons:file-edit" to="/publish"
        class="size-5 text-neutral-500 cursor-pointer p-0 hover:text-primary-500" />
</template>

<script setup lang="ts">
const { isLoading, isAdmin } = useUserRole();
</script>