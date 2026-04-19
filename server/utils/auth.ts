import type { H3Event } from 'h3'

export async function requireAuth(event: H3Event) {
  const accessToken = getCookie(event, 'sb-access-token')

  if (!accessToken) {
    throw createError({ statusCode: 401, message: '로그인이 필요합니다.' })
  }

  const supabase = useSupabaseAdmin()
  const { data, error } = await supabase.auth.getUser(accessToken)

  if (error || !data.user) {
    throw createError({ statusCode: 401, message: '유효하지 않은 세션입니다.' })
  }

  return data.user
}
