<template>
  <div class="flex flex-col min-h-screen max-w-md mx-auto px-6 sm:px-0">
    <header class="sticky top-0 bg-neutral-900 z-50">
      <div class="container mx-auto py-4 flex justify-between items-center">
        <Transition
          name="fade"
          mode="out-in">
          <div
            v-if="$route.path === '/'"
            key="logo">
            <SharedNavigationLogo />
          </div>
          <div
            v-else
            key="icon"
            @click="safeBack()"
            class="cursor-pointer">
            <SharedNavigationBack />
          </div>
        </Transition>
        <div class="flex items-center space-x-8">
          <SharedBookmarkCounter
            v-if="isAuthenticated"
            class="translate-y-1.5" />

          <AuthUserStatus />
        </div>
      </div>
    </header>

    <main class="container mx-auto flex-1">
      <slot />
    </main>

    <footer class="container mx-auto py-4 select-none">
      <div class="text-center text-sm text-neutral-600 uppercase">
        &copy; 2001-{{ new Date().getFullYear() }} - Created by Eric
      </div>
    </footer>
  </div>
</template>

<script setup>
import { safeBack } from "~/router.options";
const { isAuthenticated } = useAuth();
</script>
