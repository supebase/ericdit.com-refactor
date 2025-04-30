<template>
  <UApp :toaster="appConfig.toaster" :tooltip="appConfig.tooltip">
    <NuxtLayout>
      <NuxtPage />
      <!-- 版本更新提示 -->
      <UpdateNotification v-model="needsUpdate" :confirmUpdate="confirmUpdate" />
      <!-- 维护模式提示 -->
      <MaintenanceMode />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();

const MaintenanceMode = defineAsyncComponent(
  () => import("./components/shared/MaintenanceMode.vue")
);

const UpdateNotification = defineAsyncComponent(
  () => import("./components/shared/UpdateNotification.vue")
);

// 导入认证和用户状态相关的组合式函数
const { refreshUser, startSessionCheck, isAuthenticated } = useAuth();
const { updateLastActivity, updateUserStatus, cleanup: cleanupPresence } = usePresence();
const { needsUpdate, cleanup, confirmUpdate } = useVersionCheck();

// 用户活动监听相关配置
const USER_ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;
const isActivityTrackingEnabled = ref(false);
let cleanupSession: (() => void) | undefined;

// 用于存储所有事件监听的 stop 函数
let activityListeners: Array<() => void> = [];

/**
 * 启用用户活动追踪
 * @description 添加用户活动事件监听器并更新用户状态为在线
 */
const enableActivityTracking = async () => {
  // 先移除旧的监听，避免重复
  activityListeners.forEach(stop => stop());
  activityListeners = USER_ACTIVITY_EVENTS.map(event =>
    useEventListener(window, event, updateLastActivity)
  );
  isActivityTrackingEnabled.value = true;
  await updateUserStatus();
};

/**
 * 禁用用户活动追踪
 * @description 移除用户活动事件监听器
 */
const disableActivityTracking = async () => {
  activityListeners.forEach(stop => stop());
  activityListeners = [];
  isActivityTrackingEnabled.value = false;
};

const { getSettings } = useAppSettings();
const settings = ref<any>(null);

// 组件挂载时初始化用户会话
onMounted(async () => {
  if (typeof window !== 'undefined') {
    useEventListener(document, 'gesturestart', (e) => e.preventDefault())
    useEventListener(document, 'dblclick', (e) => e.preventDefault())
  }

  settings.value = await getSettings();

  try {
    await refreshUser();
    if (isAuthenticated.value) {
      await updateUserStatus();
    }
  } catch (error) {
    console.error("Failed to restore user session:", error);
  }

  if (import.meta.client) {
    cleanupSession = startSessionCheck();
  }
});

// 仅在客户端执行的逻辑
if (import.meta.client) {
  // 监听用户认证状态变化
  watch(
    isAuthenticated,
    async (newValue, oldValue) => {
      if (newValue && !isActivityTrackingEnabled.value) {
        await enableActivityTracking();
      } else if (!newValue && isActivityTrackingEnabled.value) {
        await disableActivityTracking();
        if (oldValue) {
          await updateUserStatus();
        }
      }
    },
    { immediate: true }
  );

  // 组件卸载时清理资源
  onUnmounted(() => {
    cleanupPresence();
    if (isActivityTrackingEnabled.value) {
      disableActivityTracking();
    }
    cleanupSession?.();
    cleanup();
  });
}

useHead(() => ({
  titleTemplate: settings.value?.site_name ? `%s - ${settings.value.site_name}` : "%s",
}));
</script>