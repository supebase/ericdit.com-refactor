<template>
  <UModal :dismissible="false" :open="modelValue" @update:open="$emit('update:modelValue', $event)"
    title="更新提示" description="刷新后同步最新版本"
    :ui="{ overlay: 'backdrop-blur-xs backdrop-grayscale-100' }">
    <template #content>
      <UCard class="select-none bg-neutral-100 dark:bg-neutral-900">
        <div class="flex items-center gap-3">
          <UIcon name="hugeicons:refresh" class="size-5" />
          <div class="text-base font-bold">发现新版本</div>
        </div>

        <div class="text-sm text-neutral-400 mt-4">
          检测到新版构建已就位！立即刷新，解锁最新优化内容。
        </div>

        <template #footer>
          <div class="flex justify-center">
            <UButton size="xl" color="primary" variant="soft" @click="handleUpdate">
              立即刷新
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  confirmUpdate: () => void;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const handleUpdate = () => {
  props.confirmUpdate?.();
  window.location.reload();
};
</script>
