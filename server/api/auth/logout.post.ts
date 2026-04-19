export default defineEventHandler(async (event) => {
  const accessToken = getCookie(event, 'sb-access-token')

  if (accessToken) {
    const supabase = useSupabaseAdmin()
    await supabase.auth.admin.signOut(accessToken)
  }

  deleteCookie(event, 'sb-access-token', { path: '/' })
  deleteCookie(event, 'sb-refresh-token', { path: '/' })

  return { ok: true }
})
