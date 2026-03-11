import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TimelineEntry } from '@/database/entry.model'
import { EntryRepository } from '@/database/entry.repository'

/**
 * CalendarStore — 日历视图状态管理
 *
 * 管理当前选中年月、每日条目统计、选中日期的条目列表。
 */
export const useCalendarStore = defineStore('calendar', () => {
  const currentYear = ref(new Date().getFullYear())
  const currentMonth = ref(new Date().getMonth())
  const selectedDate = ref<number | null>(null)

  /** 当月每日条目计数 Map<day, count> */
  const dailyStats = ref<Map<number, number>>(new Map())

  /** 选中日期的条目列表 */
  const selectedDateEntries = ref<TimelineEntry[]>([])

  const loading = ref(false)

  /** 当前月份标题 */
  const monthTitle = computed(() => {
    const date = new Date(currentYear.value, currentMonth.value)
    return date.toLocaleString('zh-CN', { year: 'numeric', month: 'long' })
  })

  /** 加载当月统计数据 */
  async function loadMonthStats() {
    loading.value = true
    try {
      dailyStats.value = await EntryRepository.getMonthlyStats(
        currentYear.value,
        currentMonth.value
      )
    } finally {
      loading.value = false
    }
  }

  /** 切换到上一个月 */
  async function prevMonth() {
    if (currentMonth.value === 0) {
      currentMonth.value = 11
      currentYear.value--
    } else {
      currentMonth.value--
    }
    selectedDate.value = null
    selectedDateEntries.value = []
    await loadMonthStats()
  }

  /** 切换到下一个月 */
  async function nextMonth() {
    if (currentMonth.value === 11) {
      currentMonth.value = 0
      currentYear.value++
    } else {
      currentMonth.value++
    }
    selectedDate.value = null
    selectedDateEntries.value = []
    await loadMonthStats()
  }

  /** 选中某一天，加载该天的条目 */
  async function selectDate(day: number) {
    selectedDate.value = day
    const start = new Date(currentYear.value, currentMonth.value, day, 0, 0, 0, 0).getTime()
    const end = new Date(currentYear.value, currentMonth.value, day, 23, 59, 59, 999).getTime()
    selectedDateEntries.value = await EntryRepository.getByTimeRange(start, end)
  }

  return {
    currentYear,
    currentMonth,
    selectedDate,
    dailyStats,
    selectedDateEntries,
    loading,
    monthTitle,
    loadMonthStats,
    prevMonth,
    nextMonth,
    selectDate,
  }
})
