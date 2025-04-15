<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="form-group">
      <UInput v-model="email" type="email" id="email" variant="soft" size="xl" icon="hugeicons:at" class="w-full"
        placeholder="电子邮件" @keydown.space.prevent :disabled="isSubmitting" />
    </div>

    <div class="form-group">
      <UInput v-model="firstName" type="text" id="firstName" variant="soft" size="xl" icon="hugeicons:user-circle"
        class="w-full" placeholder="你的名字" :disabled="isSubmitting" />
    </div>

    <div class="form-group">
      <AuthSecurityInput v-model="password" placeholder="输入密码" icon="hugeicons:square-lock-password"
        :disabled="isSubmitting">
        <UChip :color="color" size="lg" class=" transform duration-300"
          :class="score > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'" />
      </AuthSecurityInput>
    </div>

    <div class="form-group">
      <AuthSecurityInput v-model="password_confirm" placeholder="确认密码" icon="hugeicons:square-lock-check-02"
        :disabled="isSubmitting" />
    </div>

    <div v-if="error" class="text-red-500 text-sm">
      {{ error }}
    </div>

    <UButton type="submit" size="xl" color="primary" block :disabled="isSubmitting" :loading="isSubmitting">
      {{ isSubmitting ? "正在处理" : "完成注册" }}
    </UButton>

    <USeparator><span class="text-neutral-400 dark:text-neutral-600 text-sm">或者</span></USeparator>

    <UButton variant="soft" color="neutral" size="xl" block :disabled="isSubmitting" to="/login">
      返回登录
    </UButton>
  </form>
</template>

<script setup lang="ts">
import { validateEmail, validateUsername, validatePassword } from "~/utils/validation";
import { AUTH_ERROR_MESSAGES } from "~/types/auth";
import { safeBack } from "~/router.options";

const { $user, $authClient } = useNuxtApp();
const { register, updateUserLocation } = useAuth();
const toast = useToast();

const firstName = ref("");
const email = ref("");
const password = ref("");
const password_confirm = ref("");
const error = ref("");
const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (!email.value || !firstName.value || !password.value || !password_confirm.value) {
    toast.add({
      title: "注册提示",
      description: "请完整填写所有必填字段信息。",
      icon: "hugeicons:alert-02",
      color: "warning",
    });
    return;
  }

  if (!validateEmail(email.value)) {
    toast.add({
      title: "注册提示",
      description: "电子邮件地址格式不正确，请检查。",
      icon: "hugeicons:alert-02",
      color: "warning",
    });
    return;
  }

  const nameValidation = validateUsername(firstName.value);
  if (!nameValidation.valid) {
    toast.add({
      title: "注册提示",
      description: nameValidation.message,
      icon: "hugeicons:alert-02",
      color: "warning",
    });
    return;
  }

  const passwordValidation = validatePassword(password.value);
  if (!passwordValidation.valid) {
    toast.add({
      title: "注册提示",
      description: passwordValidation.message,
      icon: "hugeicons:alert-02",
      color: "warning",
    });
    return;
  }

  if (password.value !== password_confirm.value) {
    toast.add({
      title: "注册提示",
      description: "两次输入的密码不匹配。",
      icon: "hugeicons:alert-02",
      color: "warning",
    });
    return;
  }

  try {
    isSubmitting.value = true;

    const existingUsers = await $authClient.request(
      $user.readUsers({
        filter: {
          _or: [
            { email: { _eq: email.value } },
            { first_name: { _eq: firstName.value.toLowerCase() } },
          ],
        },
      })
    );

    const emailExists = existingUsers.some((user) => user.email === email.value.toLowerCase());
    const nameExists = existingUsers.some(
      (user) => user.first_name.toLowerCase() === firstName.value.toLowerCase()
    );

    if (emailExists) {
      toast.add({
        title: "注册提示",
        description: "电子邮件已被注册，请使用其他电子邮件。",
        icon: "hugeicons:alert-02",
        color: "warning",
      });
      isSubmitting.value = false;
      return;
    }

    if (nameExists) {
      toast.add({
        title: "注册提示",
        description: "名字已被使用，请选择其他名字。",
        icon: "hugeicons:alert-02",
        color: "warning",
      });
      isSubmitting.value = false;
      return;
    }

    await register(email.value, password.value, firstName.value);

    toast.add({
      title: "注册提示",
      description: "注册完成，自动登录成功。",
      icon: "hugeicons:checkmark-circle-02",
      color: "success",
    });

    await safeBack();
    updateUserLocation();
  } catch (error: any) {
    toast.add({
      title: "注册提示",
      description: AUTH_ERROR_MESSAGES[error.errors?.[0]?.message] || "注册失败，请稍后重试。",
      icon: "hugeicons:alert-02",
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

function checkStrength(str: string) {
  const requirements = [
    { regex: /.{8,}/ },
    { regex: /\d/ },
    { regex: /[a-z]/ },
    { regex: /[A-Z]/ }
  ]

  return requirements.map(req => ({ met: req.regex.test(str) }))
}

const strength = computed(() => checkStrength(password.value))
const score = computed(() => strength.value.filter(req => req.met).length)

const color = computed(() => {
  if (score.value === 0) return 'neutral'
  if (score.value <= 1) return 'neutral'
  if (score.value <= 2) return 'error'
  if (score.value === 3) return 'warning'
  return 'success'
})

onDeactivated(() => {
  firstName.value = "";
  email.value = "";
  password.value = "";
  password_confirm.value = "";
});
</script>
