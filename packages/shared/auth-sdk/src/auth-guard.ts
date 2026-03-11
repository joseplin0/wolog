import type { Router } from 'vue-router'
import { authClient } from './auth-client'

/**
 * 创建 Vue Router 认证守卫
 *
 * 用法：
 *   import { createAuthGuard } from '@wolog/auth-sdk'
 *   router.beforeEach(createAuthGuard())
 *
 * 在 wujie 子应用中运行时，跳转到主应用的登录页。
 * 独立运行时，跳转到自身的 /login 路由。
 */
export function createAuthGuard(options?: { loginPath?: string }) {
  const loginPath = options?.loginPath || '/app/auth/login'

  return (to: Parameters<Parameters<Router['beforeEach']>[0]>[0]) => {
    // 不拦截登录相关页面
    if (to.path.includes('/auth/')) return true

    // 不需要认证的路由
    if (to.meta?.public) return true

    // 未登录 → 跳转登录
    if (!authClient.isAuthenticated()) {
      const redirect = encodeURIComponent(to.fullPath)

      // 在 wujie 子应用内 → 通知主应用跳转
      if (window.$wujie) {
        window.$wujie?.bus.$emit('auth:required', { redirect: to.fullPath })
        return false
      }

      // 独立运行 → 本地跳转
      return { path: loginPath, query: { redirect } }
    }

    return true
  }
}
