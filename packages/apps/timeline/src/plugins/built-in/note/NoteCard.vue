<script setup lang="ts">
import type { TimelineEntry } from '@/database/entry.model'

defineProps<{
  entry: TimelineEntry
}>()

/** 笔记内容结构 */
interface NoteContent {
  body: string
}

function getBody(entry: TimelineEntry): string {
  return (entry.content as NoteContent).body || ''
}
</script>

<template>
  <div class="note-card">
    <p class="note-card__body">{{ getBody(entry) }}</p>
  </div>
</template>

<style scoped>
.note-card {
  padding: 0;
}

.note-card__body {
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--color-text);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
