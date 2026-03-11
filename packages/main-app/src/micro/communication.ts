/**
 * 跨应用通信 EventBus
 *
 * 基于 wujie 内置的 bus 机制。
 * 主应用监听子应用事件，统一处理认证跳转、路由导航等。
 */

/** 事件名常量 */
export const AppEvents = {
  /** 子应用请求登录（未鉴权） */
  AUTH_REQUIRED: 'auth:required',
  /** 子应用请求登出 */
  AUTH_LOGOUT: 'auth:logout',
  /** 登录成功 */
  AUTH_SUCCESS: 'auth:success',
  /** 跨应用导航 */
  NAVIGATE: 'app:navigate',
} as const
