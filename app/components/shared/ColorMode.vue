<template>
  <UTooltip arrow :text="isDark ? '切换到浅色' : '切换到深色'">
    <div class="relative h-5 w-5 overflow-hidden">
      <div class="color-scroll" :style="{ transform: `translateY(${isDark ? -50 : 0}%)` }">
        <div class="color-cell h-5">
          <UIcon name="hugeicons:sun-02" class="size-5 text-neutral-600 dark:text-neutral-400 cursor-pointer"
            @click="toggleColorMode" />
        </div>
        <div class="color-cell h-5">
          <UIcon name="hugeicons:moon-02" class="size-5 text-neutral-600 dark:text-neutral-400 cursor-pointer"
            @click="toggleColorMode" />
        </div>
      </div>
    </div>
  </UTooltip>
</template>

<script setup lang="ts">
const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});

const toggleColorMode = () => {
  isDark.value = !isDark.value;
};

watch(colorMode, (newMode) => {
  useHead({
    meta: [{
      name: 'theme-color',
      content: newMode.value === 'dark' ? '#18181b' : '#ffffff'
    }]
  })
}, { immediate: true })
</script>

<style scoped>
.color-scroll {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 200%;
}

.color-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.25rem;
}
</style>
