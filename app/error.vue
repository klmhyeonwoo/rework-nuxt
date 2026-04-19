<template>
  <h1>{{ error.statusCode }}</h1>
  <span>
    {{
      error.statusCode === 404
        ? "페이지를 찾을 수 없습니다"
        : "서버 오류가 발생했습니다."
    }}</span
  >
  <button @click="clearError({ redirect: '/' })">홈으로</button>
</template>

<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>();
</script>
