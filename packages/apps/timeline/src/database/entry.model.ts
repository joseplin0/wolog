/**
 * TimelineEntry — 时间轴核心数据模型
 *
 * 所有插件的数据都以此结构存储。
 * `content` 字段为插件自定义的 JSON payload，类型由各插件自行约束。
 */
export interface TimelineEntry {
  /** 全局唯一 ID (ULID)，自带时间排序特性 */
  id: string
  /** 事件发生的 Unix 毫秒时间戳 */
  timestamp: number
  /** 插件类型标识，如 'note'、'expense' */
  type: string
  /** 条目摘要标题 */
  title: string
  /** 插件自定义数据载荷 */
  content: Record<string, unknown>
  /** 可选标签列表 */
  tags: string[]
  /** 创建时间 (Unix ms) */
  createdAt: number
  /** 最后修改时间 (Unix ms) */
  updatedAt: number
}

/** 创建条目时的输入类型 — 省略自动生成的字段 */
export type CreateEntryInput = Omit<TimelineEntry, 'id' | 'createdAt' | 'updatedAt'>
