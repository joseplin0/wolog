<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar.store'
import { usePluginManager } from '@/plugins/plugin-manager'

const calendarStore = useCalendarStore()
const pluginManager = usePluginManager()

onMounted(async () => {
  await calendarStore.loadMonthStats()
})

/** 星期标题 */
const weekDays = ['一', '二', '三', '四', '五', '六', '日']

/** 计算当月日历网格 */
const calendarGrid = computed(() => {
  const year = calendarStore.currentYear
  const month = calendarStore.currentMonth

  // 当月第一天是星期几 (0=Sunday, 转为 Mon=0)
  const firstDay = new Date(year, month, 1).getDay()
  const mondayOffset = firstDay === 0 ? 6 : firstDay - 1

  // 当月天数
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // 上月末尾补位
  const prevMonthDays = new Date(year, month, 0).getDate()

  const cells: Array<{ day: number; isCurrentMonth: boolean; count: number }> = []

  // 上月补位格
  for (let i = mondayOffset - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, isCurrentMonth: false, count: 0 })
  }

  // 当月日期
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      isCurrentMonth: true,
      count: calendarStore.dailyStats.get(d) || 0,
    })
  }

  // 下月补位（补满 6 行 × 7 列 = 42）
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, isCurrentMonth: false, count: 0 })
  }

  return cells
})

/** 是否是今天 */
function isToday(day: number): boolean {
  const now = new Date()
  return (
    calendarStore.currentYear === now.getFullYear() &&
    calendarStore.currentMonth === now.getMonth() &&
    day === now.getDate()
  )
}

/** 格式化时间 */
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="calendar-view">
    <!-- 月份导航 -->
    <div class="calendar-nav">
      <button class="calendar-nav__btn" @click="calendarStore.prevMonth()" aria-label="上一个月">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <h2 class="calendar-nav__title">{{ calendarStore.monthTitle }}</h2>
      <button class="calendar-nav__btn" @click="calendarStore.nextMonth()" aria-label="下一个月">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>

    <!-- 日历网格 -->
    <div class="calendar-grid">
      <!-- 星期标题行 -->
      <div v-for="wd in weekDays" :key="wd" class="calendar-grid__weekday">
        {{ wd }}
      </div>

      <!-- 日期格子 -->
      <button
        v-for="(cell, idx) in calendarGrid"
        :key="idx"
        class="calendar-grid__cell"
        :class="{
          'calendar-grid__cell--other': !cell.isCurrentMonth,
          'calendar-grid__cell--today': cell.isCurrentMonth && isToday(cell.day),
          'calendar-grid__cell--selected': cell.isCurrentMonth && calendarStore.selectedDate === cell.day,
          'calendar-grid__cell--has-entries': cell.isCurrentMonth && cell.count > 0,
        }"
        :disabled="!cell.isCurrentMonth"
        @click="cell.isCurrentMonth && calendarStore.selectDate(cell.day)"
      >
        <span class="calendar-grid__day">{{ cell.day }}</span>
        <span v-if="cell.isCurrentMonth && cell.count > 0" class="calendar-grid__badge">
          {{ cell.count > 9 ? '9+' : cell.count }}
        </span>
      </button>
    </div>

    <!-- 选中日期的条目列表 -->
    <Transition name="fade">
      <div v-if="calendarStore.selectedDate" class="day-detail">
        <h3 class="day-detail__title">
          {{ calendarStore.currentMonth + 1 }}月{{ calendarStore.selectedDate }}日
        </h3>

        <div v-if="calendarStore.selectedDateEntries.length === 0" class="day-detail__empty">
          暂无记录
        </div>

        <div v-else class="day-detail__list">
          <div
            v-for="entry in calendarStore.selectedDateEntries"
            :key="entry.id"
            class="day-entry"
          >
            <span class="day-entry__icon">
              {{ pluginManager.getPlugin(entry.type)?.icon || '📌' }}
            </span>
            <div class="day-entry__info">
              <span class="day-entry__title">{{ entry.title }}</span>
              <span class="day-entry__time">{{ formatTime(entry.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.calendar-view {
  max-width: 560px;
  margin: 0 auto;
}

/* 月份导航 */
.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.calendar-nav__btn {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.calendar-nav__btn:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.calendar-nav__title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text);
}

/* 日历网格 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  padding: 0.5rem;
}

.calendar-grid__weekday {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-tertiary);
  padding: 0.5rem 0;
  text-transform: uppercase;
}

.calendar-grid__cell {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  font-family: inherit;
}

.calendar-grid__cell:hover:not(:disabled) {
  background: var(--color-primary-light);
}

.calendar-grid__cell--other {
  opacity: 0.3;
  cursor: default;
}

.calendar-grid__cell--today .calendar-grid__day {
  background: var(--color-primary);
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-grid__cell--selected {
  background: var(--color-primary-light);
}

.calendar-grid__day {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text);
}

.calendar-grid__badge {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 0px 4px;
  border-radius: 999px;
  min-width: 16px;
  text-align: center;
  line-height: 1.4;
}

/* 日详情 */
.day-detail {
  margin-top: 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.day-detail__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.day-detail__empty {
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
  padding: 1.5rem 0;
}

.day-detail__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.day-entry {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.day-entry:hover {
  background: var(--color-primary-light);
}

.day-entry__icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.day-entry__info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-width: 0;
}

.day-entry__title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.day-entry__time {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
</style>
