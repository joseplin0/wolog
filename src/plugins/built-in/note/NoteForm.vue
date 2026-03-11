<script setup lang="ts">
import { reactive } from 'vue'

const props = defineProps<{
  modelValue: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
}>()

const form = reactive({
  body: (props.modelValue.body as string) || '',
})

function onInput() {
  emit('update:modelValue', { body: form.body })
}
</script>

<template>
  <div class="note-form">
    <label class="note-form__label" for="note-body">内容</label>
    <textarea
      id="note-body"
      v-model="form.body"
      class="note-form__textarea"
      placeholder="写点什么..."
      rows="5"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
.note-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.note-form__label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.note-form__textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.2s;
}

.note-form__textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}
</style>
