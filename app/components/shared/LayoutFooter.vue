<template>
  <footer class="flex-none">
    <hr />
    <div class="py-4 select-none flex justify-center items-center gap-3 min-h-[3rem]">
      <div class="text-center text-sm text-neutral-500 space-x-2">
        <span>{{ new Date().getFullYear() }} &copy; Eric</span>
        <span class="text-neutral-300 dark:text-neutral-700 text-xs">&bull;</span>
        <span>v{{ version }}（{{ useDateFormatter(buildTime) }}构建）</span>
      </div>

      <UPopover arrow :open-delay="0" :close-delay="0">
        <UButton variant="link" class="!p-0 !h-auto cursor-pointer"
          @click="() => { if (!totalUsers) fetchTotalUsers() }">
          <UIcon name="hugeicons:user-status"
            class="size-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transform duration-500" />
        </UButton>
        <template #content>
          <UserStats />
        </template>
      </UPopover>
    </div>
  </footer>
</template>

<script setup>
const version = ref("0.0.0");
const buildTime = ref();
const { totalUsers, fetchTotalUsers } = useUserStats();

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
