export default defineEventHandler(async (event) => {
  const accessToken = getCookie(event, 'sb-access-token')

  if (!accessToken) {
    throw createError({ statusCode: 401, message: '로그인이 필요합니다.' })
  }

  const supabase = useSupabaseAdmin()
  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken)

  if (authError || !authData.user) {
    throw createError({ statusCode: 401, message: '유효하지 않은 세션입니다.' })
  }

  const { nickname, bio } = await readBody(event)

  if (nickname === undefined && bio === undefined) {
    throw createError({ statusCode: 400, message: 'nickname 또는 bio 중 하나 이상 필요합니다.' })
  }

  if (nickname !== undefined && (typeof nickname !== 'string' || nickname.trim().length === 0)) {
    throw createError({ statusCode: 400, message: 'nickname은 비어 있을 수 없습니다.' })
  }

  if (bio !== undefined && typeof bio !== 'string') {
    throw createError({ statusCode: 400, message: 'bio는 문자열이어야 합니다.' })
  }

  const updates: Record<string, string> = { user_id: authData.user.id }
  if (nickname !== undefined) updates.nickname = nickname.trim()
  if (bio !== undefined) updates.bio = bio

  const { data, error } = await supabase
    .from('profiles')
    .upsert(updates, { onConflict: 'user_id' })
    .select('nickname, bio')
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  return {
    user_id: authData.user.id,
    nickname: data.nickname ?? null,
    bio: data.bio ?? null,
  }
})
