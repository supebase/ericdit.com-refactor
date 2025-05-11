<template>
  <div class="relative">
    <div v-if="avatarLoading && src"
      class="absolute inset-0 ring-1 ring-neutral-100 dark:ring-neutral-800 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 rounded-full">
      <UIcon :name="loadingIcon" :class="[sizeClass, 'text-neutral-500 scale-50']" />
    </div>

    <template v-if="src">
      <NuxtImg v-if="!isExternal" :provider="provider" :src="src" :alt="alt"
        :class="[sizeClass, 'rounded-full object-cover']" @load="onImageLoad" v-bind="$attrs" />
      <NuxtImg v-else :src="src" :alt="alt" :class="[sizeClass, 'rounded-full object-cover']"
        @load="onImageLoad" v-bind="$attrs" />
    </template>
    <template v-else>
      <div :class="[
        sizeClass,
        'rounded-full flex items-center justify-center',
        textSizeClass,
        'ring-1 ring-neutral-50 dark:ring-neutral-800',
        'bg-neutral-50 dark:bg-neutral-800'
      ]">
        <span class="text-neutral-400 dark:text-neutral-600 font-medium">{{ avatarText }}</span>
      </div>
    </template>
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    provider?: string;
    src?: string;
    alt?: string;
    size?: "2xs" | "xs" | "sm" | "2sm" | "md" | "lg" | "xl";
    loadingIcon?: string;
  }>(),
  {
    provider: "directus",
    size: "md",
    loadingIcon: "svg-spinners:ring-resize",
  }
);

// 添加尺寸类计算属性
const sizeMap = {
  "2xs": "w-6 h-6",
  xs: "w-7 h-7",
  sm: "w-8 h-8",
  "2sm": "w-9 h-9",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-14 h-14",
};

const sizeClass = computed(() => sizeMap[props.size] || sizeMap.md);
const textSizeClass = sizeClass;

const avatarText = computed(() => {
  if (!props.alt) return '?';
  return props.alt.charAt(0).toUpperCase();
});

const isExternal = computed(() => {
  return !!props.src && /^https?:\/\//.test(props.src);
});

const avatarLoading = ref(!!props.src);

const onImageLoad = () => {
  avatarLoading.value = false;
};
</script>
