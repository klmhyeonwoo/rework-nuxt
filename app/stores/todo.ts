import { defineStore } from "pinia";

/**
 * 투두 항목 엔티티
 */
export interface Todo {
  /** 고유 식별자 (UUID) */
  id: string;
  /** 할 일 제목 */
  title: string;
  /** 날짜 (YYYY-MM-DD) */
  date: string;
  /** 완료 여부 */
  is_completed: boolean;
  /** 생성 일시 */
  created_at: string;
}

export const useTodoStore = defineStore("todo", () => {
  const todos = ref<Todo[]>([]);
  const achievementRate = ref<number | null>(null);
  const currentDate = ref(new Date().toISOString().split("T")[0]!);
  /** API 쓰기 작업이 성공할 때마다 갱신되는 타임스탬프. 히트맵 refetch 트리거용. */
  const lastSyncedAt = ref<number>(0);
  const isLoading = reactive({
    create: false,
    read: false,
    update: false,
    delete: false,
  });

  /**
   * 특정 날짜의 투두 목록과 달성률을 서버에서 불러온다.
   *
   * @param date - 조회할 날짜 (YYYY-MM-DD)
   * @param uid - 사용자 ID
   */
  async function fetchTodos({ date, uid }: { date: string; uid: string }) {
    currentDate.value = date;
    try {
      isLoading.read = true;
      const data = await $fetch<{
        todos: Todo[];
        achievement_rate: number | null;
      }>(`/api/${uid}/todos?date=${date}`);
      todos.value = data.todos;
      achievementRate.value = data.achievement_rate;
    } catch (e) {
      throw e;
    } finally {
      isLoading.read = false;
    }
  }

  /**
   * 투두를 추가한다. 낙관적 업데이트로 즉시 UI에 반영하고,
   * API 실패 시 임시 항목을 롤백한다.
   *
   * @param title - 추가할 투두 제목
   * @throws API 요청 실패 시 에러를 다시 던진다
   */
  async function addTodo(title: string) {
    const tempId = `temp-${Date.now()}`;
    const tempTodo: Todo = {
      id: tempId,
      title,
      date: currentDate.value,
      is_completed: false,
      created_at: new Date().toISOString(),
    };
    todos.value.push(tempTodo);
    recalcAchievementRate();

    try {
      isLoading.create = true;
      const created = await $fetch<Todo>("/api/todos", {
        method: "POST",
        body: { title, date: currentDate.value },
      });
      const index = todos.value.findIndex((t) => t.id === tempId);
      if (index !== -1) todos.value[index] = created;
      lastSyncedAt.value = Date.now();
    } catch (e) {
      todos.value = todos.value.filter((t) => t.id !== tempId);
      recalcAchievementRate();
      throw e;
    } finally {
      isLoading.create = false;
    }
  }

  /**
   * 투두의 완료 상태를 토글한다. 낙관적 업데이트로 즉시 반영하고,
   * API 실패 시 원래 상태로 롤백한다.
   *
   * @param id - 토글할 투두 ID
   * @throws API 요청 실패 시 에러를 다시 던진다
   */
  async function toggleTodo(id: string) {
    const todo = todos.value.find((t) => t.id === id);
    if (!todo) return;

    todo.is_completed = !todo.is_completed;
    recalcAchievementRate();

    try {
      isLoading.update = true;
      const updated = await $fetch<Todo>(`/api/todos/${id}`, {
        method: "PATCH",
        body: { is_completed: todo.is_completed },
      });
      const index = todos.value.findIndex((t) => t.id === id);
      if (index !== -1) todos.value[index] = updated;
      lastSyncedAt.value = Date.now();
    } catch (e) {
      todo.is_completed = !todo.is_completed;
      recalcAchievementRate();
      throw e;
    } finally {
      isLoading.update = false;
    }
  }

  /**
   * 투두를 삭제한다. 낙관적 업데이트로 즉시 제거하고,
   * API 실패 시 목록을 롤백한다.
   *
   * @param id - 삭제할 투두 ID
   * @throws API 요청 실패 시 에러를 다시 던진다
   */
  async function deleteTodo(id: string) {
    const backup = [...todos.value];
    todos.value = todos.value.filter((t) => t.id !== id);
    recalcAchievementRate();

    try {
      isLoading.delete = true;
      await $fetch(`/api/todos/${id}`, { method: "DELETE" });
      lastSyncedAt.value = Date.now();
    } catch (e) {
      todos.value = backup;
      recalcAchievementRate();
      throw e;
    } finally {
      isLoading.delete = false;
    }
  }

  /**
   * 현재 투두 목록 기준으로 달성률을 재계산한다.
   * 투두가 없으면 null로 설정한다 (히트맵 무채색 처리용).
   */
  function recalcAchievementRate() {
    if (todos.value.length === 0) {
      achievementRate.value = null;
      return;
    }
    const completed = todos.value.filter((t) => t.is_completed).length;
    achievementRate.value = Math.round((completed / todos.value.length) * 100);
  }

  return {
    todos,
    achievementRate,
    currentDate,
    lastSyncedAt,
    isLoading,
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
});
