<template>
  <div
    class="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-neutral-200/80 dark:border-neutral-700/50 rounded-xl p-1 shadow-sm transition-all duration-300"
    :class="isAuthenticated ? 'mt-4 hover:shadow-md' : 'hidden'">
    <UTextarea ref="commentInput" v-model="content" color="neutral" variant="none" autoresize :rows="1" :maxrows="6"
      :padded="false" size="lg" class="text-neutral-300 w-full" :class="isAuthenticated ? '' : 'login'"
      :maxlength="COMMENT_MAX_LENGTH" @input="validateInput" :disabled="!isAuthenticated || isSubmitting"
      :placeholder="isAuthenticated ? placeholder : '请先登录后再发表评论'" />
    <div class="flex justify-between items-center px-3" v-if="isAuthenticated">
      <div class="flex items-center space-x-4">
        <ReactionsEmojiSelector @emoji="insertEmoji" />
        <UBadge label="禁止输入特殊字符" color="error" variant="soft" size="lg" class="transform duration-500 ease-in-out"
          :class="!validation.isValid ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'" />
      </div>
      <div class="flex items-center space-x-6">
        <span class="text-xs nums tabular-nums select-none" :class="content.length >= COMMENT_MAX_LENGTH
          ? 'text-red-600'
          : 'text-neutral-400 dark:text-neutral-600'
          ">
          {{ content.length }} / {{ COMMENT_MAX_LENGTH }}
        </span>
        <UButton @click="submit" color="neutral" size="lg" variant="ghost"
          class="hover:!bg-transparent cursor-pointer px-0" :loading="isSubmitting" :icon="submitIcon"
          :disabled="!canSubmit" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  placeholder?: string;
  isSubmitting?: boolean;
  clearInput?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", content: string): void;
}>();

const { isAuthenticated } = useAuth();

const COMMENT_MAX_LENGTH = 500;
const INVALID_CHARS_REGEX = /[<>\/&"'`=;(){}[\]]/;

const content = ref("");
const commentInput = ref<{ $el: HTMLElement } | null>(null);

const validation = computed(() => ({
  isEmpty: !content.value.trim(),
  isExceedLimit: content.value.length >= COMMENT_MAX_LENGTH,
  isValid: !INVALID_CHARS_REGEX.test(content.value),
}));

const canSubmit = computed(() => {
  const { isEmpty, isExceedLimit, isValid } = validation.value;
  return !isEmpty && !isExceedLimit && isValid && !props.isSubmitting;
});

const submitIcon = computed(() =>
  canSubmit.value ? "hugeicons:comment-add-02" : "hugeicons:comment-block-02"
);

const validateInput = () => validation.value.isValid;

const insertEmoji = (emoji: string) => {
  const textarea = commentInput.value?.$el.querySelector("textarea");
  if (!textarea) return;

  const { selectionStart, selectionEnd } = textarea;
  const newPosition = selectionStart + emoji.length;

  content.value = [
    content.value.slice(0, selectionStart),
    emoji,
    content.value.slice(selectionEnd),
  ].join("");

  nextTick(() => {
    textarea.setSelectionRange(newPosition, newPosition);
    textarea.focus();
  });
};

const submit = () => {
  if (!canSubmit.value) return;
  emit("submit", content.value);
  // 不在这里清空，由外部控制
};

// 新增：监听 clearInput prop，外部触发时清空输入框
watch(
  () => props.clearInput,
  (val) => {
    if (val) content.value = "";
  }
);

defineExpose({
  clear: () => (content.value = ""),
});
</script>