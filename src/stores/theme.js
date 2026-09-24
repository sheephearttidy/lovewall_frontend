import { defineStore } from 'pinia'

const KEY = 'theme-mode'

/** 实际生效的暗色状态：mode 为 auto 时跟随系统 */
function resolveDark(mode) {
  if (mode === 'auto') {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return mode === 'dark'
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    /** 主题模式：light / dark / auto */
    mode: 'auto',
    /** 实际是否为暗色 */
    isDark: false,
    initialized: false
  }),

  getters: {
    isAuto: (s) => s.mode === 'auto'
  },

  actions: {
    init() {
      if (this.initialized) return
      const saved = localStorage.getItem(KEY)
      this.mode = ['light', 'dark', 'auto'].includes(saved) ? saved : 'auto'

      // 跟随系统：偏好变化时自动切换（仅 auto 模式生效）
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.mode === 'auto') this.apply()
      })
      this.apply()
      this.initialized = true
    },

    setMode(mode) {
      if (!['light', 'dark', 'auto'].includes(mode)) return
      this.mode = mode
      localStorage.setItem(KEY, mode)
      this.apply()
    },

    /** 将暗色 class 同步到 <html>，驱动全局变量与 Element Plus 暗色主题 */
    apply() {
      this.isDark = resolveDark(this.mode)
      document.documentElement.classList.toggle('dark', this.isDark)
    }
  }
})
