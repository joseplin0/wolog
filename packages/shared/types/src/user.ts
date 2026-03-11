/** 用户模型 */
export interface User {
  id: string
  username: string
  displayName: string
  email?: string
  avatar?: string
  createdAt: string
}

/** JWT Token 对 */
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

/** 登录请求 */
export interface LoginDto {
  username: string
  password: string
}

/** 注册请求 */
export interface RegisterDto {
  username: string
  password: string
  displayName: string
}
