<template>
  <footer class="flex-none">
    <hr />
    <div class="py-4 select-none flex justify-center items-center gap-3 min-h-[3rem]">
      <div class="text-center text-sm text-neutral-400 dark:text-neutral-600 space-x-2">
        <span>2001-{{ new Date().getFullYear() }} &copy; Eric</span>
        <span class="text-neutral-300 dark:text-neutral-700 text-xs">&bull;</span>
        <span>{{ version }}（{{ useDateFormatter(buildTime) }}构建）</span>
      </div>

      <SharedColorMode />
    </div>
  </footer>
</template>

<script setup>
const version = ref("正在加载");
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
