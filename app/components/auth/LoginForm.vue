<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="form-group">
      <UInput v-model="email" variant="soft" size="xl" icon="hugeicons:at" class="w-full" placeholder="电子邮件"
        @keydown.space.prevent :disabled="isSubmitting" />
    </div>

    <div class="form-group">
      <AuthSecurityInput v-model="password" placeholder="登录密码" icon="hugeicons:lock-key" :disabled="isSubmitting" />
    </div>

    <div v-if="error" class="text-red-500 text-sm">
      {{ error }}
    </div>

    <UButton type="submit" size="xl" color="success" block :disabled="isSubmitting" :loading="isSubmitting">
      {{ isSubmitting ? "正在处理" : "立即登录" }}
    </UButton>

    <USeparator><span class="text-neutral-400 dark:text-neutral-600 text-sm">或者</span></USeparator>

    <UButton variant="soft" color="neutral" size="xl" block :disabled="isSubmitting" to="/register">
      注册新用户
    </UButton>
  </form>
</template>

<script setup lang="ts">
import { validateEmail } from "~/utils/validation";
import { AUTH_ERROR_MESSAGES } from "~/types/auth";
import { safeBack } from "~/router.options";

const { login, updateUserLocation } = useAuth();
const toast = useToast();

const email = ref("");
const password = ref("");
const error = ref("");
const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    toast.add({
      title: "登录提示",
      description: "请输入有效的电子邮件及登录密码。",
      icon: "hugeicons:alert-02",
      color: "warning",
    });
    return;
  }

  if (!validateEmail(email.value)) {
    toast.add({
      title: "登录提示",
      description: "电子邮件地址格式不正确，请检查。",
      icon: "hugeicons:alert-02",
      color: "warning",
    });
    return;
  }

  try {
    isSubmitting.value = true;
    await login(email.value, password.value);

    toast.add({
      title: "登录提示",
      description: "登录成功，欢迎回来。",
      icon: "hugeicons:checkmark-circle-02",
      color: "success",
    });

    await safeBack();
    updateUserLocation();
  } catch (error: any) {
    toast.add({
      title: "登录提示",
      description: AUTH_ERROR_MESSAGES[error.errors?.[0]?.message] || "登录失败，请稍后重试。",
      icon: "hugeicons:alert-02",
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

onDeactivated(() => {
  email.value = "";
  password.value = "";
});
</script>
