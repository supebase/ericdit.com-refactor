<template>
  <div class="fixed inset-0 flex flex-col">
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
