export default defineEventHandler(async (event) => {
  const accessToken = getCookie(event, 'sb-access-token')

  if (!accessToken) {
    throw createError({ statusCode: 401, message: '로그인이 필요합니다.' })
  }

  const supabase = useSupabaseAdmin()
  const { data, error } = await supabase.auth.getUser(accessToken)

  if (error || !data.user) {
    throw createError({ statusCode: 401, message: '유효하지 않은 세션입니다.' })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, bio')
    .eq('user_id', data.user.id)
    .maybeSingle()

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      avatar_url: data.user.user_metadata?.avatar_url ?? null,
      nickname: profile?.nickname ?? null,
      bio: profile?.bio ?? null,
    },
  }
})
