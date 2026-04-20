<template>
  <span
    class="circle-loading"
    :style="{
      width: size,
      height: size,
      borderColor: trackColor,
      borderTopColor: color,
    }"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ size?: string; color?: string; trackColor?: string }>(),
  {
    size: "24px",
    color: "var(--color-primary)",
    trackColor: "var(--color-border)",
  },
);
</script>

<style scoped>
.circle-loading {
  display: inline-block;
  border: 2px solid;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
