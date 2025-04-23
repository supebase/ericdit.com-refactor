<template>
  <UTooltip arrow :text="isDark ? '切换到浅色' : '切换到深色'">
    <div class="relative h-5 w-5 overflow-hidden">
      <div class="color-scroll" :style="{ transform: `translateY(${isDark ? -50 : 0}%)` }">
        <div class="color-cell h-5">
          <UIcon name="hugeicons:sun-02" class="size-5 text-neutral-500 cursor-pointer"
            @click="toggleColorMode" />
        </div>
        <div class="color-cell h-5">
          <UIcon name="hugeicons:moon-02" class="size-5 text-neutral-500 cursor-pointer"
            @click="toggleColorMode" />
        </div>
      </div>
    </div>
  </UTooltip>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();
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

const neutral = appConfig.ui?.colors?.neutral || 'zinc';

// TailwindCSS 预设色板
const tailwindColors = {
  zinc: { light: '#e4e4e7', dark: '#18181b' },
  neutral: { light: '#e5e5e5', dark: '#171717' },
  stone: { light: '#e7e5e4', dark: '#1c1917' },
  gray: { light: '#e5e7eb', dark: '#111827' },
  slate: { light: '#e2e8f0', dark: '#0f172a' },
};

const themeColors = tailwindColors[neutral as keyof typeof tailwindColors] || tailwindColors['zinc'];

watch(colorMode, (newMode) => {
  useHead({
    meta: [{
      name: 'theme-color',
      content: newMode.value === 'dark' ? themeColors.dark : themeColors.light,
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
