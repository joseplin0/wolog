import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TimelineEntry, CreateEntryInput } from '@/database/entry.model'
import { EntryRepository } from '@/database/entry.repository'

/**
 * TimelineStore — 时间轴视图状态管理
 *
 * 管理当前视口中的条目列表、加载状态、无限滚动分页。
 */
export const useTimelineStore = defineStore('timeline', () => {
  const entries = ref<TimelineEntry[]>([])
  const loading = ref(false)
  const hasMore = ref(true)

  /** 每次加载的条目数 */
  const PAGE_SIZE = 20
  /** 当前已加载的偏移量 */
  let currentOffset = 0

  /** 初始加载（重置并拉取最新条目） */
  async function loadInitial() {
    loading.value = true
    currentOffset = 0
    try {
      // 拉取最近 30 天的数据作为初始窗口
      const now = Date.now()
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
      const result = await EntryRepository.getByTimeRange(thirtyDaysAgo, now, {
        limit: PAGE_SIZE,
      })
      entries.value = result
      currentOffset = result.length
      hasMore.value = result.length >= PAGE_SIZE
    } finally {
      loading.value = false
    }
  }

  /** 加载更多（向过去方向翻页） */
  async function loadMore() {
    if (loading.value || !hasMore.value) return
    loading.value = true
    try {
      const oldest = entries.value.length > 0
        ? entries.value[entries.value.length - 1].timestamp
        : Date.now()

      // 从最老条目继续向前查 30 天
      const rangeEnd = oldest - 1
      const rangeStart = rangeEnd - 30 * 24 * 60 * 60 * 1000

      const result = await EntryRepository.getByTimeRange(rangeStart, rangeEnd, {
        limit: PAGE_SIZE,
      })
      entries.value.push(...result)
      currentOffset += result.length
      hasMore.value = result.length >= PAGE_SIZE
    } finally {
      loading.value = false
    }
  }

  /** 添加新条目（插入到列表头部） */
  async function addEntry(input: CreateEntryInput): Promise<TimelineEntry> {
    const entry = await EntryRepository.add(input)
    // 按时间戳插入到正确位置（通常是头部）
    const idx = entries.value.findIndex((e) => e.timestamp < entry.timestamp)
    if (idx === -1) {
      entries.value.push(entry)
    } else {
      entries.value.splice(idx, 0, entry)
    }
    return entry
  }

  /** 删除条目 */
  async function removeEntry(id: string) {
    await EntryRepository.delete(id)
    entries.value = entries.value.filter((e) => e.id !== id)
  }

  /** 更新条目 */
  async function updateEntry(id: string, changes: Partial<Omit<TimelineEntry, 'id' | 'createdAt'>>) {
    await EntryRepository.update(id, changes)
    const idx = entries.value.findIndex((e) => e.id === id)
    if (idx !== -1) {
      entries.value[idx] = { ...entries.value[idx], ...changes, updatedAt: Date.now() }
    }
  }

  return { entries, loading, hasMore, loadInitial, loadMore, addEntry, removeEntry, updateEntry }
})
