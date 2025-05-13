<template>
  <div ref="element" :class="{ 'fade-in': true, 'is-visible': isVisible }">
    <slot />
  </div>
</template>

<script setup>
const props = defineProps({
  delay: {
    type: Number,
    default: 0,
  },
});

const isVisible = ref(false);
const element = ref(null);

useIntersectionObserver(
  element,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      setTimeout(() => {
        isVisible.value = true;
      }, props.delay)
    }
  },
  { once: true }
)
</script>
