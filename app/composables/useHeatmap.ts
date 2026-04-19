export type HeatmapEntry = {
  achievement_rate: number
  level: 0 | 1 | 2 | 3 | 4
}

export type HeatmapData = Record<string, HeatmapEntry>

export function useHeatmap() {
  const data = ref<HeatmapData>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetch(year: number, month?: number) {
    loading.value = true
    error.value = null
    try {
      const params = month ? { year, month } : { year }
      const res = await $fetch<{ data: HeatmapData }>('/api/heatmap', { query: params })
      data.value = res.data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetch }
}
