<template>
    <UPopover v-model:open="isOpen" arrow
        :ui="{ content: 'bg-white dark:bg-neutral-950', arrow: 'fill-neutral-300 dark:fill-neutral-800' }">
        <slot />
        <template #content>
            <div class="flex flex-col items-center">
                <div v-if="settings?.donate_images">
                    <NuxtImg provider="directus" class="rounded-md"
                        :src="settings?.donate_images" loading="eager"
                        fetchpriority="high" preload placeholder format="webp" quality="80" />
                </div>
                <div v-else class="flex justify-center items-center w-20 h-20">
                    <UIcon name="hugeicons:coffee-02" class="w-8 h-8 text-neutral-600 dark:text-neutral-400" />
                </div>
            </div>
        </template>
    </UPopover>
</template>

<script setup lang="ts">
const { getSettings } = useAppSettings();
const { data: settings } = useAsyncData('donate', getSettings);

const isOpen = ref(false);
</script>