<template>
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

      <div class="flex items-center space-x-9">
        <SharedBookmarkCounter
          v-if="isAuthenticated"
          class="translate-y-1" />

        <!-- <AuthUserCreate v-if="isAuthenticated" /> -->
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
