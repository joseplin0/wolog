<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import EntryDialog from './EntryDialog.vue'

const route = useRoute()
const showDialog = ref(false)
const isMobileMenuOpen = ref(false)

const currentRouteName = computed(() => route.name as string)

const navItems = [
  { name: 'timeline', label: '时间轴', icon: '📋', path: '/' },
  { name: 'calendar', label: '日历', icon: '📅', path: '/calendar' },
]

// 路由变化时关闭移动端菜单
watch(currentRouteName, () => {
  isMobileMenuOpen.value = false
})
</script>

<template>
  <div class="app-shell">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'sidebar--open': isMobileMenuOpen }">
      <div class="sidebar__header">
        <h1 class="sidebar__logo">
          <span class="sidebar__logo-icon">🕰️</span>
          <span class="sidebar__logo-text">吾录</span>
        </h1>
      </div>
      <nav class="sidebar__nav">
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="nav-item"
          :class="{ 'nav-item--active': currentRouteName === item.name }"
        >
          <span class="nav-item__icon">{{ item.icon }}</span>
          <span class="nav-item__label">{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="sidebar__footer">
        <span class="sidebar__version">v0.1.0 MVP</span>
      </div>
    </aside>

    <!-- 移动端遮罩 -->
    <Transition name="overlay">
      <div
        v-if="isMobileMenuOpen"
        class="mobile-overlay"
        @click="isMobileMenuOpen = false"
      />
    </Transition>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶栏 -->
      <header class="topbar">
        <button
          class="topbar__menu-btn"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          aria-label="菜单"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h2 class="topbar__title">
          {{ navItems.find(n => n.name === currentRouteName)?.label || '吾录' }}
        </h2>
      </header>

      <!-- 路由视图 -->
      <div class="main-content__body">
        <router-view v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </div>

      <!-- FAB 按钮 -->
      <button
        id="fab-new-entry"
        class="fab"
        @click="showDialog = true"
        aria-label="新建条目"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </main>

    <!-- 新建/编辑条目弹窗 -->
    <EntryDialog v-model:visible="showDialog" />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100dvh;
}

/* 侧边栏 */
.sidebar {
  width: 220px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 40;
  transition: transform var(--transition-slow);
}

.sidebar__header {
  padding: 1.5rem 1.25rem 1rem;
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.sidebar__logo-icon {
  font-size: 1.5rem;
}

.sidebar__nav {
  flex: 1;
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.nav-item:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.nav-item--active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

.nav-item__icon {
  font-size: 1.1rem;
}

.sidebar__footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border);
}

.sidebar__version {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

/* 移动端遮罩 */
.mobile-overlay {
  display: none;
}

/* 主内容区 */
.main-content {
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 顶栏 */
.topbar {
  height: 56px;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 20;
}

.topbar__menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.topbar__menu-btn:hover {
  background: var(--color-primary-light);
}

.topbar__title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text);
}

/* 内容体 */
.main-content__body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

/* FAB */
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg), 0 0 0 0 rgba(99, 102, 241, 0.3);
  transition: all var(--transition-base);
  z-index: 30;
}

.fab:hover {
  background: var(--color-primary-hover);
  transform: scale(1.08);
  box-shadow: var(--shadow-lg), 0 0 0 8px rgba(99, 102, 241, 0.12);
}

.fab:active {
  transform: scale(0.95);
}

/* 响应式：移动端 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 35;
    backdrop-filter: blur(2px);
  }

  .main-content {
    margin-left: 0;
  }

  .topbar__menu-btn {
    display: flex;
  }

  .fab {
    bottom: 1.5rem;
    right: 1.5rem;
  }
}
</style>
