<template>
    <UButton v-if="isAdmin" variant="link" icon="hugeicons:quill-write-02" to="/publish"
        class="size-5 text-neutral-500 cursor-pointer p-0 hover:text-neutral-500" />
</template>

<script setup lang="ts">
const { isAdmin } = useUserRole();
</script>