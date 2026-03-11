/**
 * wujie 类型声明
 * 子应用在 wujie 沙箱中运行时，window 上会注入 $wujie 对象
 */
interface WujieProps {
  bus: {
    $emit: (event: string, data?: unknown) => void
    $on: (event: string, callback: (data?: unknown) => void) => void
    $off: (event: string, callback?: (data?: unknown) => void) => void
  }
  props?: Record<string, unknown>
}

declare global {
  interface Window {
    $wujie?: WujieProps
  }
}

export {}
