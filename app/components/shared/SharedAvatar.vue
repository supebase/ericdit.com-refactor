<template>
  <div class="relative">
    <div
      v-if="avatarLoading"
      class="absolute inset-0 ring-1 ring-neutral-100 dark:ring-neutral-800 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-full">
      <UIcon
        :name="loadingIcon"
        :class="[`size-${iconSize}`, 'text-neutral-500 animate-pulse']" />
    </div>
    <UAvatar
      :src="src"
      :size="size"
      @load="onImageLoad"
      loading="lazy"
      v-bind="$attrs" />
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    loadingIcon?: string;
  }>(),
  {
    size: "md",
    loadingIcon: "svg-spinners:ring-resize",
  }
);

const avatarLoading = ref(true);

// 根据不同size设置不同的图标大小
const iconSize = computed(() => {
  switch (props.size) {
    case "xs":
      return "3";
    case "sm":
      return "4";
    case "md":
      return "5";
    case "lg":
      return "6";
    case "xl":
      return "7";
    default:
      return "5";
  }
});

const onImageLoad = () => {
  avatarLoading.value = false;
};
</script>
