import type { AuthTokens, User } from '@wolog/types'

const TOKEN_KEY = 'wolog_access_token'
const REFRESH_KEY = 'wolog_refresh_token'
const USER_KEY = 'wolog_user'

/**
 * AuthClient — JWT Token 管理
 *
 * 负责 token 的存取、刷新，以及用户状态判断。
 * 子应用和主应用统一使用此 SDK。
 */
export class AuthClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || '/api/auth'
  }

  /** 获取当前 access token */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  /** 获取缓存的用户信息 */
  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  }

  /** 是否已登录 */
  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  /** 存储 token 和用户信息 */
  setAuth(tokens: AuthTokens, user: User): void {
    localStorage.setItem(TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  /** 清除认证状态 */
  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  }

  /** 登录 */
  async login(username: string, password: string): Promise<{ tokens: AuthTokens; user: User }> {
    const res = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || '登录失败')
    }
    const data = await res.json()
    this.setAuth(data.tokens, data.user)
    return data
  }

  /** 注册 */
  async register(username: string, password: string, displayName: string): Promise<{ tokens: AuthTokens; user: User }> {
    const res = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, displayName }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || '注册失败')
    }
    const data = await res.json()
    this.setAuth(data.tokens, data.user)
    return data
  }

  /** 登出 */
  logout(): void {
    this.clearAuth()
  }

  /** 创建带 Authorization header 的 fetch */
  async authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken()
    const headers = new Headers(options.headers)
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return fetch(url, { ...options, headers })
  }
}

/** 全局单例 */
export const authClient = new AuthClient()
