<template>
    <UPopover v-model:open="isOpen" :ui="{ content: 'bg-transparent ring-0' }">
        <slot />
        <template #content>
            <div class="flex flex-col items-center">
                <div v-if="settings?.donate_images">
                    <NuxtImg provider="directus" :src="settings?.donate_images as unknown as string" loading="eager"
                        fetchpriority="high" preload placeholder format="webp" quality="80" class="rounded-xl" />
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