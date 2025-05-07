<template>
    <UPopover v-model:open="isOpen">
        <slot />
        <template #content>
            <div class="flex flex-col items-center">
                <div v-if="settings?.donate_images">
                    <NuxtImg provider="directus" class="rounded-md"
                        :src="settings?.donate_images as unknown as string" loading="eager"
                        fetchpriority="high" preload placeholder format="webp" quality="80" />
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