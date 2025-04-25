<script setup lang="ts">
defineProps<{
    label: string
    icon?: string
    chip?: string
    text?: string
    selected?: boolean
}>()

const slots = defineSlots<{
    leading: () => any
}>()
</script>

<template>
    <UButton :ui="{ leadingIcon: 'size-4' }" color="neutral" variant="soft" :icon="icon"
        :label="text ? text : label" tabindex="-1"
        class="capitalize rounded-sm hover:bg-neutral-200 hover:dark:bg-neutral-800 text-xs select-none"
        :class="[selected ? 'bg-neutral-300/70 dark:bg-neutral-700/70 outline-1 outline-offset-1 outline-neutral-100 dark:outline-neutral-900' : 'bg-neutral-100 dark:bg-neutral-900']">
        <template v-if="chip || !!slots.leading" #leading>
            <slot name="leading">
                <span class="inline-block size-2 rounded-full" :class="`bg-${chip}-500`" />
            </slot>
        </template>
    </UButton>
</template>