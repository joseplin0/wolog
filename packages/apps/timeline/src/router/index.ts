import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'timeline',
    component: () => import('@/views/TimelineView.vue'),
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('@/views/CalendarView.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
