<template>
  <!-- TODO: Tailwind CSS 4.1+ New Features -->
  <div class="fixed inset-0 flex flex-col mask-t-from-50% mask-t-to-90%">
    <SharedLayoutHeader />

    <div class="flex-1 overflow-y-auto overflow-x-hidden">
      <div class="flex flex-col max-w-md mx-auto px-5">
        <main class="container mx-auto">
          <slot />
        </main>
      </div>
    </div>

    <SharedLayoutFooter />
  </div>
</template>
