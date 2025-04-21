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

<style scoped>
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

.fade-in.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
