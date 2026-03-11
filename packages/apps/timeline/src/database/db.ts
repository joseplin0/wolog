import Dexie, { type Table } from 'dexie'
import type { TimelineEntry } from './entry.model'

/**
 * WologDatabase — Dexie.js 数据库定义
 *
 * 使用 IndexedDB 作为本地持久化存储，支持离线运行。
 * 索引策略：
 *   - `id`：主键 (ULID，外部提供)
 *   - `timestamp`：核心查询维度，支持范围查询
 *   - `type`：按插件类型过滤
 *   - `*tags`：多值索引，支持按标签检索
 */
class WologDatabase extends Dexie {
  entries!: Table<TimelineEntry, string>

  constructor() {
    super('wolog')

    this.version(1).stores({
      entries: 'id, timestamp, type, *tags',
    })
  }
}

/** 全局数据库单例 */
export const db = new WologDatabase()
