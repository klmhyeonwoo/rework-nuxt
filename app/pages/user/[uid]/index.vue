<template>
  <div>
    <div class="main">
      <aside class="sidebar">
        <Profile
          v-if="profile"
          :src="profile.avatar_url"
          :name="profile.nickname"
          :description="profile.bio"
        />
        <button @click="sideButtonConfig.event">
          {{ sideButtonConfig.label }}
        </button>
      </aside>

      <main class="content">
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">할 일</h2>
            <span v-if="!isToday" class="section-date">
              {{ selectedDate }} — 오늘 날짜가 아닙니다
            </span>
          </div>
          <TodoList :is-owner="isOwner" />
        </section>

        <section class="section">
          <div class="section-header">
            <h2 class="section-title">일기</h2>
            <span v-if="!isToday" class="section-date">
              {{ selectedDate }} — 오늘 날짜가 아닙니다
            </span>
          </div>
          <DiaryEditor :is-owner="isOwner" />
        </section>

        <section class="section">
          <h2 class="section-title">활동 기록</h2>
          <ActivityHeatmap
            :year="currentYear"
            :data="heatmap.data.value"
            :selected-date="selectedDate"
            @select="onSelectDate"
          />
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useTodoStore } from "~/stores/todo";
import { useDiaryStore } from "~/stores/diary";
import path from "~/constants/path";
import Profile from "~/components/Profile.vue";

interface Profile {
  user_id: string;
  nickname: string;
  bio: string | null;
  avatar_url: string;
}

const auth = useAuthStore();
const todoStore = useTodoStore();
const diaryStore = useDiaryStore();
const heatmap = useHeatmap();
const route = useRoute();
const uid = route.params.uid as string;

const isOwner = computed(() => auth.user?.id === uid);
const currentYear = new Date().getFullYear();
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

const selectedDate = ref(today);
const isToday = computed(() => selectedDate.value === today);

async function onSelectDate(date: string) {
  selectedDate.value = date;
  await Promise.allSettled([
    todoStore.fetchTodos({ date, uid }),
    diaryStore.fetchDiary({ date, uid }),
  ]);
}

const handleLogout = async () => {
  await auth.logout();
  navigateTo(path.home());
};

await Promise.allSettled([
  auth.fetchMe(),
  todoStore.fetchTodos({ date: today, uid }),
  diaryStore.fetchDiary({ date: today, uid }),
  heatmap.fetch({ year: currentYear, uid }),
]);

const { data: profile } = await useFetch<Profile>(() => `/api/${uid}/profile`);

const sideButtonConfig = computed(() => {
  if (isOwner.value) {
    return {
      event: handleLogout,
      label: "로그아웃",
    };
  } else {
    return {
      event: () => navigateTo(path.home()),
      label: "홈으로",
    };
  }
});

watch(
  () => todoStore.lastSyncedAt,
  () => {
    heatmap.fetch({ year: currentYear, uid });
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
