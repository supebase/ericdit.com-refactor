<template>
    <div>
        <div class="flex justify-center items-center space-x-3">
            <UButton size="md" color="neutral" variant="soft" icon="hugeicons:image-upload-01" @click="openFileInput"
                :loading="isUploading" :disabled="isUploading">
                上传图片
            </UButton>
            <div v-if="previewUrl">
                <UButton size="md" color="error" variant="soft" icon="hugeicons:image-delete-01" @click="removeImage"
                    :loading="isDeleting" :disabled="isDeleting">移除图片</UButton>
            </div>
        </div>
        <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileChange" />
        <div v-if="previewUrl" class="mt-4">
            <img :src="previewUrl" alt="预览" class="aspect-[16/7] object-cover w-full rounded-sm" />
        </div>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['uploaded', 'removed']);
const fileInput = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);
const isDeleting = ref(false);
const previewUrl = ref<string | null>(null);
const fileId = ref<string | null>(null);

const UPLOAD_CONFIG = {
    maxSize: 1 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "image/gif"] as const,
};

const openFileInput = () => {
    if (isUploading.value) return;
    fileInput.value?.click();
};

const validateFile = (file: File): boolean => {
    if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
        useToast().add({ title: "上传通知", description: "不支持 SVG 格式的图片上传", icon: "hugeicons:alert-02", color: "warning" });
        return false;
    }
    if (!UPLOAD_CONFIG.allowedTypes.includes(file.type as (typeof UPLOAD_CONFIG.allowedTypes)[number])) {
        useToast().add({ title: "上传通知", description: "仅支持 JPG、PNG 和 GIF 格式的图片", icon: "hugeicons:alert-02", color: "warning" });
        return false;
    }
    if (file.size > UPLOAD_CONFIG.maxSize) {
        useToast().add({ title: "上传通知", description: "文件大小不能超过 1MB", icon: "hugeicons:alert-02", color: "warning" });
        return false;
    }
    return true;
};

const handleFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) {
        target.value = "";
        return;
    }
    isUploading.value = true;
    try {
        const { $authClient, $file } = useNuxtApp();
        // 如果已有图片，先删除旧图片
        if (fileId.value) {
            try {
                await $authClient.request($file.deleteFile(fileId.value));
            } catch (e) {
                // 可以忽略删除失败，继续上传
            }
        }
        const formData = new FormData();
        formData.append("file", file);
        const uploadResponse = await $authClient.request($file.uploadFiles(formData));
        if (uploadResponse && uploadResponse.id) {
            fileId.value = uploadResponse.id;
            previewUrl.value = uploadResponse.url || URL.createObjectURL(file);
            emit('uploaded', fileId.value);
            useToast().add({ title: "上传通知", description: "图片上传成功", icon: "hugeicons:checkmark-circle-02", color: "success" });
        }
    } catch (error: any) {
        useToast().add({ title: "上传通知", description: error?.message || "图片上传失败", icon: "hugeicons:alert-02", color: "error" });
    } finally {
        isUploading.value = false;
        target.value = "";
    }
};

const removeImage = async () => {
    if (fileId.value) {
        isDeleting.value = true;
        try {
            const { $authClient, $file } = useNuxtApp();
            await $authClient.request($file.deleteFile(fileId.value));
        } catch (e) {
            // 可以忽略删除失败
        } finally {
            isDeleting.value = false;
        }
    }
    fileId.value = null;
    previewUrl.value = null;
    emit('removed');
};
</script>