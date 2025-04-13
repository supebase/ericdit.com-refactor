<template>
  <UDrawer v-model:open="open" :dismissible="false" :handle="false" direction="top" inset title="最近有什么新鲜事？"
    description="分享互联网！无论是热点新闻、生活趣闻，还是个人见闻，都可以在这里和大家聊聊～" :ui="{ content: 'max-w-md mx-auto' }">
    <UIcon name="hugeicons:quill-write-02" class="size-[25px] text-neutral-400 cursor-pointer" />
    <template #body>
      <div class="flex flex-col">
        <UTextarea variant="soft" label="Content" />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end space-x-4">
        <UButton label="发布" size="lg" color="neutral" />
        <UButton label="取消" size="lg" color="neutral" variant="outline" @click="open = false" />
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
const open = ref(false);
</script>
