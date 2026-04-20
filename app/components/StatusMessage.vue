<template>
  <div class="status-message-container">
    <span class="status"> {{ props.status }}</span>
    <span class="message"> {{ props.message }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: number;
  message: string;
}>();
</script>

<style scoped lang="scss">
.status-message-container {
  display: flex;
  flex-direction: column;
  row-gap: 15px;

  .status {
    font-size: 30px;
    font-weight: 700;
  }

  .message {
    font-size: 16px;
    color: #898989;
  }
}
</style>
