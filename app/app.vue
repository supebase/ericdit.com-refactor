<template>
  <UApp
    :toaster="appConfig.toaster"
    :tooltip="appConfig.tooltip">
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
const { refreshUser, isAuthenticated } = useAuth();
const { updateLastActivity, updateUserStatus, cleanup: cleanupPresence } = usePresence();
const { needsUpdate, startVersionCheck, cleanup: cleanupVersionCheck } = useVersionCheck();

// 用户活动监听相关配置
const USER_ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;
let isActivityTrackingEnabled = false;
let activityDebounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 防抖处理用户活动更新
 * 避免频繁触发活动更新，提高性能
 */
const debouncedUpdateActivity = () => {
  if (activityDebounceTimer) {
    clearTimeout(activityDebounceTimer);
  }

  activityDebounceTimer = setTimeout(() => {
    updateLastActivity();
  }, 2000); // 2秒防抖
};

/**
 * 启用用户活动追踪
 * @description 添加用户活动事件监听器并更新用户状态为在线
 */
const enableActivityTracking = async () => {
  USER_ACTIVITY_EVENTS.forEach((event) => {
    window.addEventListener(event, debouncedUpdateActivity);
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
    window.removeEventListener(event, debouncedUpdateActivity);
  });
  if (activityDebounceTimer) {
    clearTimeout(activityDebounceTimer);
    activityDebounceTimer = null;
  }
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
    startVersionCheck();
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
    cleanupVersionCheck();
    if (isActivityTrackingEnabled) {
      disableActivityTracking();
    }
  });
}

useHead({
  titleTemplate: "%s - Eric",
});
</script>
