<template>
  <div class="fixed inset-0 flex flex-col">
    <SharedLayoutHeader />
    <div class="flex-1 overflow-y-auto overflow-x-hidden" ref="scrollContainer">
      <main class="max-w-md sm:max-w-lg mx-auto px-5 py-16 w-full">
        <slot />
      </main>
    </div>
    <SharedLayoutFooter />
  </div>
</template>

<script setup>
const scrollContainer = ref(null)
const showBackToTop = ref(false)
const scrollHeight = ref(0)
const clientHeight = ref(0)

// 直接解构 y
const { y } = useScroll(scrollContainer, {
  throttle: 0,
  onScroll() {
    const el = scrollContainer.value
    if (el) {
      scrollHeight.value = el.scrollHeight
      clientHeight.value = el.clientHeight
    }
  }
})

// 只监听 y
watch(y, () => {
  showBackToTop.value = y.value > 150
}, { immediate: true })

const scrollToTop = () => {
  scrollContainer.value?.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

provide('scrollState', {
  showBackToTop,
  scrollToTop,
  scrollHeight,
  clientHeight
})
</script>