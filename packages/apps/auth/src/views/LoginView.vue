<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authClient } from '@wolog/auth-sdk'

const router = useRouter()
const route = useRoute()

const isRegisterMode = ref(false)
const username = ref('')
const password = ref('')
const displayName = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    if (isRegisterMode.value) {
      await authClient.register(username.value, password.value, displayName.value)
    } else {
      await authClient.login(username.value, password.value)
    }

    // 登录成功，直接跳转后这个地址，不需要判断是主页面还是子页面
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '操作失败'
  } finally {
    loading.value = false
  }
}

function toggleMode() {
  isRegisterMode.value = !isRegisterMode.value
  error.value = ''
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-card__header">
        <span class="login-card__icon">🕰️</span>
        <h1 class="login-card__title">吾录 Wolog</h1>
        <p class="login-card__subtitle">
          {{ isRegisterMode ? '创建你的账户' : '以时间为轴，收录我的一切' }}
        </p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div v-if="error" class="login-form__error">{{ error }}</div>

        <div class="form-field">
          <label for="username">用户名</label>
          <input id="username" v-model="username" type="text" placeholder="请输入用户名" required />
        </div>

        <div v-if="isRegisterMode" class="form-field">
          <label for="displayName">显示名称</label>
          <input id="displayName" v-model="displayName" type="text" placeholder="你的显示名称" required />
        </div>

        <div class="form-field">
          <label for="password">密码</label>
          <input id="password" v-model="password" type="password" placeholder="请输入密码" required />
        </div>

        <button class="btn-primary" type="submit" :disabled="loading">
          {{ loading ? '处理中...' : isRegisterMode ? '注册' : '登录' }}
        </button>
      </form>

      <div class="login-card__footer">
        <button class="btn-link" @click="toggleMode">
          {{ isRegisterMode ? '已有账户？去登录' : '没有账户？去注册' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: 1rem;
}

.login-card {
  width: min(400px, 100%);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.login-card__header {
  text-align: center;
  padding: 2.5rem 2rem 1.5rem;
}

.login-card__icon { font-size: 3rem; display: block; margin-bottom: 1rem; }

.login-card__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.login-card__subtitle {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.login-form {
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-form__error {
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-md);
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-expense);
  font-size: 0.85rem;
  text-align: center;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-field label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-field input {
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.9rem;
  transition: border-color var(--transition-base);
}

.form-field input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.btn-primary {
  padding: 0.7rem;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all var(--transition-fast);
  margin-top: 0.5rem;
}

.btn-primary:hover:not(:disabled) { background: var(--color-primary-hover); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.login-card__footer {
  padding: 1.5rem 2rem;
  text-align: center;
}

.btn-link {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 500;
}
.btn-link:hover { text-decoration: underline; }
</style>
