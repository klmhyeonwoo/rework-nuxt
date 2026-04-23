type HeatmapEntry = {
  achievement_rate: number
  level: 0 | 1 | 2 | 3 | 4
}

function toLevel(rate: number): 0 | 1 | 2 | 3 | 4 {
  if (rate === 0) return 0
  if (rate <= 33) return 1
  if (rate <= 66) return 2
  if (rate <= 99) return 3
  return 4
}

export default defineEventHandler(async (event) => {
  const uid = getRouterParam(event, 'uid')
  const { year, month } = getQuery(event) as { year?: string; month?: string }

  if (!year || !/^\d{4}$/.test(year)) {
    throw createError({ statusCode: 400, message: 'year 파라미터가 필요합니다. (YYYY)' })
  }
  if (month && !/^(0?[1-9]|1[0-2])$/.test(month)) {
    throw createError({ statusCode: 400, message: 'month는 1–12 사이 값이어야 합니다.' })
  }

  const supabase = useSupabaseAdmin()

  let from: string
  let to: string

  if (month) {
    const m = month.padStart(2, '0')
    const lastDay = new Date(Number(year), Number(month), 0).getDate()
    from = `${year}-${m}-01`
    to = `${year}-${m}-${lastDay}`
  } else {
    from = `${year}-01-01`
    to = `${year}-12-31`
  }

  const { data, error } = await supabase
    .from('todos')
    .select('date, is_completed')
    .eq('user_id', uid)
    .gte('date', from)
    .lte('date', to)

  if (error) throw createError({ statusCode: 500, message: error.message })

  const grouped: Record<string, { total: number; completed: number }> = {}
  for (const row of data ?? []) {
    if (!grouped[row.date]) grouped[row.date] = { total: 0, completed: 0 }
    grouped[row.date].total++
    if (row.is_completed) grouped[row.date].completed++
  }

  const result: Record<string, HeatmapEntry> = {}
  for (const [date, { total, completed }] of Object.entries(grouped)) {
    const rate = total === 0 ? 0 : Math.floor((completed / total) * 100)
    result[date] = { achievement_rate: rate, level: toLevel(rate) }
  }

  return { year: Number(year), month: month ? Number(month) : undefined, data: result }
})
