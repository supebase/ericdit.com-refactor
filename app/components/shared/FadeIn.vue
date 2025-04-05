<script setup>
const props = defineProps({
  delay: {
    type: Number,
    default: 0,
  },
});

const isVisible = ref(false);
const element = ref(null);

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          isVisible.value = true;
        }, props.delay);
        observer.disconnect();
      }
    });
  });

  observer.observe(element.value);
});
</script>

<template>
  <div
    ref="element"
    :class="{ 'fade-in': true, 'is-visible': isVisible }">
    <slot />
  </div>
</template>

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
