export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const updates: Record<string, unknown> = {}
  if (typeof body.is_completed === 'boolean') updates.is_completed = body.is_completed
  if (typeof body.title === 'string' && body.title.trim()) updates.title = body.title.trim()

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, message: '수정할 필드가 없습니다.' })
  }

  const supabase = useSupabaseAdmin()
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })
  if (!data) throw createError({ statusCode: 404, message: '항목을 찾을 수 없습니다.' })

  return data
})
