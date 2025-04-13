<template>
  <UInput :model-value="modelValue" variant="soft" size="xl" :icon="icon" class="w-full" :placeholder="placeholder"
    :type="showPassword ? 'text' : 'password'" @update:model-value="$emit('update:modelValue', String($event))"
    @keydown.space.prevent :disabled="disabled">
    <template #trailing>
      <UButton color="neutral" variant="link" size="md" tabindex="-1"
        :icon="showPassword ? 'hugeicons:view-off' : 'hugeicons:view'" @click="showPassword = !showPassword" />
    </template>
  </UInput>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder: string;
  icon?: string;
  disabled?: boolean;
}>();

defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const showPassword = ref(false);

onDeactivated(() => {
  showPassword.value = false;
});
</script>
