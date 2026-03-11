<script setup lang="ts">
import { reactive } from 'vue'

const props = defineProps<{
  modelValue: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
}>()

const categories = ['餐饮', '交通', '购物', '娱乐', '居住', '医疗', '教育', '其他']

const form = reactive({
  amount: (props.modelValue.amount as number) || 0,
  category: (props.modelValue.category as string) || '其他',
  remark: (props.modelValue.remark as string) || '',
})

function onInput() {
  emit('update:modelValue', {
    amount: Number(form.amount),
    category: form.category,
    remark: form.remark,
  })
}
</script>

<template>
  <div class="expense-form">
    <div class="expense-form__row">
      <div class="expense-form__field">
        <label class="expense-form__label" for="expense-amount">金额 (¥)</label>
        <input
          id="expense-amount"
          v-model.number="form.amount"
          class="expense-form__input"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          @input="onInput"
        />
      </div>
      <div class="expense-form__field">
        <label class="expense-form__label" for="expense-category">分类</label>
        <select
          id="expense-category"
          v-model="form.category"
          class="expense-form__select"
          @change="onInput"
        >
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>
    <div class="expense-form__field">
      <label class="expense-form__label" for="expense-remark">备注</label>
      <input
        id="expense-remark"
        v-model="form.remark"
        class="expense-form__input"
        type="text"
        placeholder="可选备注..."
        @input="onInput"
      />
    </div>
  </div>
</template>

<style scoped>
.expense-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.expense-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.expense-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.expense-form__label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.expense-form__input,
.expense-form__select {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.expense-form__input:focus,
.expense-form__select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

/* 隐藏 number input 的 spinner */
.expense-form__input[type='number']::-webkit-inner-spin-button,
.expense-form__input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
