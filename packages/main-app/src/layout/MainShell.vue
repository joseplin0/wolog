<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { SubAppManifest } from '@wolog/types'
import { authClient } from '@wolog/auth-sdk'
import { loadAppRegistry, getVisibleApps } from '@/micro/registry'
import { AppEvents } from '@/micro/communication'
import SubAppContainer from './SubAppContainer.vue'
// @ts-expect-error wujie-vue3 类型暂缺
import WujieVue from 'wujie-vue3'

const router = useRouter()
const route = useRoute()

const allApps = ref<SubAppManifest[]>([])
const visibleApps = computed(() => getVisibleApps(allApps.value))
const isMobileMenuOpen = ref(false)

/** 当前激活的子应用 */
const activeApp = computed(() => {
  return allApps.value.find((app) => route.path.startsWith(app.activeRule))
})

/** 是否在子应用页面 */
const isSubAppRoute = computed(() => route.path.startsWith('/app/'))

onMounted(async () => {
  allApps.value = await loadAppRegistry()

  // 监听子应用事件
  const { bus } = WujieVue
  bus.$on(AppEvents.AUTH_REQUIRED, (data: { redirect?: string }) => {
    const redirect = data?.redirect || '/'
    router.push(`/app/auth/login?redirect=${encodeURIComponent(redirect)}`)
  })

  bus.$on(AppEvents.AUTH_LOGOUT, () => {
    authClient.logout()
    router.push(`/app/auth/login?redirect=${encodeURIComponent(route.fullPath)}`)
  })

  bus.$on(AppEvents.AUTH_SUCCESS, () => {
    const redirect = route.query.redirect as string
    router.push(redirect || '/app/timeline')
  })

  bus.$on(AppEvents.NAVIGATE, (path: string) => {
    router.push(path)
  })

  // 默认跳转到时间轴
  if (route.path === '/') {
    router.replace('/app/timeline')
  }
})

const isLoggedIn = computed(() => authClient.isAuthenticated())
const username = computed(() => authClient.getUser()?.displayName || '')

function handleLogout() {
  authClient.logout()
  router.push(`/app/auth/login?redirect=${encodeURIComponent(route.fullPath)}`)
}
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
          v-for="app in visibleApps"
          :key="app.id"
          :to="app.activeRule"
          class="nav-item"
          :class="{ 'nav-item--active': activeApp?.id === app.id }"
          @click="isMobileMenuOpen = false"
        >
          <span class="nav-item__icon">{{ app.icon }}</span>
          <span class="nav-item__label">{{ app.name }}</span>
        </router-link>
      </nav>

      <div class="sidebar__footer">
        <div v-if="isLoggedIn" class="sidebar__user">
          <span class="sidebar__username">{{ username }}</span>
          <button class="sidebar__logout" @click="handleLogout">登出</button>
        </div>
        <span class="sidebar__version">v0.2.0</span>
      </div>
    </aside>

    <!-- 移动端遮罩 -->
    <Transition name="overlay">
      <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="isMobileMenuOpen = false" />
    </Transition>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="topbar">
        <button class="topbar__menu-btn" @click="isMobileMenuOpen = !isMobileMenuOpen" aria-label="菜单">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h2 class="topbar__title">{{ activeApp?.name || '吾录' }}</h2>
      </header>

      <div class="main-content__body">
        <!-- 子应用渲染容器 -->
        <SubAppContainer v-if="isSubAppRoute && activeApp" :app="activeApp" />
        <!-- 非子应用路由 -->
        <router-view v-else />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100dvh;
}

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

.sidebar__header { padding: 1.5rem 1.25rem 1rem; }

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.sidebar__logo-icon { font-size: 1.5rem; }

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
.nav-item:hover { background: var(--color-primary-light); color: var(--color-primary); }
.nav-item--active { background: var(--color-primary-light); color: var(--color-primary); font-weight: 600; }
.nav-item__icon { font-size: 1.1rem; }

.sidebar__footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar__user {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar__username {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.sidebar__logout {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: var(--radius-sm);
}
.sidebar__logout:hover { color: var(--color-expense); }

.sidebar__version { font-size: 0.75rem; color: var(--color-text-tertiary); }

.mobile-overlay { display: none; }

.main-content {
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
}

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
}
.topbar__menu-btn:hover { background: var(--color-primary-light); }

.topbar__title { font-size: 1.05rem; font-weight: 600; color: var(--color-text); }

.main-content__body { flex: 1; overflow: hidden; }

@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar--open { transform: translateX(0); }
  .mobile-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 35;
    backdrop-filter: blur(2px);
  }
  .main-content { margin-left: 0; }
  .topbar__menu-btn { display: flex; }
}
</style>
