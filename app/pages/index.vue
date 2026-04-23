<template>
  <div>
    <div class="main">
      <span> 오늘 하루도 멋진 당신을 위해 </span>
      <NuxtLink :href="path.login()"> 우리, 행복합시다. </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import path from "~/constants/path";
</script>

<style scoped lang="scss">
.main {
  display: flex;
  gap: 40px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 16px;
  flex-shrink: 0;
  width: 180px;
  margin: 0 auto;

  .logout-button {
    padding: 8px 16px;
    background: none;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    color: var(--color-text-muted, #888);

    &:hover {
      border-color: var(--color-primary, #222);
      color: var(--color-primary, #222);
    }
  }
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  row-gap: 40px;
}

.section {
  display: flex;
  flex-direction: column;
  row-gap: 16px;

  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }

  .section-date {
    font-size: 12px;
    color: var(--color-text-muted, #888);
  }
}
</style>
