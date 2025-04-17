=<template>
  <UApp :toaster="appConfig.toaster" :tooltip="appConfig.tooltip">
    <NuxtLayout>
      <NuxtPage />

      <!-- 版本更新提示 -->
      <UpdateNotification v-model="needsUpdate" />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();

const UpdateNotification = defineAsyncComponent(
  () => import("./components/shared/UpdateNotification.vue")
);

// 导入认证和用户状态相关的组合式函数
const { refreshUser, startSessionCheck, isAuthenticated } = useAuth();
const { updateLastActivity, updateUserStatus, cleanup: cleanupPresence } = usePresence();
const { needsUpdate, cleanup } = useVersionCheck();

// 用户活动监听相关配置
const USER_ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;
let isActivityTrackingEnabled = false;
let cleanupSession: (() => void) | undefined;

/**
 * 启用用户活动追踪
 * @description 添加用户活动事件监听器并更新用户状态为在线
 */
const enableActivityTracking = async () => {
  USER_ACTIVITY_EVENTS.forEach((event) => {
    window.addEventListener(event, updateLastActivity);
  });
  isActivityTrackingEnabled = true;
  await updateUserStatus();
};

/**
 * 禁用用户活动追踪
 * @description 移除用户活动事件监听器
 */
const disableActivityTracking = async () => {
  USER_ACTIVITY_EVENTS.forEach((event) => {
    window.removeEventListener(event, updateLastActivity);
  });
  isActivityTrackingEnabled = false;
};

// 组件挂载时初始化用户会话
onMounted(async () => {
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
      if (newValue && !isActivityTrackingEnabled) {
        await enableActivityTracking();
      } else if (!newValue && isActivityTrackingEnabled) {
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
    if (isActivityTrackingEnabled) {
      disableActivityTracking();
    }
    cleanupSession?.();
    cleanup();
  });
}

useHead({
  titleTemplate: "%s - Eric",
});
</script>