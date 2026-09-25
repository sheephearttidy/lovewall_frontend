import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import * as notifyApi from '@/api/notification'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    total: 0,
    page: 1,
    pageSize: 20,
    initialized: false
  }),

  getters: {
    myNotifications(state) {
      return state.notifications
    }
  },

  actions: {
    async init() {
      if (this.initialized) return
      await this.fetchNotifications()
      this.initialized = true
    },

    async fetchNotifications(params = {}) {
      const auth = useAuthStore()
      if (!auth.isLoggedIn) {
        this.notifications = []
        this.unreadCount = 0
        return
      }
      try {
        const data = await notifyApi.getNotifications({ page: this.page, pageSize: this.pageSize, ...params })
        this.notifications = data.list || []
        this.total = data.total || 0
        this.unreadCount = data.unreadCount || 0
        this.page = data.page || 1
      } catch (e) {
        console.warn('[notification] 获取通知失败:', e.message)
        this.notifications = []
        this.unreadCount = 0
      }
    },

    pushLocal({ type, toUserId, fromUser, confessionId, text }) {
      if (!toUserId || !fromUser || toUserId === fromUser.id) return
      this.unreadCount += 1
      this.notifications.unshift({
        id: 'local-' + Date.now(),
        type,
        toUserId,
        fromUserId: fromUser.id,
        fromNickname: fromUser.nickname,
        confessionId: confessionId || null,
        text,
        read: false,
        createdAt: Date.now()
      })
    },

    async markRead(id) {
      try {
        await notifyApi.markRead(id)
        const n = this.notifications.find((x) => x.id === id)
        if (n && !n.read) {
          n.read = true
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
      } catch (e) {
        console.warn('[notification] 标记已读失败:', e.message)
      }
    },

    async markAllRead() {
      try {
        await notifyApi.markAllRead()
        this.notifications.forEach((n) => { n.read = true })
        this.unreadCount = 0
      } catch (e) {
        console.warn('[notification] 全部标记已读失败:', e.message)
      }
    },

    async clearAll() {
      try {
        await notifyApi.clearNotifications()
        this.notifications = []
        this.unreadCount = 0
        this.total = 0
      } catch (e) {
        console.warn('[notification] 清空通知失败:', e.message)
      }
    }
  }
})