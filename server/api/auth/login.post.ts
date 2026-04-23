export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({ statusCode: 400, message: '이메일과 비밀번호를 입력해주세요.' })
  }

  const supabase = useSupabaseAdmin()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw createError({ statusCode: 401, message: error.message })
  }

  setCookie(event, 'sb-access-token', data.session!.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: data.session!.expires_in,
    path: '/',
  })
  setCookie(event, 'sb-refresh-token', data.session!.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, bio')
    .eq('user_id', data.user!.id)
    .maybeSingle()

  return {
    user: {
      id: data.user!.id,
      email: data.user!.email,
      avatar_url: data.user!.user_metadata?.avatar_url ?? null,
      nickname: profile?.nickname ?? null,
      bio: profile?.bio ?? null,
    },
  }
})
