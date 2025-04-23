<script setup lang="ts">
defineProps<{
    label: string
    icon?: string
    chip?: string
    selected?: boolean
}>()

const slots = defineSlots<{
    leading: () => any
}>()
</script>

<template>
    <UButton size="sm" color="neutral" variant="soft" :icon="icon" :label="label" tabindex="-1"
        class="rounded-sm hover:bg-neutral-200 hover:dark:bg-neutral-800 text-xs select-none"
        :class="[selected ? 'bg-neutral-200 dark:bg-neutral-800' : 'bg-neutral-100 dark:bg-neutral-900']">
        <template v-if="chip || !!slots.leading" #leading>
            <slot name="leading">
                <span class="inline-block size-2 rounded-full" :class="`bg-${chip}-500 dark:bg-${chip}-500`" />
            </slot>
        </template>
    </UButton>
</template>