<template>
  <UInput :model-value="modelValue" variant="soft" size="xl" :icon="icon" class="w-full"
    :placeholder="placeholder" :type="showPassword ? 'text' : 'password'"
    @update:model-value="$emit('update:modelValue', String($event))" @keydown.space.prevent
    :disabled="disabled">
    <template #trailing>
      <div class="flex items-center space-x-3">
        <slot />
        <UButton color="neutral" variant="link" size="md" tabindex="-1"
          :icon="showPassword ? 'hugeicons:view-off' : 'hugeicons:view'"
          :ui="{ leadingIcon: 'size-5' }"
          @click="togglePassword()" />
      </div>
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

const [showPassword, togglePassword] = useToggle(false);

onDeactivated(() => {
  showPassword.value = false;
});
</script>
