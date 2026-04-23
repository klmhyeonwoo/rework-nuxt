<template>
  <div class="default-layout">
    <button
      class="theme-toggle"
      :aria-label="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
      @click="toggle"
    >
      {{ isDark ? "☀️" : "🌙" }}
    </button>
    <slot />
  </div>
</template>

<script setup lang="ts">
const { isDark, toggle, init } = useColorMode();
onMounted(() => init());
</script>

<style lang="scss" scoped>
.default-layout {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 20px;
  box-sizing: border-box;
}

.theme-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 42px;
  height: 42px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  font-size: 18px;
  cursor: pointer;
  z-index: 100;
  transition: border-color 0.3s;

  &:hover {
    border-color: var(--color-primary);
  }
}
</style>
