<template>
  <div class="flex items-center justify-center relative cursor-pointer group" @click="openFileInput">
    <SharedAvatar :src="avatarUrl || undefined" :alt="!avatarUrl ? user?.first_name : undefined" size="xl"
      class="text-2xl" />
    <div
      class="absolute -bottom-1 -right-2 bg-neutral-200 dark:bg-neutral-900 size-6 rounded-full flex items-center justify-center">
      <UIcon :name="isLoading ? 'svg-spinners:ring-resize' : 'hugeicons:upload-circle-01'"
        class="size-5 text-neutral-500" />
    </div>
  </div>

  <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" class="hidden" />
</template>

<script setup lang="ts">
const { user } = useAuth();
const { avatarUrl, isLoading, uploadAvatar } = useProfileAvatar();
const toast = useToast();

const fileInput = ref<HTMLInputElement | null>(null);

// 定义上传配置
const UPLOAD_CONFIG = {
  maxSize: 512 * 1024, // 512KB
  allowedTypes: ["image/jpeg", "image/png", "image/gif"] as const,
} as const;

// 验证文件
const validateFile = (file: File): boolean => {
  // 拒绝 SVG 文件
  if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
    toast.add({
      title: "上传通知",
      description: "不支持 SVG 格式的图片上传",
      icon: "hugeicons:alert-02",
      color: "warning",
    });
    return false;
  }

  if (
    !UPLOAD_CONFIG.allowedTypes.includes(file.type as (typeof UPLOAD_CONFIG.allowedTypes)[number])
  ) {
    toast.add({
      title: "上传通知",
      description: "仅支持 JPG、PNG 和 GIF 格式的图片",
      icon: "hugeicons:alert-02",
      color: "warning",
    });
    return false;
  }

  if (file.size > UPLOAD_CONFIG.maxSize) {
    toast.add({
      title: "上传通知",
      description: "文件大小不能超过 512KB",
      icon: "hugeicons:alert-02",
      color: "warning",
    });
    return false;
  }

  return true;
};

const openFileInput = () => {
  if (isLoading.value) return;
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (validateFile(file)) {
    uploadAvatar(file);
  }

  // 清理 input 值，允许上传相同文件
  target.value = "";
};
</script>
