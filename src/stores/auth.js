import { defineStore } from 'pinia'
import { getItem, setItem } from '@/utils/storage'
import { AVATAR_COLORS } from '@/constants/colors'
import * as authApi from '@/api/auth'
import { getToken, clearToken } from '@/api/http'

const USERS_KEY = 'users'

const EMAIL_RE = /^[\w.-]+@[\w-]+(\.[\w-]+)+$/

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
    async init() {
      if (this.initialized) return
      const token = getToken()
      if (token) {
        try {
          const data = await authApi.getSession()
          if (data?.isLoggedIn && data?.user) {
            this.currentUser = data.user
          } else {
            this.currentUser = null
            clearToken()
          }
        } catch (e) {
          console.warn('[auth] 会话验证失败:', e.message)
          this.currentUser = null
          clearToken()
        }
      }
      this.users = getItem(USERS_KEY, [])
      this.initialized = true
    },

    _persistUsers() {
      setItem(USERS_KEY, this.users)
    },

    async register({ username, password, nickname, email = '', inviteCode = '', captchaId = '', captchaText = '', emailCode = '' }) {
      const uname = (username || '').trim()
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(uname)) {
        throw new Error('用户名需为 3-20 位字母、数字或下划线')
      }
      if ((password || '').length < 6) {
        throw new Error('密码长度不能少于 6 位')
      }
      const { useSettingsStore } = await import('./settings')
      const settings = useSettingsStore()
      await settings.init()
      if (settings.inviteCodeEnabled) {
        const code = (inviteCode || '').trim().toUpperCase()
        if (!code) throw new Error('请输入邀请码')
        if (!settings.validateInviteCode(code)) throw new Error('邀请码无效或已被使用')
      }
      const mail = (email || '').trim()
      if (mail && !EMAIL_RE.test(mail)) throw new Error('邮箱格式不正确')

      const payload = { username: uname, password, nickname: nickname || uname, email: mail }
      if (captchaId) payload.captchaId = captchaId
      if (captchaText) payload.captchaText = captchaText
      if (emailCode) payload.emailCode = emailCode

      const data = await authApi.register(payload)
      this.currentUser = data.user
      if (settings.inviteCodeEnabled) {
        settings.useInviteCode(inviteCode.trim(), data.user.id)
      }
      return data.user
    },

    async login({ username, password }) {
      const data = await authApi.login({ username, password })
      this.currentUser = data.user
      return data.user
    },

    async logout() {
      try {
        await authApi.logout()
      } catch {
        clearToken()
      }
      this.currentUser = null
    },

    async updateProfile({ nickname, avatarColor }) {
      if (!this.currentUser) throw new Error('请先登录')
      const nick = (nickname || '').trim()
      if (!nick) throw new Error('昵称不能为空')
      if (nick.length > 20) throw new Error('昵称长度不能超过 20 位')
      const payload = { nickname: nick }
      if (avatarColor && AVATAR_COLORS.includes(avatarColor)) {
        payload.avatarColor = avatarColor
      }
      const data = await (await import('@/api/user')).updateMe(payload)
      const oldNickname = this.currentUser.nickname
      this.currentUser = data.user
      return { user: data.user, oldNickname }
    },

    async changePassword({ oldPassword, newPassword }) {
      if (!this.currentUser) throw new Error('请先登录')
      if ((newPassword || '').length < 6) throw new Error('新密码长度不能少于 6 位')
      await (await import('@/api/user')).changePassword({ oldPassword, newPassword })
    },

    async findUserForReset(username, email) {
      const uname = (username || '').trim()
      const mail = (email || '').trim()
      if (!uname || !mail) throw new Error('请填写用户名和邮箱')
      const data = await authApi.forgotVerify({ username: uname, email: mail })
      return data
    },

    async setPasswordByReset(userId, resetToken, newPassword, emailCode) {
      if ((newPassword || '').length < 6) throw new Error('密码长度不能少于 6 位')
      await authApi.forgotReset({ userId, resetToken, newPassword, emailCode })
    },

    async createUser({ username, password, nickname, role = 'user', email = '' }) {
      const { createAdminUser } = await import('@/api/admin')
      const data = await createAdminUser({ username, password, nickname, role, email })
      this.users.push(data.user)
      this._persistUsers()
      return data.user
    },

    async setBanned(id, banned) {
      const { updateAdminUser } = await import('@/api/admin')
      await updateAdminUser(id, { banned })
      const user = this.users.find((u) => u.id === id)
      if (user) {
        user.status = banned ? 'banned' : 'active'
        this._persistUsers()
      }
    },

    async setRole(id, role) {
      const { updateAdminUser } = await import('@/api/admin')
      await updateAdminUser(id, { role })
      const user = this.users.find((u) => u.id === id)
      if (user) {
        user.role = role
        this._persistUsers()
      }
    },

    async resetPassword(id) {
      const { updateAdminUser } = await import('@/api/admin')
      await updateAdminUser(id, { action: 'resetPassword' })
    },

    async deleteUser(id) {
      const { deleteAdminUser } = await import('@/api/admin')
      await deleteAdminUser(id)
      const idx = this.users.findIndex((u) => u.id === id)
      if (idx >= 0) {
        this.users.splice(idx, 1)
        this._persistUsers()
      }
    }
  }
})