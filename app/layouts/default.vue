<template>
  <div class="fixed inset-0 flex flex-col">
    <SharedLayoutHeader />
    <div class="flex-1 overflow-y-auto overflow-x-hidden" ref="scrollContainer">
      <main class="max-w-md sm:max-w-lg mx-auto px-5 py-16 w-full">
        <slot :isNearBottom="isNearBottom" />
      </main>
    </div>
    <SharedLayoutFooter />
  </div>
</template>

<script setup>
const scrollContainer = ref(null)
const isNearBottom = ref(false)
const showBackToTop = ref(false)

const threshold = 100

let y = ref(0)
let scrollHeight = ref(0)
let clientHeight = ref(0)

onMounted(() => {
  // 绑定 useScroll 到自定义容器
  const { y: scrollY } = useScroll(scrollContainer, {
    throttle: 0,
    onScroll(e) {
      // 兼容性处理
      const el = scrollContainer.value
      if (el) {
        scrollHeight.value = el.scrollHeight
        clientHeight.value = el.clientHeight
      }
    }
  })
  y = scrollY

  // 监听 y 变化
  watch([y, scrollHeight, clientHeight], () => {
    isNearBottom.value = scrollHeight.value - (y.value + clientHeight.value) < threshold
    showBackToTop.value = y.value > 150
  }, { immediate: true })
})

const scrollToTop = () => {
  scrollContainer.value?.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

provide('scrollState', {
  isNearBottom,
  showBackToTop,
  scrollToTop,
  scrollHeight,
  clientHeight
})
</script>