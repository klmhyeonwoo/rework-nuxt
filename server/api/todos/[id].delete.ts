export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const supabase = useSupabaseAdmin()
  const { error, count } = await supabase
    .from('todos')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw createError({ statusCode: 500, message: error.message })
  if (count === 0) throw createError({ statusCode: 404, message: '항목을 찾을 수 없습니다.' })

  return { ok: true }
})
