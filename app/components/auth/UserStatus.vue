<template>
  <div class="flex items-center select-none">
    <template v-if="isAuthenticated">
      <div class="flex items-center">
        <NuxtLink to="/me" aria-label="profile">
          <SharedAvatar :src="user?.avatar" :alt="!user?.avatar ? user?.first_name : undefined"
            size="sm" />
        </NuxtLink>
      </div>
    </template>
    <template v-else>
      <NuxtLink to="/auth" aria-label="auth">
        <UAvatar icon="hugeicons:lock-key" class="size-8" />
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated } = useAuth();
</script>
