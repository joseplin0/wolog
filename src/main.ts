import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from '@/router'
import { usePluginManager } from '@/plugins/plugin-manager'
import { notePlugin } from '@/plugins/built-in/note'
import { expensePlugin } from '@/plugins/built-in/expense'
import App from './App.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 注册内置插件
const pluginManager = usePluginManager()
pluginManager.register(notePlugin)
pluginManager.register(expensePlugin)

app.mount('#app')
