<template>
    <UModal :dismissible="false" :open="isMaintenanceMode" title="维护提示" description="维护模式开启/关闭后将自动显示/隐藏"
        :ui="{ overlay: 'backdrop-blur-sm backdrop-grayscale-100' }">
        <template #content>
            <UCard class="p-6">
                <div class="flex flex-col items-center">
                    <div class="mb-6 flex justify-center">
                        <UIcon name="hugeicons:computer-settings" class="size-10 animate-pulse" />
                    </div>
                    <div class="text-xl font-extrabold mb-2">
                        维护模式
                    </div>
                    <div class="text-sm text-neutral-600 dark:text-neutral-300">
                        我们正在进行系统维护，请稍后再试。
                    </div>
                </div>
            </UCard>
        </template>
    </UModal>
</template>

<script setup lang="ts">
const { getSettings, subscribeSettings } = useAppSettings();
const isMaintenanceMode = ref(false);

const updateMaintenanceMode = (settings: any) => {
    if (settings?.maintenance_mode !== undefined) {
        isMaintenanceMode.value = settings.maintenance_mode === true;
    } else if (settings?.data && Array.isArray(settings.data) && settings.data[0]?.maintenance_mode !== undefined) {
        isMaintenanceMode.value = settings.data[0].maintenance_mode === true;
    }
};

const init = async () => {
    try {
        const settings = await getSettings();
        updateMaintenanceMode(settings);
    } catch (error) {
        console.error('Failed to check maintenance mode:', error);
    }
};

let unsubscribe: (() => void) | null = null;

onMounted(async () => {
    await init();

    if (import.meta.client) {
        unsubscribe = await subscribeSettings(updateMaintenanceMode);
    }
});

onUnmounted(() => {
    if (unsubscribe) unsubscribe();
});
</script>