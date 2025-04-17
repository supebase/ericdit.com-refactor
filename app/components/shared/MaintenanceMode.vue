<template>
    <div v-if="isMaintenanceMode"
        class="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 fixed inset-0 z-50">
        <div class="text-center">
            <div class="mb-8 flex justify-center">
                <UIcon name="hugeicons:computer-settings" class="size-10 text-neutral-900 dark:text-orange-200" />
            </div>
            <div class="text-lg font-extrabold mb-3">
                系统维护中
            </div>
            <div class="text-sm text-neutral-500">
                我们正在进行系统维护，请稍后再试。
            </div>
        </div>
    </div>
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