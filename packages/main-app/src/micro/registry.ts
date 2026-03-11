import type { SubAppManifest } from '@wolog/types'

/**
 * 子应用注册表
 *
 * 内置子应用写死在代码中，外部子应用从 API 动态拉取。
 * 合并后作为侧边栏菜单和路由的数据源。
 */

/** 内置子应用列表 */
const builtInApps: SubAppManifest[] = [
  {
    id: 'auth',
    name: '登录',
    icon: '🔐',
    entry: 'http://localhost:5171',
    activeRule: '/app/auth',
    requireAuth: false,
    builtIn: true,
  },
  {
    id: 'timeline',
    name: '时间轴',
    icon: '🕰️',
    entry: 'http://localhost:5172',
    activeRule: '/app/timeline',
    requireAuth: true,
    builtIn: true,
  },
]

/** 从后端 API 获取外部子应用注册表 */
async function fetchExternalApps(): Promise<SubAppManifest[]> {
  try {
    const res = await fetch('/api/apps/registry')
    if (!res.ok) return []
    return res.json()
  } catch {
    // 后端不可用（离线模式），只用内置子应用
    console.warn('[Wolog] 无法加载外部子应用注册表，使用内置应用')
    return []
  }
}

/** 获取所有子应用（内置 + 外部） */
export async function loadAppRegistry(): Promise<SubAppManifest[]> {
  const externalApps = await fetchExternalApps()
  return [...builtInApps, ...externalApps]
}

/** 获取需要在侧栏显示的子应用（排除 auth） */
export function getVisibleApps(apps: SubAppManifest[]): SubAppManifest[] {
  return apps.filter((app) => app.id !== 'auth')
}
