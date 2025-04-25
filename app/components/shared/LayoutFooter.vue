<template>
  <footer class="flex-none">
    <hr />
    <div class="py-4 select-none flex justify-center items-center gap-4">
      <div class="text-center text-sm text-neutral-500 space-x-1.5">
        <span>{{ new Date().getFullYear() }} &copy; {{ settings?.site_name }}</span>
        <span class="text-neutral-300 dark:text-neutral-700 text-xs">&bull;</span>
        <span>v{{ version }}（{{ useDateFormatter(buildTime) }}构建）</span>
      </div>

      <UPopover arrow
        :ui="{ content: 'bg-white dark:bg-neutral-950', arrow: 'fill-neutral-200 dark:fill-neutral-800' }">
        <UIcon :name="wsStatus === 'OPEN' ? 'hugeicons:gps-signal-01' : 'hugeicons:gps-signal-02'"
          class="size-4 cursor-pointer"
          :class="missingConfig ? 'text-red-500' : (wsStatus === 'OPEN' ? 'text-green-500' : 'text-neutral-500 animate-pulse')" />
        <template #content>
          <div class="py-2 px-4">
            <div class="text-neutral-500 text-xs text-center flex items-center justify-center">
              <template v-if="missingConfig">
                <div>
                  <p>未配置 WebSocket 地址</p>
                  <p>请检查环境变量 DIRECTUS_WEBSOCKET_URL</p>
                </div>
              </template>
              <template v-else>
                WebSocket {{ wsStatus === 'OPEN' ? '已连接' : '连接已断开' }}
              </template>
            </div>
          </div>
        </template>
      </UPopover>

      <UPopover arrow
        :ui="{ content: 'bg-white dark:bg-neutral-950', arrow: 'fill-neutral-200 dark:fill-neutral-800' }">
        <UIcon name="hugeicons:user-status" class="size-4 text-neutral-500 cursor-pointer"
          @click="() => { if (!totalUsers) fetchTotalUsers() }" />
        <template #content>
          <UserStats />
        </template>
      </UPopover>
    </div>
  </footer>
</template>

<script setup>
const { getSettings } = useAppSettings();
const { data: settings } = useAsyncData('settings', getSettings);

const version = ref("0.0.0");
const buildTime = ref();
const { totalUsers, fetchTotalUsers } = useUserStats();
const { status: wsStatus, missingConfig } = useWebSocketStatus();

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
