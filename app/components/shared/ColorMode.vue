<template>
  <UIcon
    :name="isDark ? 'hugeicons:moon-02' : 'hugeicons:sun-02'"
    class="size-4 text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transform duration-500 cursor-pointer"
    @click="isDark = !isDark" />
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
