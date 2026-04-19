export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({ statusCode: 400, message: '이메일과 비밀번호를 입력해주세요.' })
  }

  if (email !== config.allowedEmail || password !== config.allowedPassword) {
    throw createError({ statusCode: 401, message: '허용되지 않은 계정입니다.' })
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

  return {
    user: {
      id: data.user!.id,
      email: data.user!.email,
    },
  }
})
