import { defineStore } from 'pinia'
import { getItem, setItem } from '@/utils/storage'
import { genId } from '@/utils/format'
import { seedConfessions } from '@/api/seed'
import { useAuthStore } from './auth'
import { useSettingsStore } from './settings'
import { filterSensitiveText } from '@/utils/sensitive'
import { checkThrottle, markThrottle } from '@/utils/throttle'

const KEY = 'confessions'

/** 发布表白冷却：60 秒 / 条 */
const POST_COOLDOWN = 60 * 1000
/** 发表评论冷却：30 秒 / 条 */
const COMMENT_COOLDOWN = 30 * 1000

export const useWallStore = defineStore('wall', {
  state: () => ({
    confessions: [],
    initialized: false
  }),

  getters: {
    /** 前台可见（正常状态）的表白，按时间倒序 */
    visible(state) {
      return state.confessions
        .filter((c) => c.status === 'normal')
        .slice()
        .sort((a, b) => b.createdAt - a.createdAt)
    },
    totalConfessions: (s) => s.confessions.length,
    totalLikes: (s) => s.confessions.reduce((n, c) => n + (c.likes?.length || 0), 0),
    totalComments: (s) => s.confessions.reduce((n, c) => n + (c.comments?.length || 0), 0),
    /** 展平的全部评论（后台管理用） */
    allComments(state) {
      const list = []
      state.confessions.forEach((c) => {
        c.comments.forEach((cm) => {
          list.push({ ...cm, confessionContent: c.content, confessionTo: c.to })
        })
      })
      return list.sort((a, b) => b.createdAt - a.createdAt)
    },
    /** 点赞 Top N（仪表盘用） */
    topLiked(state) {
      return state.confessions
        .slice()
        .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    }
  },

  actions: {
    init() {
      if (this.initialized) return
      const data = getItem(KEY, null)
      if (Array.isArray(data) && data.length) {
        this.confessions = data
      } else {
        this.confessions = seedConfessions()
        this._persist()
      }
      this.initialized = true
    },

    _persist() {
      setItem(KEY, this.confessions)
    },

    /** 当前用户是否已点赞 */
    hasLiked(confession) {
      const auth = useAuthStore()
      return !!auth.currentUser && confession.likes.includes(auth.currentUser.id)
    },

    /**
     * 发布表白（含敏感词过滤与频率限制）
     * @returns {{ confession: object, filtered: number }}
     */
    addConfession({ to, content, from, color, images = [] }) {
      const auth = useAuthStore()
      if (!auth.isLoggedIn) throw new Error('请先登录后再发布表白')

      const throttle = checkThrottle(`post:${auth.currentUser.id}`, POST_COOLDOWN)
      if (!throttle.ok) {
        throw new Error(`发布太频繁啦，请 ${throttle.remainSec} 秒后再试`)
      }

      const settings = useSettingsStore()
      settings.init()

      let finalContent = (content || '').trim()
      let filtered = 0
      if (settings.sensitiveFilterEnabled) {
        const r = filterSensitiveText(finalContent)
        finalContent = r.clean
        filtered = r.hitCount
      }
      if (!finalContent) throw new Error('表白内容不能为空')

      const item = {
        id: genId('c-'),
        to: (to || '').trim() || '所有人',
        content: finalContent,
        from: from || '匿名',
        authorId: auth.currentUser?.id || null,
        color,
        images,
        likes: [],
        comments: [],
        createdAt: Date.now(),
        status: 'normal'
      }
      this.confessions.unshift(item)
      markThrottle(`post:${auth.currentUser.id}`)
      this._persist()
      return { confession: item, filtered }
    },

    /**
     * 点赞 / 取消点赞
     */
    toggleLike(id) {
      const auth = useAuthStore()
      if (!auth.isLoggedIn) throw new Error('请先登录后再点赞')
      const c = this.confessions.find((x) => x.id === id)
      if (!c) return false
      const uid = auth.currentUser.id
      const idx = c.likes.indexOf(uid)
      if (idx >= 0) {
        c.likes.splice(idx, 1)
        this._persist()
        return false
      }
      c.likes.push(uid)
      this._persist()
      return true
    },

    /**
     * 发表评论（支持楼中楼回复，含敏感词过滤与频率限制）
     * @param {string} confessionId 表白 ID
     * @param {string} content 评论内容
     * @param {{ id: string, nickname: string } | null} replyTo 被回复的评论
     * @returns {{ comment: object, filtered: number }}
     */
    addComment(confessionId, content, replyTo = null) {
      const auth = useAuthStore()
      if (!auth.isLoggedIn) throw new Error('请先登录后再评论')

      const throttle = checkThrottle(`comment:${auth.currentUser.id}`, COMMENT_COOLDOWN)
      if (!throttle.ok) {
        throw new Error(`评论太频繁，请 ${throttle.remainSec} 秒后再试`)
      }

      const c = this.confessions.find((x) => x.id === confessionId)
      if (!c) throw new Error('表白不存在')

      const settings = useSettingsStore()
      settings.init()

      let finalContent = (content || '').trim()
      let filtered = 0
      if (settings.sensitiveFilterEnabled) {
        const r = filterSensitiveText(finalContent)
        finalContent = r.clean
        filtered = r.hitCount
      }
      if (!finalContent) throw new Error('评论内容不能为空')

      const cm = {
        id: genId('cm-'),
        confessionId,
        authorId: auth.currentUser.id,
        nickname: auth.currentUser.nickname,
        content: finalContent,
        replyTo: replyTo?.id || null,
        replyToNickname: replyTo?.nickname || '',
        createdAt: Date.now(),
        status: 'normal'
      }
      c.comments.push(cm)
      markThrottle(`comment:${auth.currentUser.id}`)
      this._persist()
      return { comment: cm, filtered }
    },

    removeComment(commentId) {
      this.confessions.forEach((c) => {
        const idx = c.comments.findIndex((cm) => cm.id === commentId)
        if (idx >= 0) c.comments.splice(idx, 1)
      })
      this._persist()
    },

    removeComments(ids) {
      const set = new Set(ids)
      this.confessions.forEach((c) => {
        c.comments = c.comments.filter((cm) => !set.has(cm.id))
      })
      this._persist()
    },

    /* ================= 管理员操作 ================= */

    setConfessionStatus(id, status) {
      const c = this.confessions.find((x) => x.id === id)
      if (c) {
        c.status = status
        this._persist()
      }
    },

    removeConfession(id) {
      this.confessions = this.confessions.filter((c) => c.id !== id)
      this._persist()
    },

    removeConfessions(ids) {
      const set = new Set(ids)
      this.confessions = this.confessions.filter((c) => !set.has(c.id))
      this._persist()
    },

    /**
     * 用户修改昵称后，同步其历史表白署名与评论昵称
     */
    syncAuthorNickname(userId, oldNickname, newNickname) {
      let changed = false
      this.confessions.forEach((c) => {
        if (c.authorId === userId && c.from === oldNickname) {
          c.from = newNickname
          changed = true
        }
        c.comments.forEach((cm) => {
          if (cm.authorId === userId && cm.nickname !== newNickname) {
            cm.nickname = newNickname
            changed = true
          }
        })
      })
      if (changed) this._persist()
    }
  }
})
