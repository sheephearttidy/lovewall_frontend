import { defineStore } from 'pinia'
import { getItem, setItem } from '@/utils/storage'
import { genId } from '@/utils/format'
import { useAuthStore } from './auth'

const KEY = 'notifications'
/** 最多保留的通知条数 */
const MAX_NOTIFICATIONS = 50

/**
 * 消息通知
 * type: 'like'（点赞我的表白）| 'comment'（评论我的表白）| 'reply'（回复我的评论）
 */
export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    initialized: false
  }),

  getters: {
    /** 当前用户的未读数量 */
    unreadCount(state) {
      const auth = useAuthStore()
      if (!auth.currentUser) return 0
      return state.notifications.filter((n) => n.toUserId === auth.currentUser.id && !n.read).length
    },
    /** 当前用户的通知列表（倒序） */
    myNotifications(state) {
      const auth = useAuthStore()
      if (!auth.currentUser) return []
      return state.notifications
        .filter((n) => n.toUserId === auth.currentUser.id)
        .sort((a, b) => b.createdAt - a.createdAt)
    }
  },

  actions: {
    init() {
      if (this.initialized) return
      const data = getItem(KEY, null)
      if (Array.isArray(data)) this.notifications = data
      this.initialized = true
    },

    _persist() {
      setItem(KEY, this.notifications)
    },

    /**
     * 推送通知（自己给自己的操作不发通知）
     */
    push({ type, toUserId, fromUser, confessionId, text }) {
      this.init()
      if (!toUserId || !fromUser || toUserId === fromUser.id) return
      this.notifications.unshift({
        id: genId('n-'),
        type,
        toUserId,
        fromUserId: fromUser.id,
        fromNickname: fromUser.nickname,
        confessionId: confessionId || null,
        text,
        read: false,
        createdAt: Date.now()
      })
      if (this.notifications.length > MAX_NOTIFICATIONS) {
        this.notifications = this.notifications.slice(0, MAX_NOTIFICATIONS)
      }
      this._persist()
    },

    markRead(id) {
      const n = this.notifications.find((x) => x.id === id)
      if (n) {
        n.read = true
        this._persist()
      }
    },

    markAllRead() {
      const auth = useAuthStore()
      this.notifications.forEach((n) => {
        if (n.toUserId === auth.currentUser?.id) n.read = true
      })
      this._persist()
    },

    clearAll() {
      const auth = useAuthStore()
      this.notifications = this.notifications.filter((n) => n.toUserId !== auth.currentUser?.id)
      this._persist()
    }
  }
})
