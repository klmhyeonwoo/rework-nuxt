export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const { content, date } = await readBody(event)

  if (!content?.trim()) {
    throw createError({ statusCode: 400, message: 'content가 필요합니다.' })
  }

  const diaryDate = date ?? new Date().toISOString().split('T')[0]
  if (!/^\d{4}-\d{2}-\d{2}$/.test(diaryDate)) {
    throw createError({ statusCode: 400, message: 'date 형식이 올바르지 않습니다. (YYYY-MM-DD)' })
  }

  const supabase = useSupabaseAdmin()
  const { data, error } = await supabase
    .from('diaries')
    .insert({ user_id: user.id, date: diaryDate, content: content.trim() })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, message: '해당 날짜의 일기가 이미 존재합니다. PATCH로 수정해주세요.' })
    }
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
