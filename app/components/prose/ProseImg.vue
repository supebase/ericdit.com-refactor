<template>
  <div class="relative">
    <!-- 加载动画 -->
    <div
      v-if="imageLoading && !imageError"
      class="absolute inset-0 flex items-center justify-center bg-neutral-800 rounded-lg">
      <UIcon
        name="hugeicons:image-03"
        class="size-7 text-neutral-600 animate-pulse" />
    </div>

    <!-- 图片加载错误显示 -->
    <div
      v-if="imageError"
      class="absolute inset-0 flex items-center justify-center bg-neutral-800/50 rounded-lg">
      <UIcon
        name="hugeicons:image-not-found-02"
        class="size-7 text-red-600" />
    </div>

    <!-- 图片组件 -->
    <component
      :is="ImageComponent"
      :src="refinedSrc"
      :alt="props.alt"
      :width="props.width"
      :height="props.height"
      loading="lazy"
      @load="onImageLoad"
      @error="onImageError" />
  </div>
</template>

<script setup lang="ts">
import { withTrailingSlash, withLeadingSlash, joinURL } from "ufo";
import { useRuntimeConfig, computed } from "#imports";

import ImageComponent from "#build/mdc-image-component.mjs";

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

const refinedSrc = computed(() => {
  if (!props.src) return "";

  if (props.src.startsWith("/") && !props.src.startsWith("//")) {
    const _base = withLeadingSlash(withTrailingSlash(useRuntimeConfig().app.baseURL));
    if (_base !== "/" && !props.src.startsWith(_base)) {
      return joinURL(_base, props.src);
    }
  }
  return props.src;
});

// 图片状态
const imageLoading = ref(true);
const imageError = ref(false);

// 图片加载完成处理函数
const onImageLoad = () => {
  imageLoading.value = false;
};

// 图片加载错误处理函数
const onImageError = () => {
  imageLoading.value = false;
  imageError.value = true;
};
</script>
