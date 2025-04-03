<template>
  <UDrawer
    v-model="isOpen"
    handle-only>
    <UIcon
      name="hugeicons:quill-write-02"
      class="size-[25px] text-neutral-400 cursor-pointer" />
    <template #content>
      <div class="h-screen m-4">
        <UCard variant="soft">
          <div class="text-center text-sm text-neutral-500">TODO: 用户发表内容</div>
        </UCard>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
const isOpen = ref(false);
</script>
