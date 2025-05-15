<template>
    <div class="flex items-center justify-center select-none">
        <div class="w-full max-w-md space-y-8">
            <div class="mt-6 text-center text-2xl font-extrabold">
                {{ siteName }}
            </div>
            <component :is="isAuth ? 'AuthLoginForm' : 'AuthRegisterForm'" />
        </div>
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { isAuthenticated } = useAuth();

const isAuth = ref(route.query.action !== 'register');

watch(() => route.query.action, val => {
    isAuth.value = val !== 'register';
});

const siteName = computed(() => isAuth.value ? "用户登录" : "注册新用户");

watch(isAuthenticated, (newValue) => {
    if (newValue) navigateTo("/");
}, { immediate: true, once: true });

useSeo({
    site_name: siteName,
    site_description: '',
    seo_keywords: '',
    maintenance_mode: false,
    noindex: true,
    donate_images: [],
});
</script>