<template>
  <div class="flex items-center tabular-nums">
    <div v-for="(digit, index) in displayDigits" :key="index"
      :class="[digit === ',' ? 'comma' : 'number-column']">
      <template v-if="digit === ','"> , </template>
      <template v-else>
        <div class="number-scroll" :style="{ transform: `translateY(${digit * -10}%)` }">
          <div v-for="n in 10" :key="n" class="number-cell">
            {{ n - 1 }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  value: number;
  minLength?: number;
}>();

const displayDigits = computed(() => {
  // 先转换为带千分位的字符串
  const formattedNumber = new Intl.NumberFormat().format(props.value);
  // 移除所有非数字字符（保留逗号）
  return formattedNumber.split("").map((char) => (char === "," ? char : Number(char)));
});
</script>
