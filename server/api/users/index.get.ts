export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))
  const from = (page - 1) * limit
  const to = from + limit - 1

  const supabase = useSupabaseAdmin()
  const { data, error, count } = await supabase
    .from('profiles')
    .select('user_id, nickname, bio, avatar_url', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return {
    users: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      total_pages: Math.ceil((count ?? 0) / limit),
    },
  }
})
