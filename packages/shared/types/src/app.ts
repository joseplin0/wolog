/** 子应用注册描述 — 前端从 API 动态加载 */
export interface SubAppManifest {
  /** 唯一标识, 如 'timeline' */
  id: string
  /** 显示名称, 如 '时间轴' */
  name: string
  /** 图标 (emoji 或 icon class) */
  icon: string
  /** 子应用前端入口 URL */
  entry: string
  /** 路由匹配规则, 如 '/app/timeline' */
  activeRule: string
  /** 传递给子应用的额外参数 */
  props?: Record<string, unknown>
  /** 是否需要登录 (默认 true) */
  requireAuth?: boolean
  /** 是否为内置子应用 */
  builtIn?: boolean
  /** 子应用后端 URL (外部子应用用，网关代理) */
  backendUrl?: string
}
