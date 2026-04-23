/**
 * 날짜별 히트맵 항목
 */
export type HeatmapEntry = {
  /** 투두 달성률 (0–100 정수) */
  achievement_rate: number;
  /**
   * 채도 레벨 (0: 기록 없음, 1–3: 낮음~높음, 4: 100%)
   * CSS 변수 --heatmap-0 ~ --heatmap-4 에 대응
   */
  level: 0 | 1 | 2 | 3 | 4;
};

/** 날짜(YYYY-MM-DD) → HeatmapEntry 맵 */
export type HeatmapData = Record<string, HeatmapEntry>;

/**
 * 잔디 히트맵 데이터를 관리하는 composable.
 * ActivityHeatmap 컴포넌트의 부모에서 호출해 data를 props로 주입한다.
 *
 * @example
 * const heatmap = useHeatmap()
 * await heatmap.fetch(2026)
 * // <ActivityHeatmap :year="2026" :data="heatmap.data.value" />
 */
export function useHeatmap() {
  const data = ref<HeatmapData>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * 연간 또는 월간 히트맵 데이터를 서버에서 불러온다.
   *
   * @param year - 조회할 연도
   * @param month - 조회할 월 (생략 시 연간 전체 조회)
   */
  async function fetch({
    uid,
    year,
    month,
  }: {
    uid: string;
    year: number;
    month?: number;
  }) {
    loading.value = true;
    error.value = null;
    try {
      const params = month ? { year, month } : { year };
      const res = await $fetch<{ data: HeatmapData }>(`/api/${uid}/heatmap`, {
        query: params,
      });
      data.value = res.data;
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : "데이터를 불러오지 못했습니다.";
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, fetch };
}
