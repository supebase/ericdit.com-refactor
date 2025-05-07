<template>
  <div class="relative">
    <div v-if="imageError"
      class="absolute inset-0 flex items-center justify-center bg-neutral-800/50 rounded-md">
      <UIcon name="hugeicons:image-not-found-02" class="size-7 text-red-600" />
    </div>

    <NuxtImg :src="props.src" :alt="props.alt" :width="props.width" :height="props.height"
      placeholder loading="lazy" preload format="webp" quality="80"
      sizes="(max-width: 768px) 100vw, 768px" @error="onImageError"
      class="rounded-md w-full [&.placeholder]:blur-sm hover:scale-105 transition-transform duration-500" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  src: {
    type: String,
    default: "",
  },
  alt: {
    type: String,
    default: "",
  },
  width: {
    type: [String, Number],
    default: undefined,
  },
  height: {
    type: [String, Number],
    default: undefined,
  },
});

// 只保留错误状态
const imageError = ref(false);

// 图片加载错误处理函数
const onImageError = () => {
  imageError.value = true;
};
</script>