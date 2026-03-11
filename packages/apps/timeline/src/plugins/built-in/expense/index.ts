import { markRaw } from 'vue'
import type { WologPlugin } from '@/plugins/plugin.types'
import ExpenseCard from './ExpenseCard.vue'
import ExpenseForm from './ExpenseForm.vue'

/**
 * 记账插件 — 快速记录收支
 */
export const expensePlugin: WologPlugin = {
  id: 'expense',
  name: '记账',
  icon: '💰',
  TimelineCard: markRaw(ExpenseCard),
  EntryForm: markRaw(ExpenseForm),
  validateContent(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false
    const d = data as Record<string, unknown>
    return typeof d.amount === 'number' && d.amount > 0 && typeof d.category === 'string'
  },
  defaultContent() {
    return { amount: 0, category: '其他', remark: '' }
  },
}
