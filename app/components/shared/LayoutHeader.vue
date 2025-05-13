<template>
  <header class="fixed top-0 left-0 w-full z-50 bg-neutral-200/75 dark:bg-neutral-900/75 backdrop-blur">
    <div class="max-w-md sm:max-w-lg mx-auto py-4 flex justify-between items-center px-5">
      <Transition name="fade" mode="out-in">
        <NavigationLogo v-if="$route.path === '/'" key="logo" />
        <SharedNavigationBack v-else key="icon" @click="safeBack()" class="cursor-pointer" />
      </Transition>

      <div class="flex items-center space-x-8">
        <SharedBookmarkCounter v-if="isAuthenticated" class="translate-y-[3px]" />
        <PublishButton />
        <SearchModal />
        <CommentRecent :limit="10" />
        <ThemePicker />
        <AuthUserStatus />
      </div>
    </div>
    <hr />
  </header>
</template>

<script setup>
import { safeBack } from "~/router.options";

const NavigationLogo = defineAsyncComponent(() => import('./NavigationLogo.vue'))
const { isAuthenticated } = useAuth();
</script>
