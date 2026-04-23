export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const supabase = useSupabaseAdmin()

  const { data: files } = await supabase.storage
    .from('avatars')
    .list(user.id)

  if (files && files.length > 0) {
    const paths = files.map((f) => `${user.id}/${f.name}`)
    const { error } = await supabase.storage.from('avatars').remove(paths)
    if (error) throw createError({ statusCode: 500, message: error.message })
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { avatar_url: null },
  })

  if (updateError) {
    throw createError({ statusCode: 500, message: updateError.message })
  }

  return { ok: true }
})
