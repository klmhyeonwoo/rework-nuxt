<template>
  <div class="login-form">
    <h2 class="title">로그인</h2>
    <form @submit.prevent="handleLogin">
      <div class="field">
        <input
          v-model="email"
          type="email"
          class="input"
          placeholder="이메일"
          autocomplete="email"
          required
        />
      </div>
      <div class="field">
        <input
          v-model="password"
          type="password"
          class="input"
          placeholder="비밀번호"
          autocomplete="current-password"
          required
        />
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <button type="submit" class="submit-button" :disabled="isPending">
        {{ isPending ? "로그인 중..." : "로그인" }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

const auth = useAuthStore();
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const isPending = ref(false);

async function handleLogin() {
  errorMessage.value = "";
  isPending.value = true;
  try {
    await auth.login(email.value, password.value);
    await navigateTo("/");
  } catch (e: any) {
    errorMessage.value = e?.data?.message ?? "로그인에 실패했습니다.";
  } finally {
    isPending.value = false;
  }
}
</script>

<style scoped lang="scss">
.login-form {
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  width: 100%;
  max-width: 360px;

  .title {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }

  form {
    display: flex;
    flex-direction: column;
    row-gap: 12px;
  }

  .field {
    .input {
      width: 100%;
      padding: 15px 12px;
      border: 1px solid var(--color-border, #e0e0e0);
      border-radius: 6px;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.4s;

      &:focus {
        border-color: var(--color-primary, #222);
      }
    }
  }

  .error {
    font-size: 13px;
    color: #e53935;
    margin: 0;
  }

  .submit-button {
    padding: var(--btn-padding, 12px 16px);
    background: var(--btn-bg, #222);
    color: var(--btn-color, #fff);
    border: none;
    border-radius: var(--btn-border-radius, 4px);
    font-size: 14px;
    cursor: pointer;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>
