<template>
    <UButton v-if="canPublish" variant="link" icon="hugeicons:quill-write-02" to="/publish"
        class="size-5 text-neutral-500 cursor-pointer p-0 hover:text-neutral-500" />
</template>

<script setup lang="ts">
const { getUserRoleName, user } = useAuth();

const roleName = ref<string | null>(null);
const canPublish = computed(() => roleName.value === "Administrator");

const updateRoleName = async () => {
    roleName.value = await getUserRoleName();
};

watch(
    () => user.value,
    async (val) => {
        if (val) {
            await updateRoleName();
        } else {
            roleName.value = null;
        }
    },
    { immediate: true }
);
</script>