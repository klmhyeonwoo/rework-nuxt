import { defineStore } from 'pinia'

/**
 * 인증된 사용자 정보
 */
interface AuthUser {
  /** Supabase Auth 사용자 ID */
  id: string
  /** 이메일 주소 */
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isLoggedIn = computed(() => user.value !== null)

  /**
   * 이메일·비밀번호로 로그인한다.
   * 서버에서 환경변수 ALLOWED_EMAIL과 대조 후 Supabase 세션을 쿠키에 저장한다.
   *
   * @param email - 로그인 이메일
   * @param password - 로그인 비밀번호
   * @throws 허용되지 않은 계정이거나 Supabase 인증 실패 시 401
   */
  async function login(email: string, password: string) {
    const data = await $fetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = data.user
  }

  /**
   * 로그아웃한다. 서버에서 세션 쿠키를 삭제한다.
   */
  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  /**
   * 현재 쿠키 세션으로 사용자 정보를 복원한다.
   * 세션이 없거나 만료된 경우 조용히 null로 처리한다 (페이지 진입 시 호출).
   */
  async function fetchMe() {
    try {
      const data = await $fetch<{ user: AuthUser }>('/api/auth/me')
      user.value = data.user
    } catch {
      user.value = null
    }
  }

  return { user, isLoggedIn, login, logout, fetchMe }
})
