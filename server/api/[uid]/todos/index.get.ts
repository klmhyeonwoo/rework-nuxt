export default defineEventHandler(async (event) => {
  const uid = getRouterParam(event, 'uid')
  const { date } = getQuery(event) as { date?: string }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({ statusCode: 400, message: 'date 파라미터가 필요합니다. (YYYY-MM-DD)' })
  }

  const supabase = useSupabaseAdmin()
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', uid)
    .eq('date', date)
    .order('created_at', { ascending: true })

  if (error) throw createError({ statusCode: 500, message: error.message })

  const todos = data ?? []
  const total = todos.length
  const completed = todos.filter((t) => t.is_completed).length
  const achievementRate = total === 0 ? null : Math.floor((completed / total) * 100)

  return { date, achievement_rate: achievementRate, todos }
})
