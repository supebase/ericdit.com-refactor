<template>
  <UModal
    :dismissible="false"
    :open="modelValue"
    @update:open="$emit('update:modelValue', $event)">
    <template #content>
      <UCard>
        <div class="flex items-center gap-3">
          <UIcon
            name="hugeicons:refresh"
            class="size-5" />
          <div class="text-base font-bold">发现新版本</div>
        </div>

        <div class="text-sm text-neutral-400 mt-4">
          检测到新版构建已就位！立即刷新，解锁最新优化内容。
        </div>

        <template #footer>
          <div class="flex justify-center">
            <UButton
              color="primary"
              variant="soft"
              @click="refreshPage">
              立即刷新
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const refreshPage = () => {
  window.location.reload();
};
</script>
