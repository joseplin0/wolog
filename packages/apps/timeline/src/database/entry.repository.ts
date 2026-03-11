import { ulid } from 'ulid'
import { db } from './db'
import type { TimelineEntry, CreateEntryInput } from './entry.model'

/**
 * EntryRepository — 条目 CRUD 操作封装
 *
 * 所有数据访问通过此模块，便于未来替换存储后端（如切换到 SQLite）。
 */
export const EntryRepository = {
  /** 创建新条目，自动生成 id / createdAt / updatedAt */
  async add(input: CreateEntryInput): Promise<TimelineEntry> {
    const now = Date.now()
    const entry: TimelineEntry = {
      ...input,
      id: ulid(),
      createdAt: now,
      updatedAt: now,
    }
    await db.entries.add(entry)
    return entry
  },

  /** 按时间范围查询条目（倒序），用于时间轴和日历视图 */
  async getByTimeRange(
    startMs: number,
    endMs: number,
    options?: { type?: string; limit?: number; offset?: number }
  ): Promise<TimelineEntry[]> {
    let entries = await db.entries
      .where('timestamp')
      .between(startMs, endMs, true, true)
      .toArray()

    if (options?.type) {
      entries = entries.filter((e) => e.type === options.type)
    }

    // 按时间戳倒序（最新在前）
    entries.sort((a, b) => b.timestamp - a.timestamp)

    if (options?.offset) {
      entries = entries.slice(options.offset)
    }
    if (options?.limit) {
      entries = entries.slice(0, options.limit)
    }

    return entries
  },

  /** 获取单个条目 */
  async getById(id: string): Promise<TimelineEntry | undefined> {
    return db.entries.get(id)
  },

  /** 更新条目（部分更新） */
  async update(
    id: string,
    changes: Partial<Omit<TimelineEntry, 'id' | 'createdAt'>>
  ): Promise<void> {
    await db.entries.update(id, {
      ...changes,
      updatedAt: Date.now(),
    })
  },

  /** 删除条目 */
  async delete(id: string): Promise<void> {
    await db.entries.delete(id)
  },

  /** 获取指定日期有多少条目（用于日历视图气泡） */
  async countByDate(dateMs: number): Promise<number> {
    const dayStart = new Date(dateMs)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dateMs)
    dayEnd.setHours(23, 59, 59, 999)

    return db.entries
      .where('timestamp')
      .between(dayStart.getTime(), dayEnd.getTime(), true, true)
      .count()
  },

  /** 批量获取一个月内每天的条目数量 */
  async getMonthlyStats(
    year: number,
    month: number
  ): Promise<Map<number, number>> {
    const start = new Date(year, month, 1).getTime()
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime()

    const entries = await db.entries
      .where('timestamp')
      .between(start, end, true, true)
      .toArray()

    const stats = new Map<number, number>()
    for (const entry of entries) {
      const day = new Date(entry.timestamp).getDate()
      stats.set(day, (stats.get(day) || 0) + 1)
    }

    return stats
  },
}
