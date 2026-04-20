<template>
  <section class="error-container">
    <StatusMessage
      :status="error.statusCode"
      :message="
        error.statusCode === 404
          ? '페이지를 찾을 수 없습니다'
          : '서버 오류가 발생했습니다.'
      "
    />
    <button @click="clearError({ redirect: '/' })">홈으로</button>
  </section>
</template>

<script setup lang="ts">
import StatusMessage from "./components/StatusMessage.vue";

const props = defineProps<{ error: { statusCode: number; message: string } }>();
</script>

<style lang="scss" scoped>
.error-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;

  display: flex;
  flex-direction: column;
  row-gap: 20px;
}
</style>
