import { defineStore } from "pinia";

/**
 * 일기 엔티티
 */
export interface Diary {
  /** 고유 식별자 (UUID) */
  id: string;
  /** 날짜 (YYYY-MM-DD) — 날짜당 1개 제한 (DB UNIQUE 제약) */
  date: string;
  /** 일기 본문 */
  content: string;
  /** 생성 일시 */
  created_at: string;
  /** 마지막 수정 일시 */
  updated_at: string;
}

export const useDiaryStore = defineStore("diary", () => {
  const diary = ref<Diary | null>(null);
  const currentDate = ref(new Date().toISOString().split("T")[0]);
  const isLoading = reactive({
    create: false,
    read: false,
    update: false,
    delete: false,
  });

  /**
   * 특정 날짜의 일기를 서버에서 불러온다.
   * 일기가 없거나 요청 실패 시 null로 초기화한다.
   *
   * @param date - 조회할 날짜 (YYYY-MM-DD)
   */
  async function fetchDiary(date: string) {
    currentDate.value = date;
    try {
      isLoading.read = true;
      diary.value = await $fetch<Diary | null>(`/api/diaries?date=${date}`);
    } catch {
      diary.value = null;
    } finally {
      isLoading.read = false;
    }
  }

  /**
   * 일기를 저장한다. 기존 일기가 있으면 PATCH, 없으면 POST로 처리한다.
   *
   * @param content - 저장할 일기 본문
   * @throws 동일 날짜 일기가 이미 존재하면 409, 인증 실패 시 401
   */
  async function saveDiary(content: string) {
    const isUpdate = !!diary.value;
    try {
      isLoading[isUpdate ? "update" : "create"] = true;
      if (isUpdate) {
        diary.value = await $fetch<Diary>(`/api/diaries/${diary.value!.id}`, {
          method: "PATCH",
          body: { content },
        });
      } else {
        diary.value = await $fetch<Diary>("/api/diaries", {
          method: "POST",
          body: { content, date: currentDate.value },
        });
      }
    } catch (e) {
      throw e;
    } finally {
      isLoading[isUpdate ? "update" : "create"] = false;
    }
  }

  /**
   * 현재 날짜의 일기를 삭제한다.
   * diary가 null이면 아무 작업도 하지 않는다.
   */
  async function deleteDiary() {
    if (!diary.value) return;
    try {
      isLoading.delete = true;
      await $fetch(`/api/diaries/${diary.value.id}`, { method: "DELETE" });
      diary.value = null;
    } catch (e) {
      throw e;
    } finally {
      isLoading.delete = false;
    }
  }

  return { diary, currentDate, fetchDiary, saveDiary, deleteDiary, isLoading };
});
