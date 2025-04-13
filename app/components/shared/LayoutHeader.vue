<template>
  <header class="flex-none">
    <div class="max-w-md mx-auto py-4 flex justify-between items-center px-5">
      <Transition name="fade" mode="out-in">
        <SharedNavigationLogo v-if="$route.path === '/'" key="logo" />
        <SharedNavigationBack v-else key="icon" @click="safeBack()" class="cursor-pointer" />
      </Transition>

      <div class="flex items-center space-x-9">
        <SearchModal />
        <SharedBookmarkCounter v-if="isAuthenticated" class="translate-y-[3px]" />
        <AuthUserStatus />
      </div>
    </div>
    <hr />
  </header>
</template>

<script setup>
import { safeBack } from "~/router.options";
const { isAuthenticated } = useAuth();
</script>
