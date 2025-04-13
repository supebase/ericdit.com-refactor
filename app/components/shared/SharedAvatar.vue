<template>
  <div class="relative">
    <div v-if="avatarLoading && src"
      class="absolute inset-0 ring-1 ring-neutral-100 dark:ring-neutral-800 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-full">
      <UIcon :name="loadingIcon" :class="[`size-${iconSize}`, 'text-neutral-500 animate-pulse']" />
    </div>
    <NuxtImg provider="directus" :src="src" :alt="alt" :class="[sizeClass, 'rounded-full object-cover']"
      @load="onImageLoad" class="uppercase" v-bind="$attrs" />
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    loadingIcon?: string;
  }>(),
  {
    size: "md",
    loadingIcon: "svg-spinners:ring-resize",
  }
);

const avatarLoading = ref(!!props.src);

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

// 添加尺寸类计算属性
const sizeClass = computed(() => {
  const sizes = {
    xs: "w-7",
    sm: "w-8",
    md: "w-10",
    lg: "w-12",
    xl: "w-14",
  };
  return sizes[props.size] || sizes.md;
});

const onImageLoad = () => {
  avatarLoading.value = false;
};
</script>
