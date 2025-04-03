<template>
  <footer class="flex-none">
    <hr />
    <div class="py-4 select-none">
      <div class="text-center text-sm text-neutral-600 space-x-2">
        <span>2001-{{ new Date().getFullYear() }} &copy; Eric</span>
        <span>&bull;</span>
        <span>{{ version }}（{{ useDateFormatter(buildTime) }}）</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
const version = ref();
const buildTime = ref();

onMounted(async () => {
  try {
    const response = await $fetch("/version.json", {
      headers: { "Cache-Control": "no-cache" },
    });
    version.value = response.version || "未知版本";
    buildTime.value = response.buildTime || "未知时间";
  } catch (error) {
    version.value = "未知版本";
    buildTime.value = "未知时间";
  }
});
</script>
