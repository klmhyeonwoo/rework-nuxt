export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const { title, date } = await readBody(event)

  if (!title?.trim()) {
    throw createError({ statusCode: 400, message: 'title이 필요합니다.' })
  }

  const todoDate = date ?? new Date().toISOString().split('T')[0]
  if (!/^\d{4}-\d{2}-\d{2}$/.test(todoDate)) {
    throw createError({ statusCode: 400, message: 'date 형식이 올바르지 않습니다. (YYYY-MM-DD)' })
  }

  const supabase = useSupabaseAdmin()
  const { data, error } = await supabase
    .from('todos')
    .insert({ user_id: user.id, title: title.trim(), date: todoDate })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})
