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
  <input type="file" ref="fileInput" @change="onSelectFile" accept="image/*" class="hidden" />
  <UModal v-model:open="showCropper"
    :ui="{ overlay: 'backdrop-blur-xs', content: 'w-80 bg-neutral-50 dark:bg-neutral-950' }" title="Cropper"
    description="裁剪头像">
    <template #content>
      <div class="p-6">
        <cropper v-if="previewUrl" ref="cropperRef" :src="previewUrl" class="w-64 h-64 mx-auto" :auto-zoom="true"
          :stencil-props="{ aspectRatio: 1 }" />
        <div class="text-sm text-center text-neutral-400 dark:text-neutral-600 mt-3">
          <p>建议使用正方形图片</p>
          <p>支持的格式：JPG、PNG、GIF</p>
          <p>文件大小不超过 512KB</p>
        </div>
        <div class="w-full border-t border-neutral-200 dark:border-neutral-800 my-2"></div>
        <div class="flex justify-center gap-4 mt-4">
          <UButton @click="showCropper = false" color="neutral">取消</UButton>
          <UButton @click="confirmCrop" color="primary">确定上传</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

const { user } = useAuth();
const { avatarUrl, isLoading, uploadAvatar } = useProfileAvatar();
const toast = useToast();

const showCropper = ref(false);
const previewUrl = ref<string | null>(null);
const cropperRef = ref<any>(null);
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
  if (fileInput.value) fileInput.value.value = ''
  fileInput.value?.click()
}

const onSelectFile = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (!validateFile(file)) {
    target.value = ""
    return
  }
  // 辅助检测文件真实类型
  const isRealImage = await checkMagicNumber(file)
  if (!isRealImage) {
    toast.add({
      title: "上传通知",
      description: "文件内容不是有效的图片格式。",
      icon: "hugeicons:alert-02",
      color: "warning",
    })
    target.value = ""
    return
  }
  previewUrl.value = URL.createObjectURL(file);
  showCropper.value = true;
}

const confirmCrop = async () => {
  if (!cropperRef.value) return
  // 获取裁剪后的图片数据
  const canvas = cropperRef.value.getResult().canvas
  if (canvas) {
    canvas.toBlob(async (blob: Blob | null) => {
      if (blob) {
        const croppedFile = new File([blob], "avatar.jpg", { type: "image/jpeg" })
        await uploadAvatar(croppedFile)
        showCropper.value = false
        previewUrl.value = null
      }
      isLoading.value = false
    }, "image/jpeg")

    showCropper.value = false;
  }
}

// 辅助检测文件真实类型
const checkMagicNumber = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const arr = new Uint8Array(reader.result as ArrayBuffer);
      // JPEG: FF D8 FF
      if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) return resolve(true);
      // PNG: 89 50 4E 47 0D 0A 1A 0A
      if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) return resolve(true);
      // GIF: 47 49 46 38
      if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x38) return resolve(true);
      resolve(false);
    };
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
};
</script>
