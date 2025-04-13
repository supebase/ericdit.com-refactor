<template>
  <UPopover :ui="{ content: 'ring-0 shadow-none bg-transparent' }" v-model:open="isPickerVisible">
    <div class="mt-1.5">
      <UIcon name="hugeicons:smile" @click.stop="openPicker"
        class="size-5 text-neutral-600 dark:text-neutral-400 cursor-pointer transform duration-500" />
    </div>

    <template #content>
      <div class="p-2">
        <NuxtEmojiPicker native hide-search hide-group-icons hide-group-names disable-sticky-group-names
          disable-skin-tones :theme="theme" @select="handleEmojiSelect" :disabled-groups="disabledGroups" />
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
const colorMode = useColorMode();
const theme = computed(() => (colorMode.value === "dark" ? "dark" : "light"));

const isPickerVisible = ref(false);

const openPicker = () => {
  isPickerVisible.value = true;

  nextTick(() => {
    // 延迟一点时间，确保组件渲染完毕后移除焦点
    setTimeout(() => {
      (document.activeElement as HTMLElement)?.blur();
    }, 0);
  });
};

const disabledGroups = ref([
  "animals_nature",
  "food_drink",
  "activities",
  "travel_places",
  "objects",
  "symbols",
  "flags",
]);

const emit = defineEmits(["emoji"]);

const handleEmojiSelect = (emoji: { i: string }) => {
  if (typeof emoji.i === "string") {
    emit("emoji", emoji.i);
    isPickerVisible.value = false;
  } else {
    console.error("Invalid emoji:", emoji);
  }
};
</script>
