<script setup lang="ts">
import colors from 'tailwindcss/colors'
import { omit } from '#ui/utils'

const appConfig = useAppConfig()
const colorMode = useColorMode()

const neutralColors = ['slate', 'gray', 'zinc', 'neutral', 'stone']
const neutral = computed({
    get() {
        return appConfig.ui.colors.neutral
    },
    set(option) {
        appConfig.ui.colors.neutral = option
        safeStorage.set('nuxt-ui-neutral', appConfig.ui.colors.neutral)
    }
})

const colorsToOmit = ['inherit', 'current', 'transparent', 'black', 'white', ...neutralColors]
const primaryColors = Object.keys(omit(colors, colorsToOmit as any))
const primary = computed({
    get() {
        return appConfig.ui.colors.primary
    },
    set(option) {
        appConfig.ui.colors.primary = option
        safeStorage.set('nuxt-ui-primary', appConfig.ui.colors.primary)
    }
})

const modes = [
    { label: 'light', icon: 'hugeicons:sun-02', text: '浅色' },
    { label: 'dark', icon: 'hugeicons:moon-02', text: '深色' },
    { label: 'system', icon: 'hugeicons:computer', text: '系统' }
]
const mode = computed({
    get() {
        return colorMode.value
    },
    set(option) {
        colorMode.preference = option
    }
})
</script>

<template>
    <UPopover arrow
        :ui="{ content: 'w-72 px-6 py-4 flex flex-col gap-4 bg-white dark:bg-neutral-950', arrow: 'fill-neutral-100 dark:fill-neutral-800' }">
        <template #default>
            <UIcon name="hugeicons:computer-settings" class="size-5 text-neutral-500 cursor-pointer" />
        </template>

        <template #content>
            <fieldset>
                <legend
                    class="text-[13px] text-center leading-none font-medium mb-2 select-none -mx-1.5 text-neutral-500">
                    主色调
                </legend>

                <div class="grid grid-cols-3 gap-1.5 -mx-2.5">
                    <ThemePickerButton v-for="color in primaryColors" :key="color" :label="color" :chip="color"
                        :selected="primary === color" @click="primary = color" />
                </div>
            </fieldset>

            <fieldset>
                <legend
                    class="text-[13px] text-center leading-none font-medium mb-2 select-none -mx-1.5 text-neutral-500">
                    中性色
                </legend>

                <div class="grid grid-cols-3 gap-1.5 -mx-2.5">
                    <ThemePickerButton v-for="color in neutralColors" :key="color" :label="color" :chip="color"
                        :selected="neutral === color" @click="neutral = color" />
                </div>
            </fieldset>

            <fieldset>
                <legend
                    class="text-[13px] text-center leading-none font-medium mb-2 select-none -mx-1.5 text-neutral-500">
                    主题色
                </legend>

                <div class="grid grid-cols-3 gap-1.5 -mx-2">
                    <ThemePickerButton v-for="m in modes" :key="m.label" v-bind="m"
                        :selected="colorMode.preference === m.label" :text="m.text" @click="mode = m.label" />
                </div>
            </fieldset>
        </template>
    </UPopover>

    <div class="hidden">
        <!-- Primary Colors -->
        <div class="bg-red-500 dark:bg-red-500"></div>
        <div class="bg-orange-500 dark:bg-orange-500"></div>
        <div class="bg-amber-500 dark:bg-amber-500"></div>
        <div class="bg-yellow-500 dark:bg-yellow-500"></div>
        <div class="bg-lime-500 dark:bg-lime-500"></div>
        <div class="bg-green-500 dark:bg-green-500"></div>
        <div class="bg-emerald-500 dark:bg-emerald-500"></div>
        <div class="bg-teal-500 dark:bg-teal-500"></div>
        <div class="bg-cyan-500 dark:bg-cyan-500"></div>
        <div class="bg-sky-500 dark:bg-sky-500"></div>
        <div class="bg-blue-500 dark:bg-blue-500"></div>
        <div class="bg-indigo-500 dark:bg-indigo-500"></div>
        <div class="bg-violet-500 dark:bg-violet-500"></div>
        <div class="bg-purple-500 dark:bg-purple-500"></div>
        <div class="bg-fuchsia-500 dark:bg-fuchsia-500"></div>
        <div class="bg-pink-500 dark:bg-pink-500"></div>
        <div class="bg-rose-500 dark:bg-rose-500"></div>

        <!-- Neutral Colors -->
        <div class="bg-slate-500 dark:bg-slate-500"></div>
        <div class="bg-gray-500 dark:bg-gray-500"></div>
        <div class="bg-zinc-500 dark:bg-zinc-500"></div>
        <div class="bg-neutral-500 dark:bg-neutral-500"></div>
        <div class="bg-stone-500 dark:bg-stone-500"></div>
    </div>
</template>