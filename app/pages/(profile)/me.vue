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
            <span>最近登录活动发生在{{ user?.location }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="grid grid-cols-2 gap-4 mt-8">
      <div class="p-6 rounded-md bg-white/50 dark:bg-neutral-950/50">
        <div class="flex justify-center">
          <SharedAnimateNumber :value="commentsCount" class="text-3xl font-bold" />
        </div>
        <div class="text-neutral-400 dark:text-neutral-500 font-medium text-center mt-2">评论数</div>
      </div>
      <div class="p-6 rounded-md bg-white/50 dark:bg-neutral-950/50">
        <div class="flex justify-center">
          <SharedAnimateNumber :value="likesCount" class="text-3xl font-bold" />
        </div>
        <div class="text-neutral-400 dark:text-neutral-500 font-medium text-center mt-2">点赞数</div>
      </div>
    </div>

    <PublishButton />

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

const loadUserStats = async () => {
  if (!user.value?.id) return;
  await fetchStats(user.value.id);
};

const { pending: isStatsLoading } = useAsyncData(
  "user-stats",
  async () => {
    if (user.value?.id) {
      await loadUserStats();
    }
  },
  { watch: [() => user.value?.id] }
);

// 监听用户ID变化，当用户ID存在时加载统计数据
watch(() => user.value?.id, (newId) => {
  if (newId) {
    loadUserStats();
  }
}, { immediate: true });

// 页面激活时刷新数据
onActivated(() => {
  loadUserStats();
});

// 错误处理
// watch(isStatsLoading, (newVal, oldVal) => {
//   if (!newVal && oldVal && !user.value?.id) {
//     toast.add({
//       title: "获取数据失败",
//       description: "请稍后重试",
//       color: "error",
//     });
//   }
// });

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



useSeo({
  site_name: "个人资料",
  site_description: '',
  seo_keywords: '',
  maintenance_mode: false,
  noindex: true,
  donate_images: "",
});
</script>
