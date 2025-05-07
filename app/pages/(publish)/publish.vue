<template>
    <div v-if="isLoading" class="fixed inset-0 flex justify-center items-center">
        <UIcon name="svg-spinners:ring-resize" class="size-7 text-primary-500" />
    </div>
    <div v-else-if="!isAdmin" class="flex items-center justify-center min-h-[50vh]">
        <UAlert color="error" variant="soft" icon="hugeicons:alert-02" description="您没有权限访问该页面" />
    </div>
    <div v-else class="container mx-auto py-6 select-none">
        <PublishForm />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ["auth"],
});

const { isLoading, isAdmin } = useUserRole();

useSeo({
    site_name: "发布内容",
    site_description: '',
    seo_keywords: '',
    maintenance_mode: false,
    noindex: true,
    donate_images: [],
});
</script>