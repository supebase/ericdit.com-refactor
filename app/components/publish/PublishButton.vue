<template>
  <UButton
    size="xl"
    color="neutral"
    variant="solid"
    block
    :disabled="isLoading || !isAdmin"
    :loading="isLoading"
    class="mt-10"
    :to="isAdmin ? '/new' : undefined">
    {{ isLoading ? "正在检查权限" : isAdmin ? "发布新内容" : "您未被认证" }}
  </UButton>
</template>

<script setup lang="ts">
const { isLoading, isAdmin } = useUserRole();
</script>