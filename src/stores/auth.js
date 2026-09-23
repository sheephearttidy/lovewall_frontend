import { defineStore } from 'pinia'
import { getItem, setItem, removeItem } from '@/utils/storage'
import { genId } from '@/utils/format'
import { seedUsers } from '@/api/seed'
import { avatarColorOf } from '@/constants/colors'

const USERS_KEY = 'users'
const SESSION_KEY = 'session'

/**
 * Mock 密码哈希（仅用于前端演示，请勿用于生产环境）
 */
export function hashPassword(pwd) {
  let h = 5381
  for (let i = 0; i < pwd.length; i++) h = ((h << 5) + h + pwd.charCodeAt(i)) | 0
  return 'mw' + (h >>> 0).toString(36)
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    users: [],
    currentUser: null,
    initialized: false
  }),

  getters: {
    isLoggedIn: (s) => !!s.currentUser,
    isAdmin: (s) => !!s.currentUser && s.currentUser.role === 'admin',
    activeUsers: (s) => s.users.filter((u) => u.status === 'active')
  },

  actions: {
    init() {
      if (this.initialized) return
      const data = getItem(USERS_KEY, null)
      if (Array.isArray(data) && data.length) {
        this.users = data
      } else {
        this.users = seedUsers()
        this._persistUsers()
      }
      const uid = getItem(SESSION_KEY, null)
      this.currentUser = this.users.find((u) => u.id === uid) || null
      this.initialized = true
    },

    _persistUsers() {
      setItem(USERS_KEY, this.users)
    },

    /**
     * 注册（成功后自动登录）
     */
    register({ username, password, nickname }) {
      this.init()
      const uname = (username || '').trim()
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(uname)) {
        throw new Error('用户名需为 3-20 位字母、数字或下划线')
      }
      if ((password || '').length < 6) {
        throw new Error('密码长度不能少于 6 位')
      }
      if (this.users.some((u) => u.username === uname)) {
        throw new Error('用户名已被注册')
      }
      const user = {
        id: genId('u-'),
        username: uname,
        nickname: (nickname || '').trim() || uname,
        password: hashPassword(password),
        role: 'user',
        avatarColor: avatarColorOf(nickname || uname),
        createdAt: Date.now(),
        status: 'active'
      }
      this.users.push(user)
      this._persistUsers()
      this.currentUser = user
      setItem(SESSION_KEY, user.id)
      return user
    },

    /**
     * 登录
     */
    login({ username, password }) {
      this.init()
      const user = this.users.find((u) => u.username === (username || '').trim())
      if (!user || user.password !== hashPassword(password)) {
        throw new Error('用户名或密码错误')
      }
      if (user.status === 'banned') {
        throw new Error('该账号已被封禁，请联系管理员')
      }
      this.currentUser = user
      setItem(SESSION_KEY, user.id)
      return user
    },

    logout() {
      this.currentUser = null
      removeItem(SESSION_KEY)
    },

    /* ================= 管理员操作 ================= */

    createUser({ username, password, nickname, role = 'user' }) {
      this.init()
      const uname = (username || '').trim()
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(uname)) throw new Error('用户名需为 3-20 位字母、数字或下划线')
      if ((password || '').length < 6) throw new Error('密码长度不能少于 6 位')
      if (this.users.some((u) => u.username === uname)) throw new Error('用户名已存在')
      const user = {
        id: genId('u-'),
        username: uname,
        nickname: (nickname || '').trim() || uname,
        password: hashPassword(password),
        role: role === 'admin' ? 'admin' : 'user',
        avatarColor: avatarColorOf(nickname || uname),
        createdAt: Date.now(),
        status: 'active'
      }
      this.users.push(user)
      this._persistUsers()
      return user
    },

    setBanned(id, banned) {
      const user = this.users.find((u) => u.id === id)
      if (!user) throw new Error('用户不存在')
      user.status = banned ? 'banned' : 'active'
      this._persistUsers()
    },

    setRole(id, role) {
      const user = this.users.find((u) => u.id === id)
      if (!user) throw new Error('用户不存在')
      user.role = role
      this._persistUsers()
    },

    resetPassword(id) {
      const user = this.users.find((u) => u.id === id)
      if (!user) throw new Error('用户不存在')
      user.password = hashPassword('123456')
      this._persistUsers()
    },

    deleteUser(id) {
      const idx = this.users.findIndex((u) => u.id === id)
      if (idx >= 0) {
        this.users.splice(idx, 1)
        this._persistUsers()
      }
    }
  }
})
