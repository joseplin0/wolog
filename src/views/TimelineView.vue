<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTimelineStore } from '@/stores/timeline.store'
import { usePluginManager } from '@/plugins/plugin-manager'

const timelineStore = useTimelineStore()
const pluginManager = usePluginManager()
const sentinelRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  await timelineStore.loadInitial()

  // IntersectionObserver 实现无限滚动
  if (sentinelRef.value) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && timelineStore.hasMore) {
          timelineStore.loadMore()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinelRef.value)
  }
})

/** 格式化时间戳为易读字符串 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays === 1) {
    return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays < 7) {
    return `${diffDays}天前 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  }
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** 格式化日期组标题 */
function getDateGroupKey(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDateHeader(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

/** 按日期分组 */
interface DateGroup {
  key: string
  label: string
  timestamp: number
  entries: typeof timelineStore.entries
}

function getDateGroups(): DateGroup[] {
  const groups: DateGroup[] = []
  let currentKey = ''

  for (const entry of timelineStore.entries) {
    const key = getDateGroupKey(entry.timestamp)
    if (key !== currentKey) {
      currentKey = key
      groups.push({
        key,
        label: formatDateHeader(entry.timestamp),
        timestamp: entry.timestamp,
        entries: [],
      })
    }
    groups[groups.length - 1].entries.push(entry)
  }

  return groups
}

/** 删除条目 */
async function deleteEntry(id: string) {
  await timelineStore.removeEntry(id)
}
</script>

<template>
  <div class="timeline-view">
    <!-- 空状态 -->
    <div v-if="!timelineStore.loading && timelineStore.entries.length === 0" class="empty-state">
      <div class="empty-state__icon">🕰️</div>
      <h3 class="empty-state__title">时间轴是空的</h3>
      <p class="empty-state__text">点击右下角的 <strong>+</strong> 按钮，开始记录你的第一条痕迹</p>
    </div>

    <!-- 时间轴 -->
    <div v-else class="timeline">
      <div v-for="group in getDateGroups()" :key="group.key" class="timeline__group">
        <!-- 日期标题 -->
        <div class="timeline__date-header">
          <span class="timeline__date-text">{{ group.label }}</span>
          <span class="timeline__date-line" />
        </div>

        <!-- 条目卡片 -->
        <TransitionGroup name="list" tag="div" class="timeline__entries">
          <div
            v-for="entry in group.entries"
            :key="entry.id"
            class="entry-card"
          >
            <div class="entry-card__header">
              <span class="entry-card__icon">
                {{ pluginManager.getPlugin(entry.type)?.icon || '📌' }}
              </span>
              <span class="entry-card__title">{{ entry.title }}</span>
              <span class="entry-card__time">{{ formatTime(entry.timestamp) }}</span>
              <button
                class="entry-card__delete"
                @click="deleteEntry(entry.id)"
                aria-label="删除"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <!-- 插件卡片组件 -->
            <div class="entry-card__body">
              <component
                :is="pluginManager.getPlugin(entry.type)?.TimelineCard"
                v-if="pluginManager.getPlugin(entry.type)?.TimelineCard"
                :entry="entry"
              />
            </div>

            <!-- 标签 -->
            <div v-if="entry.tags.length > 0" class="entry-card__tags">
              <span v-for="tag in entry.tags" :key="tag" class="entry-card__tag">
                #{{ tag }}
              </span>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="timelineStore.loading" class="timeline__loader">
      <div class="spinner" />
    </div>

    <!-- 无限滚动哨兵 -->
    <div ref="sentinelRef" class="timeline__sentinel" />
  </div>
</template>

<style scoped>
.timeline-view {
  max-width: 680px;
  margin: 0 auto;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.empty-state__icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-state__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.empty-state__text {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* 时间轴 */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline__group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.timeline__date-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0;
}

.timeline__date-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-tertiary);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.timeline__date-line {
  flex: 1;
  height: 1px;
  background: var(--color-border-light);
}

.timeline__entries {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 条目卡片 */
.entry-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
  transition: all var(--transition-fast);
}

.entry-card:hover {
  box-shadow: var(--shadow-sm);
  border-color: var(--color-primary);
}

.entry-card__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
}

.entry-card__icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.entry-card__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-card__time {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.entry-card__delete {
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 0.2rem;
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.entry-card:hover .entry-card__delete {
  opacity: 1;
}

.entry-card__delete:hover {
  color: var(--color-expense);
  background: rgba(239, 68, 68, 0.1);
}

.entry-card__body {
  padding-left: 1.6rem;
}

.entry-card__tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 0.65rem;
  padding-left: 1.6rem;
}

.entry-card__tag {
  font-size: 0.72rem;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-weight: 500;
}

/* 加载器 */
.timeline__loader {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.timeline__sentinel {
  height: 1px;
}
</style>
