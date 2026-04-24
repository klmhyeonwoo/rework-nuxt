<template>
  <div>
    <div class="main">
      <div class="introduce">
        <span> 오늘 하루도 멋진 당신을 위해 </span>
        <NuxtLink :href="path.login()"> 우리, 행복합시다. </NuxtLink>
      </div>
      <div class="user-list-container" v-if="users">
        <span class="title"> 멋진 일상들이 오고가고 있어요</span>
        <div class="users">
          <NuxtLink
            v-for="user in users"
            :key="user['user_id']"
            :href="path.user(user.user_id)"
          >
            {{ user.nickname }}님의 일상
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import path from "~/constants/path";

interface User {
  user_id: string;
  email: string;
  avatar_url: string | null;
  nickname: string | null;
  bio: string | null;
}

type UsersResponse = {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

const { data: users } = await useAsyncData(
  "users",
  () => $fetch<UsersResponse>("/api/users"),
  {
    transform: (res) => res.users,
  },
);
</script>

<style scoped lang="scss">
.main {
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-items: flex-start;

  .introduce {
    display: flex;
    flex-direction: column;
    row-gap: 15px;
  }

  .user-list-container {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
    margin-top: 120px;

    .title {
      font-size: 17px;
      font-weight: 600;
    }

    .users {
      display: flex;
      flex-direction: column;
      row-gap: 15px;
    }
  }

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
