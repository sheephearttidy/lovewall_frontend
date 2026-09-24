import { defineStore } from 'pinia'
import { getItem, setItem } from '@/utils/storage'
import { genId } from '@/utils/format'
import { seedConfessions } from '@/api/seed'
import { useAuthStore } from './auth'
import { useSettingsStore } from './settings'
import { useNotificationStore } from './notification'
import { filterSensitiveText } from '@/utils/sensitive'
import { checkThrottle, markThrottle } from '@/utils/throttle'

const KEY = 'confessions'

/** 发布表白冷却：60 秒 / 条 */
const POST_COOLDOWN = 60 * 1000
/** 发表评论冷却：30 秒 / 条 */
const COMMENT_COOLDOWN = 30 * 1000
/** 置顶上限：3 条 */
const MAX_PINNED = 3

/** 置顶排序权重：置顶在前，同为置顶按置顶时间倒序 */
function byPinnedFirst(a, b) {
  const pa = a.pinned ? 1 : 0
  const pb = b.pinned ? 1 : 0
  if (pa !== pb) return pb - pa
  if (pa === 1) return (b.pinnedAt || 0) - (a.pinnedAt || 0)
  return b.createdAt - a.createdAt
}

/** 截断文本用于通知摘要 */
function truncate(text, n) {
  const t = String(text || '')
  return t.length > n ? t.slice(0, n) + '…' : t
}

export const useWallStore = defineStore('wall', {
  state: () => ({
    confessions: [],
    initialized: false
  }),

  getters: {
    /** 前台可见（正常状态）的表白：置顶优先，其余按时间倒序 */
    visible(state) {
      return state.confessions
        .filter((c) => c.status === 'normal')
        .slice()
        .sort(byPinnedFirst)
    },
    /** 当前置顶条数（后台管理用） */
    pinnedCount(state) {
      return state.confessions.filter((c) => c.pinned).length
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
        // 兼容旧数据：补充 pinned 字段（置顶功能上线前的存量表白）
        this.confessions = data.map((c) => (c.pinned === undefined ? { ...c, pinned: false } : c))
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
        status: 'normal',
        pinned: false,
        pinnedAt: null
      }
      this.confessions.unshift(item)
      markThrottle(`post:${auth.currentUser.id}`)
      this._persist()
      return { confession: item, filtered }
    },

    /**
     * 点赞 / 取消点赞（点赞时通知表白作者）
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
      // 通知表白作者
      const notify = useNotificationStore()
      notify.push({
        type: 'like',
        toUserId: c.authorId,
        fromUser: auth.currentUser,
        confessionId: c.id,
        text: `赞了你的表白「${truncate(c.content, 20)}」`
      })
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

      // 通知：表白作者 + 被回复评论的作者（同人只发一条，自己给自己的不发）
      const notify = useNotificationStore()
      const receivers = new Set()
      if (replyTo) {
        const target = c.comments.find((x) => x.id === replyTo.id)
        if (target?.authorId && target.authorId !== auth.currentUser.id) {
          receivers.add(target.authorId)
          notify.push({
            type: 'reply',
            toUserId: target.authorId,
            fromUser: auth.currentUser,
            confessionId: c.id,
            text: `回复了你的评论「${truncate(target.content, 15)}」：${truncate(cm.content, 15)}`
          })
        }
      }
      if (c.authorId && !receivers.has(c.authorId) && c.authorId !== auth.currentUser.id) {
        notify.push({
          type: 'comment',
          toUserId: c.authorId,
          fromUser: auth.currentUser,
          confessionId: c.id,
          text: `评论了你的表白「${truncate(c.content, 15)}」：${truncate(cm.content, 15)}`
        })
      }

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

    /**
     * 用户删除自己发布的表白（仅作者本人）
     */
    deleteOwnConfession(id) {
      const auth = useAuthStore()
      if (!auth.isLoggedIn) throw new Error('请先登录')
      const c = this.confessions.find((x) => x.id === id)
      if (!c) throw new Error('表白不存在')
      if (c.authorId !== auth.currentUser.id) throw new Error('只能删除自己发布的表白')
      this.confessions = this.confessions.filter((x) => x.id !== id)
      this._persist()
    },

    setConfessionStatus(id, status) {
      const c = this.confessions.find((x) => x.id === id)
      if (c) {
        c.status = status
        this._persist()
      }
    },

    /**
     * 置顶 / 取消置顶（管理员操作，置顶上限 MAX_PINNED 条）
     * @returns {boolean} 操作后的置顶状态
     */
    togglePinned(id) {
      const c = this.confessions.find((x) => x.id === id)
      if (!c) throw new Error('表白不存在')
      if (c.pinned) {
        c.pinned = false
        c.pinnedAt = null
        this._persist()
        return false
      }
      const count = this.confessions.filter((x) => x.pinned).length
      if (count >= MAX_PINNED) {
        throw new Error(`最多只能置顶 ${MAX_PINNED} 条表白，请先取消其他置顶`)
      }
      c.pinned = true
      c.pinnedAt = Date.now()
      this._persist()
      return true
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
