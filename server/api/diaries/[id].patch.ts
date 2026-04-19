export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const { content } = await readBody(event)

  if (!content?.trim()) {
    throw createError({ statusCode: 400, message: 'content가 필요합니다.' })
  }

  const supabase = useSupabaseAdmin()
  const { data, error } = await supabase
    .from('diaries')
    .update({ content: content.trim() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })
  if (!data) throw createError({ statusCode: 404, message: '일기를 찾을 수 없습니다.' })

  return data
})
