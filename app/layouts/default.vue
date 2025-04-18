<template>
  <div class="fixed inset-0 flex flex-col">
    <SharedLayoutHeader />

    <div class="flex-1 overflow-y-auto overflow-x-hidden" ref="scrollContainer">
      <main class="max-w-md mx-auto px-5 w-full">
        <slot :isNearBottom="isNearBottom" />
      </main>
    </div>

    <SharedLayoutFooter />
  </div>
</template>

<script setup>
const scrollContainer = ref(null);
const isNearBottom = ref(false);
const showBackToTop = ref(false);

// 使用防抖优化滚动事件
const handleScroll = () => {
  if (!scrollContainer.value) return;

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
  const threshold = 100;

  isNearBottom.value = scrollHeight - (scrollTop + clientHeight) < threshold;
  showBackToTop.value = scrollTop > 150;
};

const scrollToTop = () => {
  scrollContainer.value?.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 添加事件监听
onMounted(() => {
  const container = scrollContainer.value;
  if (container) {
    container.addEventListener('scroll', handleScroll, { passive: true });
  }
});

// 移除事件监听
onBeforeUnmount(() => {
  const container = scrollContainer.value;
  if (container) {
    container.removeEventListener('scroll', handleScroll);
  }
});

// 提供滚动状态
provide('scrollState', {
  isNearBottom,
  showBackToTop,
  scrollToTop
});
</script>
