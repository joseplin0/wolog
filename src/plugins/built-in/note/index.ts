import { markRaw } from 'vue'
import type { WologPlugin } from '@/plugins/plugin.types'
import NoteCard from './NoteCard.vue'
import NoteForm from './NoteForm.vue'

/**
 * 笔记插件 — 最基础的文本记录
 */
export const notePlugin: WologPlugin = {
  id: 'note',
  name: '笔记',
  icon: '📝',
  TimelineCard: markRaw(NoteCard),
  EntryForm: markRaw(NoteForm),
  validateContent(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false
    const d = data as Record<string, unknown>
    return typeof d.body === 'string' && d.body.trim().length > 0
  },
  defaultContent() {
    return { body: '' }
  },
}
