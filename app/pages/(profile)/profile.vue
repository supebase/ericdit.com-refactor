<template>
  <div class="container mx-auto py-8 select-none">
    <!-- 个人信息区域 -->
    <div class="flex flex-col items-center gap-3">
      <ProfileAvatarUpload />

      <div class="flex-1 text-center">
        <div class="text-2xl font-bold mb-3">{{ user?.first_name }}</div>
        <div class="text-neutral-500 space-y-4 text-sm">
          <div class="flex items-center justify-center gap-2">
            <UBadge variant="soft" color="neutral" size="lg">{{ user?.email }}</UBadge>
          </div>
          <div class="flex items-center justify-center gap-2">
            <UIcon name="hugeicons:location-04" class="size-5" />
            <span>最近的登录活动发生在{{ user?.location }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="grid grid-cols-2 gap-4 mt-8">
      <div class="p-6 rounded-sm bg-white/50 dark:bg-neutral-950/50">
        <div class="flex justify-center">
          <SharedAnimateNumber :value="commentsCount" class="text-3xl font-bold" />
        </div>
        <div class="text-neutral-400 dark:text-neutral-500 font-medium text-center mt-2">评论数</div>
      </div>
      <div class="p-6 rounded-sm bg-white/50 dark:bg-neutral-950/50">
        <div class="flex justify-center">
          <SharedAnimateNumber :value="likesCount" class="text-3xl font-bold" />
        </div>
        <div class="text-neutral-400 dark:text-neutral-500 font-medium text-center mt-2">点赞数</div>
      </div>
    </div>

    <!-- 退出按钮 -->
    <UButton @click="handleLogout" size="xl" color="error" variant="soft" block
      :disabled="isLoading" :loading="isLoading" class="mt-10">
      <span>{{ isLoading ? "正在处理" : "退出登录" }}</span>
    </UButton>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const { user, logout } = useAuth();
const { commentsCount, likesCount, fetchStats } = useUserMetrics();
const toast = useToast();

const isLoading = ref(false);
const isStatsLoading = ref(false);
const isFirstLoad = ref(true);

// 添加重试机制和缓存控制
const loadUserStats = async (forceRefresh = false) => {
  if (!user.value?.id || (isStatsLoading.value && !forceRefresh)) return;

  try {
    isStatsLoading.value = true;

    // 添加重试逻辑
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        await fetchStats(user.value.id);
        break; // 成功获取数据，跳出循环
      } catch (error) {
        retries++;
        if (retries >= maxRetries) throw error;
        // 指数退避策略，使用 useTimeoutFn
        await new Promise((resolve) => {
          useTimeoutFn(resolve, 1000 * Math.pow(2, retries - 1))
        });
      }
    }
  } catch (error) {
    toast.add({
      title: "获取数据失败",
      description: "请稍后重试",
      color: "error",
    });
  } finally {
    isStatsLoading.value = false;
    isFirstLoad.value = false;
  }
};

const handleLogout = async () => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;
    await logout();
    navigateTo("/");
  } catch (error) {
    toast.add({
      title: "退出失败",
      description: "退出时发生错误，请稍后重试。",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

// 使用 useAsyncData 来管理数据加载状态
useAsyncData(
  "user-stats",
  async () => {
    if (user.value?.id) {
      await loadUserStats();
    }
  },
  { watch: [() => user.value?.id] }
);

onActivated(() => {
  if (!isFirstLoad.value && !isStatsLoading.value) {
    loadUserStats();
  }
});

onMounted(() => {
  loadUserStats();
});

useSeo({
  site_name: "个人资料",
  site_description: '',
  seo_keywords: '',
  maintenance_mode: false,
  noindex: true,
  donate_images: [],
});
</script>
