<template>
  <UTooltip arrow :text="isDark ? '切换到浅色' : '切换到深色'">
    <UIcon :name="isDark ? 'hugeicons:moon-02' : 'hugeicons:sun-02'"
      class="size-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transform duration-500 cursor-pointer"
      @click="isDark = !isDark" />
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
</script>
