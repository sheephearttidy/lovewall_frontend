<template>
  <el-dropdown trigger="click" @command="setMode">
    <button class="theme-toggle" :title="title">
      <el-icon :size="17">
        <Sunny v-if="theme.mode === 'light'" />
        <Moon v-else-if="theme.mode === 'dark'" />
        <Monitor v-else />
      </el-icon>
    </button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="light" :class="{ 'is-active': theme.mode === 'light' }">
          <el-icon><Sunny /></el-icon>浅色
        </el-dropdown-item>
        <el-dropdown-item command="dark" :class="{ 'is-active': theme.mode === 'dark' }">
          <el-icon><Moon /></el-icon>深色
        </el-dropdown-item>
        <el-dropdown-item command="auto" :class="{ 'is-active': theme.mode === 'auto' }">
          <el-icon><Monitor /></el-icon>跟随系统
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const theme = useThemeStore()
theme.init()

const title = computed(
  () =>
    ({ light: '浅色模式', dark: '深色模式', auto: '跟随系统' })[theme.mode] || '主题'
)

function setMode(mode) {
  theme.setMode(mode)
}
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
  outline: none;
  transition: background 0.2s, color 0.2s;
}
.theme-toggle:hover {
  background: var(--love-pink-light);
  color: var(--love-pink);
}
:global(html.dark) .theme-toggle:hover {
  background: rgba(245, 108, 108, 0.15);
}
</style>
