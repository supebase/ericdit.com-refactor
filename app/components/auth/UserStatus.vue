<template>
  <div class="flex items-center">
    <template v-if="isAuthenticated">
      <div class="flex items-center">
        <NuxtLink to="/profile">
          <UAvatar
            :src="useAssets(user?.avatar || '')"
            :alt="!user?.avatar ? user?.first_name : undefined"
            size="lg"
            loading="lazy"
            class="uppercase" />
        </NuxtLink>
      </div>
    </template>
    <template v-else>
      <NuxtLink to="/login">
        <UAvatar
          icon="hugeicons:lock-key"
          class="size-9" />
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated } = useAuth();
</script>
