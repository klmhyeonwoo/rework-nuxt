const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const form = await readMultipartFormData(event)
  const file = form?.find((f) => f.name === 'avatar')

  if (!file || !file.data) {
    throw createError({ statusCode: 400, message: 'avatar 파일이 필요합니다.' })
  }
  if (!ALLOWED_TYPES.includes(file.type ?? '')) {
    throw createError({ statusCode: 400, message: 'jpeg, png, webp, gif만 업로드 가능합니다.' })
  }
  if (file.data.length > MAX_SIZE) {
    throw createError({ statusCode: 400, message: '파일 크기는 5MB 이하여야 합니다.' })
  }

  const ext = (file.type ?? '').split('/')[1]
  const path = `${user.id}/avatar.${ext}`

  const supabase = useSupabaseAdmin()

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file.data, { contentType: file.type, upsert: true })

  if (uploadError) {
    throw createError({ statusCode: 500, message: uploadError.message })
  }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { avatar_url: publicUrl },
  })

  if (updateError) {
    throw createError({ statusCode: 500, message: updateError.message })
  }

  return { avatar_url: publicUrl }
})
