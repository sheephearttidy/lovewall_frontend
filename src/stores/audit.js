import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { getItem, setItem } from '@/utils/storage'

const KEY = 'audit-logs'
const MAX_LOGS = 200

export const useAuditStore = defineStore('audit', {
  state: () => ({
    logs: [],
    initialized: false
  }),

  getters: {
    all(state) {
      return state.logs.slice().sort((a, b) => b.createdAt - a.createdAt)
    },
    recentCount(state) {
      const day = 24 * 60 * 60 * 1000
      const since = Date.now() - 7 * day
      return state.logs.filter((l) => l.createdAt >= since).length
    }
  },

  actions: {
    init() {
      if (this.initialized) return
      this.logs = getItem(KEY, [])
      this.initialized = true
    },

    log(action, detail) {
      this.init()
      const auth = useAuthStore()
      this.logs.unshift({
        id: 'log-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        operator: auth.currentUser?.nickname || '未知',
        operatorId: auth.currentUser?.id || null,
        action,
        detail,
        createdAt: Date.now()
      })
      if (this.logs.length > MAX_LOGS) {
        this.logs = this.logs.slice(0, MAX_LOGS)
      }
      setItem(KEY, this.logs)
    },

    clear() {
      this.logs = []
      setItem(KEY, [])
    }
  }
})