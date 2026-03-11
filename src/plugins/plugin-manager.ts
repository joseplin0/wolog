import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { WologPlugin } from './plugin.types'

/**
 * PluginManager — 插件注册中心
 *
 * 维护所有已注册插件的映射表。
 * 视图层通过 pluginId 查找对应的组件进行动态渲染。
 */
export const usePluginManager = defineStore('pluginManager', () => {
  const plugins = ref<Map<string, WologPlugin>>(new Map())

  /** 注册一个插件 */
  function register(plugin: WologPlugin) {
    if (plugins.value.has(plugin.id)) {
      console.warn(`[Wolog] Plugin "${plugin.id}" already registered, skipping.`)
      return
    }
    plugins.value.set(plugin.id, plugin)
  }

  /** 获取指定插件 */
  function getPlugin(id: string): WologPlugin | undefined {
    return plugins.value.get(id)
  }

  /** 获取所有已注册的插件列表 */
  function listPlugins(): WologPlugin[] {
    return Array.from(plugins.value.values())
  }

  return { plugins, register, getPlugin, listPlugins }
})
