<template>
  <router-view />
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'

// 应用入口初始化主题（含跟随系统监听），确保任意路由首帧主题正确
useThemeStore().init()
</script>
