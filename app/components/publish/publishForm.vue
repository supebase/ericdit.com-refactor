<template>
    <div class="space-y-6">
        <URadioGroup
            :ui="{ item: 'bg-white dark:bg-neutral-950 rounded-md border has-data-[state=checked]:shadow-lg has-data-[state=checked]:shadow-primary-500/30 w-full cursor-pointer', label: 'text-base', description: 'text-muted/80', fieldset: 'gap-4 justify-center' }"
            v-model="publishType" :items="publishTypeItems" size="md" indicator="hidden"
            orientation="horizontal" color="primary" variant="card" />
        <template v-if="publishType === 'status'">
            <div class="bg-white dark:bg-neutral-950 rounded-md p-1">
                <UInput :ui="{ base: 'placeholder:text-base' }" v-model="title" color="neutral"
                    variant="none" size="xl" class="w-full" :disabled="isSubmitting"
                    placeholder="分享的标题" />
                <USeparator type="dashed" class="px-3 py-1" />
                <UTextarea :ui="{ base: 'placeholder:text-base' }" v-model="body" color="neutral"
                    variant="none" autoresize :rows="6" :maxrows="10" :padded="false" size="xl"
                    class="w-full" :maxlength="BODY_MAX_LENGTH" :disabled="isSubmitting"
                    placeholder="说点什么 ..." />
                <div class="flex justify-between items-center p-3">
                    <div class="flex items-center space-x-6">
                        <USwitch v-model="statusPinned" color="neutral" label="置顶" />
                        <USwitch v-model="allowComments" color="neutral" label="允许发表评论" />
                    </div>
                    <div class="flex items-center">
                        <span class="text-sm tabular-nums select-none" :class="body.length >= BODY_MAX_LENGTH
                            ? 'text-red-600'
                            : 'text-neutral-500'
                            ">
                            {{ body.length }} / {{ BODY_MAX_LENGTH }}
                        </span>
                    </div>
                </div>
            </div>
            <PublishAttachment @uploaded="onImageUploaded" @removed="onImageRemoved"
                :reset-key="resetKey" />
        </template>
        <template v-else-if="publishType === 'github'">
            <UInput :ui="{
                base: 'pl-[151px] pr-[80px] rounded-md bg-white dark:bg-neutral-950 placeholder:text-neutral-300 dark:placeholder:text-neutral-700',
                leading: 'pointer-events-none'
            }" v-model="githubLink" variant="soft" size="xl" class="w-full"
                placeholder="owner/repo" :disabled="isSubmitting">
                <template #leading>
                    <p class="text-muted">
                        https://github.com/
                    </p>
                </template>
                <template #trailing>
                    <UCheckbox v-model="githubPinned" color="neutral" label="置顶" />
                </template>
            </UInput>
        </template>
        <UButton block size="xl" color="primary" :loading="isSubmitting"
            :disabled="body.length >= BODY_MAX_LENGTH || isSubmitting || !canSubmit"
            @click="handlePublish">
            {{ isSubmitting ? '正在发布' : '立即发布' }}
        </UButton>
    </div>
</template>

<script setup lang="ts">
import type { RadioGroupItem } from '@nuxt/ui';

const BODY_MAX_LENGTH = 2000;
const publishTypeItems: RadioGroupItem[] = [
    { label: '内容卡片', value: 'status', description: '近期有没有可分享的内容' },
    { label: 'GitHub 卡片', value: 'github', description: '可通过链接地址分享项目' }
];

const { createContent, createContentFiles, updateContent } = useContents();
const toast = useToast();

// 表单状态管理
const title = ref("");
const body = ref("");
const allowComments = ref(true);
const isSubmitting = ref(false);
const publishType = ref<'status' | 'github'>('status');
const githubLink = ref('');
const statusPinned = ref(false);
const githubPinned = ref(false);
const imageFileId = ref<string | null>(null);
const resetKey = ref(0);

const canSubmit = computed(() => {
    return (publishType.value === 'status' && !!body.value.trim())
        || (publishType.value === 'github' && !!githubLink.value.trim());
});

/**
 * 重置表单状态
 * @description 确保所有表单字段都恢复到初始状态
 */
function resetForm() {
    // 重置所有状态字段
    title.value = "";
    body.value = "";
    allowComments.value = true;
    statusPinned.value = false;
    githubLink.value = "";
    githubPinned.value = false;
    imageFileId.value = null;
    resetKey.value++;
    // 重置发布类型到默认值
    publishType.value = 'status';
}

function onImageUploaded(id: string) {
    imageFileId.value = id;
}

function onImageRemoved() {
    imageFileId.value = null;
}

const handlePublish = async () => {
    if (publishType.value === 'status') {
        if (!title.value.trim()) {
            toast.add({
                title: "发布提示",
                description: "标题不能为空。",
                icon: "hugeicons:alert-02",
                color: "warning",
            });
            return;
        }
        if (!body.value.trim()) {
            toast.add({
                title: "发布提示",
                description: "分享的内容不能为空。",
                icon: "hugeicons:alert-02",
                color: "warning",
            });
            return;
        }
        if (body.value.length > BODY_MAX_LENGTH) {
            toast.add({
                title: "发布提示",
                description: `分享的内容不能超过 ${BODY_MAX_LENGTH} 个字。`,
                icon: "hugeicons:alert-02",
                color: "warning",
            });
            return;
        }
        // if (!imageFileId.value) {
        //     toast.add({
        //         title: "发布提示",
        //         description: "请上传一张背景图片。",
        //         icon: "hugeicons:alert-02",
        //         color: "warning",
        //     });
        //     return;
        // }
    } else if (publishType.value === 'github') {
        if (!githubLink.value.trim()) {
            toast.add({
                title: "发布提示",
                description: "GitHub 项目链接不能为空。",
                icon: "hugeicons:alert-02",
                color: "warning",
            });
            return;
        }
    }

    try {
        isSubmitting.value = true;
        let content;
        switch (publishType.value) {
            case 'status':
                content = await createContent({
                    title: title.value,
                    body: body.value,
                    allow_comments: allowComments.value,
                    pinned: statusPinned.value,
                    status: 'published'
                });
                if (imageFileId.value) {
                    // 创建 contents_files 关联
                    const fileRel = await createContentFiles(content.id, imageFileId.value);
                    // 更新内容 images 字段为 contents_files 的 id
                    await updateContent(content.id, { images: [fileRel.id] });
                }
                break;
            case 'github':
                await createContent({
                    github_repo: githubLink.value,
                    pinned: githubPinned.value,
                    status: 'published'
                });
                break;
        }
        toast.add({
            title: "发布提示",
            description: "恭喜，内容已成功发布！",
            icon: "hugeicons:checkmark-circle-02",
            color: "success",
        });
        resetForm();
        navigateTo("/");
    } catch (error: any) {
        toast.add({
            title: "发布提示",
            description: error?.message || "发布失败，请稍后重试。",
            icon: "hugeicons:alert-02",
            color: "error",
        });
    } finally {
        isSubmitting.value = false;
    }
};
</script>