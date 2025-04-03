<template>
  <div v-if="loading && bookmarksCount == null">
    <UIcon
      name="svg-spinners:3-dots-scale"
      class="size-6 text-neutral-500" />
  </div>
  <div
    v-else
    class="select-none">
    <UChip
      :color="bookmarksCount ? 'warning' : 'neutral'"
      :ui="{ base: 'py-2 px-1.5 font-bold' }"
      :text="bookmarksCount ?? undefined">
      <NuxtLink to="/bookmarks">
        <UIcon
          name="hugeicons:all-bookmark"
          class="size-[25px] text-neutral-400" />
      </NuxtLink>
    </UChip>
  </div>
</template>

<script setup lang="ts">
const { getBookmarks, subscribeBookmarks } = useBookmarks();
const { user } = useAuth();
const bookmarksCount = ref<number | null>(null);
const loading = ref(false);

const fetchBookmarksCount = async () => {
  if (!user.value?.id) return;

  try {
    loading.value = true;
    const bookmarks = await getBookmarks({
      fields: ["id"],
      filter: {
        user_created: { _eq: user.value.id },
      },
    });
    bookmarksCount.value = bookmarks.length;
  } catch (error) {
    console.error("Failed to fetch bookmarks count:", error);
    bookmarksCount.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchBookmarksCount();

  subscribeBookmarks(
    {
      fields: ["id"],
      filter: {
        user_created: { _eq: user.value?.id },
      },
    },
    async (event) => {
      if (["create", "delete"].includes(event.event)) {
        await fetchBookmarksCount();
      }
    }
  );
});

watch(user, () => {
  fetchBookmarksCount();
});
</script>
