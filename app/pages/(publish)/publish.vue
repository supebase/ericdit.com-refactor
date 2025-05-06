<template>
    <div v-if="roleName && roleName !== 'Administrator'" class="flex items-center justify-center min-h-[50vh]">
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

const { getUserRoleName, user } = useAuth();
const roleName = ref<string | null>(null);

const checkAdmin = async () => {
    roleName.value = await getUserRoleName();
};

watch(
    () => user.value,
    async (val) => {
        if (val) {
            await checkAdmin();
        }
    },
    { immediate: true }
);

useSeo({
  site_name: "发布内容",
  site_description: '',
  seo_keywords: '',
  maintenance_mode: false,
  noindex: true,
  donate_images: [],
});
</script>