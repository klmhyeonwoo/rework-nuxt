export default defineEventHandler(async (event) => {
  const uid = getRouterParam(event, 'uid')

  const supabase = useSupabaseAdmin()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('avatar_url, nickname, bio')
    .eq('user_id', uid)
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, message: error.message })

  return {
    user_id: uid,
    avatar_url: profile?.avatar_url ?? null,
    nickname: profile?.nickname ?? null,
    bio: profile?.bio ?? null,
  }
})
