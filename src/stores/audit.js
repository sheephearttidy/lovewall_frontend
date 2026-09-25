import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { getItem, setItem } from '@/utils/storage'

const KEY = 'audit-logs'
/** 审计日志保留上限 */
const MAX_LOGS = 200

/**
 * 管理员操作审计日志：
 * - 埋点方式：各管理页在执行管理操作成功后调用 log(action, detail)
 * - 记录内容：操作人、动作、对象摘要、时间、IP 位（Mock 阶段留空）
 */
export const useAuditStore = defineStore('audit', {
  state: () => ({
    logs: [],
    initialized: false
  }),

  getters: {
    /** 按时间倒序的全部日志 */
    all(state) {
      return state.logs.slice().sort((a, b) => b.createdAt - a.createdAt)
    },
    /** 近 N 天操作次数（仪表盘趋势用） */
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

    /**
     * 记录一条管理操作
     * @param {string} action 动作标识，如 confession.hide / user.ban
     * @param {string} detail 摘要文案（人可读）
     */
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
