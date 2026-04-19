<template>
  <div>
    <div class="main">
      <aside class="sidebar">
        <Profile
          src="https://upload.cafenono.com/image/slashpageUser/20251203/173005_3JvNgOKRKxsx7CSg2i?q=80&s=480x1&t=outside&f=webp"
          name="현도리"
          description="오늘도 화이팅"
        />
        <button
          v-if="auth.isLoggedIn"
          class="logout-button"
          @click="auth.logout()"
        >
          로그아웃
        </button>
      </aside>

      <main class="content">
        <section class="section">
          <h2 class="section-title">오늘의 할 일</h2>
          <TodoList />
        </section>

        <section class="section">
          <h2 class="section-title">오늘의 일기</h2>
          <DiaryEditor />
        </section>

        <section class="section">
          <h2 class="section-title">활동 기록</h2>
          <ActivityHeatmap :year="currentYear" :data="heatmap.data.value" />
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useTodoStore } from "~/stores/todo";
import { useDiaryStore } from "~/stores/diary";

const auth = useAuthStore();
const todoStore = useTodoStore();
const diaryStore = useDiaryStore();
const heatmap = useHeatmap();

const currentYear = new Date().getFullYear();
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

await Promise.all([
  auth.fetchMe(),
  todoStore.fetchTodos(today),
  diaryStore.fetchDiary(today),
  heatmap.fetch(currentYear),
]);

watch(
  () => todoStore.lastSyncedAt,
  () => {
    heatmap.fetch(currentYear);
  },
);
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

  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }
}
</style>
