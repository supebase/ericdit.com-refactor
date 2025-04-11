<template>
  <div class="flex items-center select-none">
    <template v-if="isAuthenticated">
      <div class="flex items-center">
        <NuxtLink to="/profile">
          <SharedAvatar
            :src="user?.avatar"
            :alt="!user?.avatar ? user?.first_name : undefined"
            size="sm"
            class="uppercase" />
        </NuxtLink>
      </div>
    </template>
    <template v-else>
      <NuxtLink to="/login">
        <UAvatar
          icon="hugeicons:lock-key"
          class="size-8" />
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated } = useAuth();
</script>
