<template>
  <div class="flex flex-col min-h-screen">
    <header class="sticky top-0 z-50 bg-neutral-900">
      <div class="max-w-md mx-auto py-4 flex justify-between items-center px-5 sm:px-0">
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
      <hr />
    </header>

    <div class="flex-1">
      <div class="flex flex-col h-full max-w-md mx-auto px-5 sm:px-0">
        <main class="container mx-auto flex-1">
          <slot />
        </main>
      </div>
    </div>

    <footer class="sticky bottom-0 z-50 bg-neutral-900">
      <hr />
      <div class="py-4 select-none">
        <div class="text-center text-sm text-neutral-600 uppercase">
          &copy; 2001-{{ new Date().getFullYear() }} - Created by Eric
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { safeBack } from "~/router.options";
const { isAuthenticated } = useAuth();
</script>
