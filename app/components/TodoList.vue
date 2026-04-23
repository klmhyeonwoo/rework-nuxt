<template>
  <div class="todo-list">
    <CircleLoading v-if="store.isLoading.read" />
    <div class="input-row" v-if="isOwner">
      <input
        v-model="inputValue"
        class="input"
        placeholder="할 일을 입력하세요"
        @keydown.enter="(e) => !e.isComposing && handleAdd()"
      />
      <button
        class="add-button"
        @click="handleAdd"
        :disabled="store.isLoading.create"
      >
        <CircleLoading v-if="store.isLoading.create" size="11px" />
        <span v-else> 추가 </span>
      </button>
    </div>

    <div v-if="store.achievementRate !== null" class="achievement">
      달성률 {{ store.achievementRate }}%
    </div>

    <ul class="list">
      <li v-for="todo in store.todos" :key="todo.id" class="list-item">
        <label class="check-label">
          <input
            type="checkbox"
            :checked="todo.is_completed"
            class="checkbox"
            @change="store.toggleTodo(todo.id)"
          />
          <span
            :class="['item-text', { 'item-text--done': todo.is_completed }]"
          >
            {{ todo.title }}
          </span>
        </label>
        <button
          class="delete-button"
          @click="store.deleteTodo(todo.id)"
          v-if="isOwner"
        >
          ✕
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import CircleLoading from "~/assets/icon/CircleLoading.vue";
import { useTodoStore, type Todo } from "~/stores/todo";

const props = defineProps<{ isOwner: boolean }>();
const { isOwner } = toRefs(props);
const store = useTodoStore();
const inputValue = ref("");

async function handleAdd() {
  const trimmed = inputValue.value.trim();
  if (!trimmed) return;
  await store.addTodo(trimmed);
  inputValue.value = "";
}
</script>

<style scoped lang="scss">
.todo-list {
  position: relative;
  display: flex;
  flex-direction: column;
  row-gap: 16px;

  .circle-loading {
    position: absolute;
    left: 50%;
    top: 50%;
  }

  .input-row {
    display: flex;
    flex-direction: column;
    row-gap: 8px;

    .input {
      flex: 1;
      padding: 12px;
      border: 1px solid var(--color-border, #e0e0e0);
      border-radius: 6px;
      font-size: 14px;
      outline: none;

      &:focus {
        border-color: var(--color-primary, #222);
      }
    }

    .add-button {
      padding: 12px 16px;
      background: var(--color-primary, #222);
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;

      .circle-loading {
        position: relative;
        left: 0;
        top: 0;
      }
    }
  }

  .achievement {
    font-size: 13px;
    color: var(--color-text-muted, #888);
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    row-gap: 6px;

    .list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border: 1px solid var(--color-border, #e0e0e0);
      border-radius: 6px;

      .check-label {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        flex: 1;

        .checkbox {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: var(--color-primary, #222);
        }

        .item-text {
          font-size: 14px;

          &--done {
            text-decoration: line-through;
            color: var(--color-text-muted, #888);
          }
        }
      }

      .delete-button {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-muted, #888);
        font-size: 12px;
        padding: 0 4px;
        flex-shrink: 0;

        &:hover {
          color: var(--color-primary, #222);
        }
      }
    }
  }
}
</style>
