<template>
    <UIcon v-if="canPublish" name="hugeicons:quill-write-02"
        class="size-5 text-neutral-500 cursor-pointer" />
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