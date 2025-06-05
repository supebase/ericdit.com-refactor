<template>
  <div class="relative">
    <div class="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-3">
      <div class="text-xs text-neutral-400 dark:text-neutral-600 select-none uppercase truncate">
        {{ $props.language }}
      </div>
      <div @click="copyWithFeedback(source)" class="text-xs text-neutral-500 shrink-0">
        <span v-if="!copied" class="cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <g fill="none" class="stroke-neutral-400 dark:stroke-neutral-600" stroke="currentColor"
              stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
              <path
                d="M9 15c0-2.828 0-4.243.879-5.121C10.757 9 12.172 9 15 9h1c2.828 0 4.243 0 5.121.879C22 10.757 22 12.172 22 15v1c0 2.828 0 4.243-.879 5.121C20.243 22 18.828 22 16 22h-1c-2.828 0-4.243 0-5.121-.879C9 20.243 9 18.828 9 16z" />
              <path
                d="M17 9c-.003-2.957-.047-4.489-.908-5.538a4 4 0 0 0-.554-.554C14.43 2 12.788 2 9.5 2c-3.287 0-4.931 0-6.038.908a4 4 0 0 0-.554.554C2 4.57 2 6.212 2 9.5c0 3.287 0 4.931.908 6.038a4 4 0 0 0 .554.554c1.05.86 2.58.906 5.538.908" />
            </g>
          </svg>
        </span>
        <span v-else>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <g fill="none" class="stroke-neutral-500" stroke="currentColor" stroke-linecap="round"
              stroke-linejoin="round" stroke-width="1.5">
              <path
                d="M21.448 8.2c.052 1.05.052 2.3.052 3.8c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c1.072 0 2.016 0 2.85.02" />
              <path d="M8 11.5s1.5 0 3.5 3.5c0 0 5.059-9.167 10-11" />
            </g>
          </svg>
        </span>
      </div>
    </div>
    <pre :class="$props.class" class="mt-8 overflow-x-auto px-3 pt-9"><slot /></pre>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  code: {
    type: String,
    default: "",
  },
  language: {
    type: String,
    default: null,
  },
  filename: {
    type: String,
    default: null,
  },
  highlights: {
    type: Array as () => number[],
    default: () => [],
  },
  meta: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: null,
  },
});

const toast = useToast();

const source = ref(props.code);
const { copy, copied } = useClipboard({ source });

const copyWithFeedback = async (text: string) => {
  try {
    await copy(text);
    toast.add({
      title: "复制成功",
      description: "代码已复制到剪贴板。",
      icon: "hugeicons:checkmark-circle-02",
      color: "success",
    });
  } catch (err) {
    toast.add({
      title: "复制失败",
      description: "请手动选择复制内容。",
      icon: "hugeicons:alert-02",
      color: "warning",
    });
  }
};
</script>
