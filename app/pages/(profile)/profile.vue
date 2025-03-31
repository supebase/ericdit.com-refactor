<template>
  <div class="container mx-auto py-8 select-none">
    <div class="rounded-lg">
      <div class="flex items-center gap-4">
        <ProfileAvatarUpload />
        <div class="w-full">
          <div class="text-2xl font-bold">{{ user?.first_name }}</div>
          <div class="text-neutral-500 flex justify-between items-center">
            <div>{{ user?.email }}</div>
            <div class="text-sm text-neutral-500 flex items-center space-x-2">
              <UIcon
                v-if="user?.location"
                name="hugeicons:location-04"
                class="size-4" />
              <div>{{ user?.location }}</div>
            </div>
          </div>
        </div>
      </div>

      <UAlert
        color="neutral"
        variant="soft"
        icon="hugeicons:user-circle-02"
        description="如果上传头像后未更新，请尝试刷新页面。"
        class="my-6">
      </UAlert>

      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="p-4 rounded-lg bg-neutral-950/40">
          <div class="text-2xl font-bold text-center">
            <SharedAnimateNumber
              :value="commentsCount"
              class="justify-center text-2xl" />
          </div>
          <div class="text-neutral-500 text-sm text-center">评论数</div>
        </div>
        <div class="p-4 rounded-lg bg-neutral-950/40">
          <div class="text-2xl font-bold text-center">
            <SharedAnimateNumber
              :value="likesCount"
              class="justify-center text-2xl" />
          </div>
          <div class="text-neutral-500 text-sm text-center">点赞数</div>
        </div>
      </div>

      <UButton
        @click="handleLogout"
        size="xl"
        color="error"
        block
        :disabled="isLoading"
        :loading="isLoading">
        {{ isLoading ? "正在处理" : "退出登录" }}
      </UButton>
    </div>
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
        // 指数退避策略
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
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
</script>
