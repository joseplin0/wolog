import { createRouter, createWebHistory } from 'vue-router'
import { authClient } from '@wolog/auth-sdk'

const routes = [
  {
    // 所有 /app/* 路径由 MainShell 的 SubAppContainer 处理
    path: '/app/:appId/:pathMatch(.*)*',
    name: 'sub-app',
    component: () => import('@/layout/MainShell.vue'),
  },
  {
    path: '/',
    redirect: '/app/timeline',
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局路由守卫 — 跳转需要认证的子应用时检查登录状态
router.beforeEach((to) => {
  // auth 子应用不拦截
  if (to.path.startsWith('/app/auth')) return true

  // 未登录 → 跳转登录
  if (!authClient.isAuthenticated()) {
    return {
      path: '/app/auth/login',
      query: { redirect: to.fullPath },
    }
  }

  return true
})
