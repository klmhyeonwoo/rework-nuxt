<template>
  <div class="diary-editor">
    <CircleLoading v-if="store.isLoading.read" />
    <textarea
      v-model="content"
      class="textarea"
      placeholder="오늘 하루를 기록하세요"
      :disabled="!isOwner || !isEditing"
    />
    <div class="actions" v-if="isOwner">
      <template v-if="store.diary && !isEditing">
        <button class="button button--secondary" @click="isEditing = true">
          수정
        </button>
        <button class="button button--danger" @click="handleDelete">
          삭제
        </button>
      </template>
      <template v-else>
        <button class="button button--primary" @click="handleSave">저장</button>
        <button
          v-if="store.diary"
          class="button button--secondary"
          @click="cancelEdit"
        >
          취소
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import CircleLoading from "~/assets/icon/CircleLoading.vue";
import { useDiaryStore } from "~/stores/diary";

const props = defineProps<{ isOwner: boolean }>();
const { isOwner } = toRefs(props);
const store = useDiaryStore();
const isEditing = ref(!store.diary);
const content = ref(store.diary?.content);

watch(
  () => store.diary,
  (diary) => {
    content.value = diary?.content ?? "";
    isEditing.value = !diary;
  },
);

async function handleSave() {
  if (!content.value.trim()) return;
  await store.saveDiary(content.value);
  isEditing.value = false;
}

async function handleDelete() {
  await store.deleteDiary();
  content.value = "";
  isEditing.value = true;
}

function cancelEdit() {
  content.value = store.diary?.content ?? "";
  isEditing.value = false;
}
</script>

<style scoped lang="scss">
.diary-editor {
  position: relative;
  display: flex;
  flex-direction: column;
  row-gap: 12px;

  .circle-loading {
    position: absolute;
    left: 50%;
    top: 50%;
  }

  .textarea {
    width: 100%;
    min-height: 200px;
    padding: 12px;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.6;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
    font-family: inherit;

    &:focus {
      border-color: var(--color-primary, #222);
    }

    &:disabled {
      background: var(--color-bg);
      color: var(--color-primary, #222);
      cursor: default;
    }
  }

  .actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;

    .button {
      padding: var(--btn-padding, 8px 16px);
      border-radius: var(--btn-border-radius, 4px);
      font-size: var(--btn-font-size, 14px);
      border: none;
      cursor: pointer;

      &--primary {
        background: var(--btn-bg, #222);
        color: var(--btn-color, #fff);
      }

      &--secondary {
        background: var(--color-bg);
        color: var(--color-primary, #222);
        border: 1px solid var(--color-border, #e0e0e0);
      }

      &--danger {
        background: var(--color-bg);
        color: #e53935;
        border: 1px solid #e53935;
      }
    }
  }
}
</style>
