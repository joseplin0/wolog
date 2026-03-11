import type { Component } from 'vue'

/**
 * WologPlugin — 插件接口定义
 *
 * 每个插件需实现此接口，提供：
 *   1. 元信息（id, name, icon）
 *   2. 时间轴卡片组件
 *   3. 条目表单组件
 *   4. 数据验证逻辑
 */
export interface WologPlugin {
  /** 插件唯一标识，对应 TimelineEntry.type */
  id: string
  /** 插件显示名称 */
  name: string
  /** 插件图标 (emoji 或 icon class) */
  icon: string
  /** 渲染在时间轴上的卡片组件 */
  TimelineCard: Component
  /** 创建/编辑条目时的表单组件 */
  EntryForm: Component
  /** 验证 content 字段是否合法 */
  validateContent: (data: unknown) => boolean
  /** 可选：content 的默认值（创建新条目时预填） */
  defaultContent?: () => Record<string, unknown>
}
