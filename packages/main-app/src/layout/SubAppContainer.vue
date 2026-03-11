<script setup lang="ts">
import type { SubAppManifest } from '@wolog/types'
import { authClient } from '@wolog/auth-sdk'
// @ts-expect-error wujie-vue3 类型暂缺
import WujieVue from 'wujie-vue3'
import { computed } from 'vue'

const props = defineProps<{
  app: SubAppManifest
}>()

/** 传递给子应用的 props */
const subAppProps = computed(() => ({
  token: authClient.getToken(),
  user: authClient.getUser(),
}))
</script>

<template>
  <div class="sub-app-container" :id="`sub-app-${props.app.id}`">
    <WujieVue
      :name="props.app.id"
      :url="props.app.entry"
      :props="subAppProps"
      width="100%"
      height="100%"
    />
  </div>
</template>

<style scoped>
.sub-app-container {
  width: 100%;
  height: calc(100dvh - 56px); /* 减去顶栏高度 */
}
</style>
