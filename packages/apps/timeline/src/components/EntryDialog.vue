<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePluginManager } from '@/plugins/plugin-manager'
import { useTimelineStore } from '@/stores/timeline.store'
import type { WologPlugin } from '@/plugins/plugin.types'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const pluginManager = usePluginManager()
const timelineStore = useTimelineStore()

const title = ref('')
const selectedPluginId = ref('')
const content = ref<Record<string, unknown>>({})
const tags = ref('')
const saving = ref(false)

/** 当前选中的插件 */
const selectedPlugin = computed<WologPlugin | undefined>(() => {
  return selectedPluginId.value ? pluginManager.getPlugin(selectedPluginId.value) : undefined
})

/** 可用插件列表 */
const availablePlugins = computed(() => pluginManager.listPlugins())

/** 选择插件后加载默认内容 */
watch(selectedPluginId, (id) => {
  const plugin = pluginManager.getPlugin(id)
  if (plugin?.defaultContent) {
    content.value = plugin.defaultContent()
  } else {
    content.value = {}
  }
})

/** 重置表单 */
function resetForm() {
  title.value = ''
  selectedPluginId.value = ''
  content.value = {}
  tags.value = ''
}

/** 关闭弹窗 */
function close() {
  emit('update:visible', false)
  resetForm()
}

/** 保存条目 */
async function save() {
  if (!selectedPlugin.value || !title.value.trim()) return

  // 验证 content
  if (!selectedPlugin.value.validateContent(content.value)) {
    return
  }

  saving.value = true
  try {
    await timelineStore.addEntry({
      timestamp: Date.now(),
      type: selectedPluginId.value,
      title: title.value.trim(),
      content: { ...content.value },
      tags: tags.value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    })
    close()
  } catch (err) {
    console.error('[Wolog] Failed to save entry:', err)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <!-- 遮罩 -->
  <Transition name="overlay">
    <div v-if="visible" class="dialog-overlay" @click="close" />
  </Transition>

  <!-- 弹窗 -->
  <Transition name="dialog">
    <div v-if="visible" class="dialog">
      <div class="dialog__header">
        <h3 class="dialog__title">新建条目</h3>
        <button class="dialog__close" @click="close" aria-label="关闭">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="dialog__body">
        <!-- 插件类型选择 -->
        <div class="form-field">
          <label class="form-field__label">类型</label>
          <div class="plugin-selector">
            <button
              v-for="plugin in availablePlugins"
              :key="plugin.id"
              class="plugin-selector__item"
              :class="{ 'plugin-selector__item--active': selectedPluginId === plugin.id }"
              @click="selectedPluginId = plugin.id"
            >
              <span class="plugin-selector__icon">{{ plugin.icon }}</span>
              <span class="plugin-selector__name">{{ plugin.name }}</span>
            </button>
          </div>
        </div>

        <!-- 标题 -->
        <div class="form-field">
          <label class="form-field__label" for="entry-title">标题</label>
          <input
            id="entry-title"
            v-model="title"
            class="form-field__input"
            type="text"
            placeholder="给这条记录起个名..."
          />
        </div>

        <!-- 插件自定义表单 -->
        <div v-if="selectedPlugin" class="form-field">
          <component
            :is="selectedPlugin.EntryForm"
            v-model="content"
          />
        </div>

        <!-- 标签 -->
        <div class="form-field">
          <label class="form-field__label" for="entry-tags">标签</label>
          <input
            id="entry-tags"
            v-model="tags"
            class="form-field__input"
            type="text"
            placeholder="用逗号分隔，如：工作,重要"
          />
        </div>
      </div>

      <div class="dialog__footer">
        <button class="btn btn--ghost" @click="close">取消</button>
        <button
          class="btn btn--primary"
          :disabled="!selectedPlugin || !title.trim() || saving"
          @click="save"
        >
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  z-index: 50;
}

.dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(480px, 90vw);
  max-height: 85vh;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  z-index: 51;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.dialog__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.dialog__close {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.dialog__close:hover {
  background: var(--color-primary-light);
  color: var(--color-text);
}

.dialog__body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
}

.dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
}

/* 表单字段 */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field__label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-field__input {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.9rem;
  transition: border-color var(--transition-base);
}

.form-field__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

/* 插件选择器 */
.plugin-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.plugin-selector__item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.plugin-selector__item:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.plugin-selector__item--active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.plugin-selector__icon {
  font-size: 1rem;
}

/* 按钮 */
.btn {
  padding: 0.55rem 1.25rem;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.btn--ghost:hover {
  background: var(--color-primary-light);
  color: var(--color-text);
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
