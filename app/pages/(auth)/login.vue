<template>
  <div class="flex items-center justify-center select-none">
    <div class="w-full space-y-8">
      <div class="mt-6 text-center text-2xl font-extrabold">登录账号</div>
      <AuthLoginForm />
    </div>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated } = useAuth();

// 监听认证状态变化
watch(
  isAuthenticated,
  (newValue) => {
    if (newValue) {
      // 如果用户已登录，重定向到首页
      navigateTo("/");
    }
  },
  { immediate: true }
);

useSeo({
  title: "登录",
  noindex: true,
});
</script>
