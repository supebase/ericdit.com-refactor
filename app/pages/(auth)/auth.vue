<template>
    <div class="flex items-center justify-center select-none">
        <div class="w-full max-w-md space-y-8">
            <div class="mt-6 text-center text-2xl font-extrabold">
                {{ isAuth ? "登录账号" : "注册新用户" }}
            </div>
            <component :is="isAuth ? 'AuthLoginForm' : 'AuthRegisterForm'" />
        </div>
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { isAuthenticated } = useAuth();

const isAuth = ref(route.query.action !== 'register');

watch(
    () => route.query.action,
    (val) => {
        isAuth.value = val !== 'register';
    }
);

// 只监听一次认证状态变化
watchOnce(
    isAuthenticated,
    (newValue) => {
        if (newValue) {
            // 如果用户已登录，重定向到首页
            navigateTo("/");
        }
    },
    { immediate: true }
);

watchEffect(() => {
    useSeo({
        site_name: isAuth.value ? "登录" : "注册新用户",
        site_description: '',
        seo_keywords: '',
        maintenance_mode: false,
        noindex: true,
        donate_images: [],
    });
});
</script>