import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useNotificationStore } from './notification'
import * as wallApi from '@/api/wall'

const MAX_PINNED = 3

function byPinnedFirst(a, b) {
  const pa = a.pinned ? 1 : 0
  const pb = b.pinned ? 1 : 0
  if (pa !== pb) return pb - pa
  if (pa === 1) return (b.pinnedAt || 0) - (a.pinnedAt || 0)
  return b.createdAt - a.createdAt
}

export const useWallStore = defineStore('wall', {
  state: () => ({
    confessions: [],
    total: 0,
    page: 1,
    pageSize: 10,
    initialized: false
  }),

  getters: {
    visible(state) {
      return state.confessions
        .filter((c) => c.status === 'normal')
        .slice()
        .sort(byPinnedFirst)
    },
    pinnedCount(state) {
      return state.confessions.filter((c) => c.pinned).length
    },
    totalConfessions: (s) => s.total || s.confessions.length,
    totalLikes: (s) => s.confessions.reduce((n, c) => n + (c.likeCount || c.likes?.length || 0), 0),
    totalComments: (s) => s.confessions.reduce((n, c) => n + (c.commentCount || c.comments?.length || 0), 0),
    allComments(state) {
      const list = []
      state.confessions.forEach((c) => {
        (c.comments || []).forEach((cm) => {
          list.push({ ...cm, confessionContent: c.content, confessionTo: c.to })
        })
      })
      return list.sort((a, b) => b.createdAt - a.createdAt)
    },
    topLiked(state) {
      return state.confessions
        .slice()
        .sort((a, b) => (b.likeCount || b.likes?.length || 0) - (a.likeCount || a.likes?.length || 0))
    }
  },

  actions: {
    async init() {
      if (this.initialized) return
      await this.fetchConfessions()
      this.initialized = true
    },

    async fetchConfessions(params = {}) {
      try {
        const data = await wallApi.getConfessions({ page: this.page, pageSize: this.pageSize, ...params })
        this.confessions = data.list || []
        this.total = data.total || 0
        this.page = data.page || 1
        this.pageSize = data.pageSize || 10
      } catch (e) {
        console.warn('[wall] 获取表白列表失败:', e.message)
      }
    },

    hasLiked(confession) {
      const auth = useAuthStore()
      if (!auth.currentUser) return false
      if (confession.likedByMe !== undefined) return confession.likedByMe
      return confession.likes?.includes(auth.currentUser.id) || false
    },

    async addConfession({ to, content, from, color, images = [] }) {
      const auth = useAuthStore()
      if (!auth.isLoggedIn) throw new Error('请先登录后再发布表白')

      const payload = { to: (to || '').trim() || '所有人', content, from: from || '匿名', color, images }
      const data = await wallApi.postConfession(payload)
      if (data.confession) {
        this.confessions.unshift(data.confession)
        this.total += 1
      }
      return { confession: data.confession, filtered: data.filtered || 0 }
    },

    async toggleLike(id) {
      const auth = useAuthStore()
      if (!auth.isLoggedIn) throw new Error('请先登录后再点赞')
      const c = this.confessions.find((x) => x.id === id)
      if (!c) return false

      const isLiked = c.likedByMe !== undefined ? c.likedByMe : (c.likes?.includes(auth.currentUser.id) || false)

      try {
        let data
        if (isLiked) {
          data = await wallApi.unlikeConfession(id)
        } else {
          data = await wallApi.likeConfession(id)
        }
        c.likedByMe = data.liked
        c.likeCount = data.likeCount
        if (data.liked) {
          const notify = useNotificationStore()
          notify.pushLocal({
            type: 'like',
            toUserId: c.authorId,
            fromUser: auth.currentUser,
            confessionId: c.id,
            text: `赞了你的表白`
          })
        }
        return data.liked
      } catch (e) {
        throw new Error(e.message || '点赞操作失败')
      }
    },

    async addComment(confessionId, content, replyTo = null) {
      const auth = useAuthStore()
      if (!auth.isLoggedIn) throw new Error('请先登录后再评论')

      const payload = { content }
      if (replyTo) {
        payload.replyTo = { id: replyTo.id, nickname: replyTo.nickname }
      }

      const data = await wallApi.addComment(confessionId, payload)
      const c = this.confessions.find((x) => x.id === confessionId)
      if (c && data.comment) {
        if (!c.comments) c.comments = []
        c.comments.push(data.comment)
        c.commentCount = (c.commentCount || 0) + 1
      }
      return { comment: data.comment, filtered: data.filtered || 0 }
    },

    async removeComment(commentId) {
      const { deleteAdminComment } = await import('@/api/admin')
      await deleteAdminComment(commentId)
      this.confessions.forEach((c) => {
        if (c.comments) {
          const idx = c.comments.findIndex((cm) => cm.id === commentId)
          if (idx >= 0) {
            c.comments.splice(idx, 1)
            c.commentCount = Math.max(0, (c.commentCount || 1) - 1)
          }
        }
      })
    },

    async removeComments(ids) {
      const { batchDeleteComments } = await import('@/api/admin')
      await batchDeleteComments(ids)
      const set = new Set(ids)
      this.confessions.forEach((c) => {
        if (c.comments) {
          const before = c.comments.length
          c.comments = c.comments.filter((cm) => !set.has(cm.id))
          c.commentCount = Math.max(0, (c.commentCount || before) - (before - c.comments.length))
        }
      })
    },

    async deleteOwnConfession(id) {
      const auth = useAuthStore()
      if (!auth.isLoggedIn) throw new Error('请先登录')
      const c = this.confessions.find((x) => x.id === id)
      if (!c) throw new Error('表白不存在')
      if (c.authorId !== auth.currentUser.id) throw new Error('只能删除自己发布的表白')
      await wallApi.deleteConfession(id)
      this.confessions = this.confessions.filter((x) => x.id !== id)
      this.total = Math.max(0, this.total - 1)
    },

    async setConfessionStatus(id, status) {
      const { setConfessionStatus: apiSetStatus } = await import('@/api/admin')
      await apiSetStatus(id, status)
      const c = this.confessions.find((x) => x.id === id)
      if (c) c.status = status
    },

    async togglePinned(id) {
      const c = this.confessions.find((x) => x.id === id)
      if (!c) throw new Error('表白不存在')
      if (c.pinned) {
        const { setConfessionStatus: apiSetStatus } = await import('@/api/admin')
        await apiSetStatus(id, { pinned: false })
        c.pinned = false
        c.pinnedAt = null
        return false
      }
      const count = this.confessions.filter((x) => x.pinned).length
      if (count >= MAX_PINNED) {
        throw new Error(`最多只能置顶 ${MAX_PINNED} 条表白，请先取消其他置顶`)
      }
      const { setConfessionStatus: apiSetStatus } = await import('@/api/admin')
      await apiSetStatus(id, { pinned: true })
      c.pinned = true
      c.pinnedAt = Date.now()
      return true
    },

    async removeConfession(id) {
      const { deleteAdminConfession } = await import('@/api/admin')
      await deleteAdminConfession(id)
      this.confessions = this.confessions.filter((c) => c.id !== id)
      this.total = Math.max(0, this.total - 1)
    },

    async removeConfessions(ids) {
      const { batchDeleteConfessions } = await import('@/api/admin')
      await batchDeleteConfessions(ids)
      const set = new Set(ids)
      this.confessions = this.confessions.filter((c) => !set.has(c.id))
      this.total = Math.max(0, this.total - ids.length)
    },

    syncAuthorNickname(userId, oldNickname, newNickname) {
      this.confessions.forEach((c) => {
        if (c.authorId === userId && c.from === oldNickname) {
          c.from = newNickname
        }
        if (c.comments) {
          c.comments.forEach((cm) => {
            if (cm.authorId === userId && cm.nickname !== newNickname) {
              cm.nickname = newNickname
            }
          })
        }
      })
    }
  }
})