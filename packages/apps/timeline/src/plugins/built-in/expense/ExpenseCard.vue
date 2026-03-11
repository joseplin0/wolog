<script setup lang="ts">
import type { TimelineEntry } from '@/database/entry.model'

defineProps<{
  entry: TimelineEntry
}>()

interface ExpenseContent {
  amount: number
  category: string
  remark: string
}

function getContent(entry: TimelineEntry): ExpenseContent {
  const c = entry.content as ExpenseContent
  return {
    amount: c.amount || 0,
    category: c.category || '其他',
    remark: c.remark || '',
  }
}

function formatAmount(amount: number): string {
  return amount.toFixed(2)
}

/** 分类对应的 emoji */
const categoryIcons: Record<string, string> = {
  '餐饮': '🍜',
  '交通': '🚗',
  '购物': '🛒',
  '娱乐': '🎮',
  '居住': '🏠',
  '医疗': '💊',
  '教育': '📚',
  '其他': '📦',
}
</script>

<template>
  <div class="expense-card">
    <div class="expense-card__info">
      <span class="expense-card__icon">{{ categoryIcons[getContent(entry).category] || '📦' }}</span>
      <span class="expense-card__category">{{ getContent(entry).category }}</span>
      <span v-if="getContent(entry).remark" class="expense-card__remark">{{ getContent(entry).remark }}</span>
    </div>
    <div class="expense-card__amount">
      ¥{{ formatAmount(getContent(entry).amount) }}
    </div>
  </div>
</template>

<style scoped>
.expense-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.expense-card__info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.expense-card__icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.expense-card__category {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text);
  flex-shrink: 0;
}

.expense-card__remark {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expense-card__amount {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-expense);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
</style>
