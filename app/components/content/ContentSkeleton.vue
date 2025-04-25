<template>
    <UCard :ui="{ body: '!p-0 border-none', footer: '!px-4' }" variant="soft"
        class="select-none my-5" v-for="item in 5" :key="item">
        <!-- 图片区域骨架 -->
        <div class="relative overflow-hidden">
            <USkeleton class="aspect-[16/7] w-full rounded-b-none" />
        </div>

        <!-- 内容区骨架 -->
        <template #footer>
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-1.5">
                    <USkeleton class="h-6 w-6 rounded-full" />
                    <USkeleton class="h-4 w-18" />
                    <USkeleton class="h-1 w-1 rounded-full" />
                    <USkeleton class="h-4 w-18" />
                </div>
                <USkeleton class="h-5 w-5" />
            </div>

            <div class="mb-4">
                <USkeleton class="h-4 w-full mb-2" />
                <USkeleton class="h-4 w-[80%] mb-2" />
                <USkeleton class="h-4 w-[60%]" />
            </div>

            <div class="flex justify-between items-center">
                <div class="flex gap-10">
                    <USkeleton class="h-5 w-12" />
                    <USkeleton class="h-5 w-12" />
                    <USkeleton class="h-5 w-12" />
                </div>
                <USkeleton class="h-5 w-20" />
            </div>
        </template>
    </UCard>
</template>