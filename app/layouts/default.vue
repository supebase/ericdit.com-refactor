<template>
  <div class="fixed inset-0 flex flex-col">
    <header class="flex-none">
      <div class="max-w-md mx-auto py-4 flex justify-between items-center px-5">
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

    <div class="flex-1 overflow-y-auto overflow-x-hidden">
      <div class="flex flex-col max-w-md mx-auto px-5">
        <main class="container mx-auto">
          <slot />
        </main>
      </div>
    </div>

    <footer class="flex-none">
      <hr />
      <div class="py-4 select-none">
        <div class="text-center text-sm text-neutral-600">
          2001-{{ new Date().getFullYear() }} &copy; Eric
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { safeBack } from "~/router.options";
const { isAuthenticated } = useAuth();
</script>
