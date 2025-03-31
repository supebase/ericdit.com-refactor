<template>
  <div class="flex items-center nums tabular-nums">
    <div
      v-for="(digit, index) in displayDigits"
      :key="index"
      class="number-column">
      <div
        class="number-scroll"
        :style="{ transform: `translateY(${digit * -10}%)` }">
        <div
          v-for="n in 10"
          :key="n"
          class="number-cell">
          {{ n - 1 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  value: number;
  minLength?: number;
}>();

const displayDigits = computed(() => {
  return String(props.value)
    .padStart(props.minLength || 1, "0")
    .split("")
    .map(Number);
});
</script>

<style scoped>
.number-column {
  display: inline-block;
  height: 1.25em;
  overflow: hidden;
  position: relative;
}

.number-scroll {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.number-cell {
  height: 1.25em;
  width: 0.6em;
  text-align: center;
  line-height: 1.25em;
}
</style>
