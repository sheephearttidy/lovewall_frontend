import { defineStore } from 'pinia'
import { getItem, setItem } from '@/utils/storage'
import { genId } from '@/utils/format'
import * as settingsApi from '@/api/settings'
import * as adminApi from '@/api/admin'

const KEY = 'settings'
const INVITE_CODES_KEY = 'inviteCodes'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    emailVerificationEnabled: false,
    captchaEnabled: false,
    sensitiveFilterEnabled: false,
    inviteCodeEnabled: false,
    initialized: false
  }),

  actions: {
    async init() {
      if (this.initialized) return
      try {
        const data = await settingsApi.getPublicSettings()
        const s = data.settings || data
        this.emailVerificationEnabled = !!s.emailVerificationEnabled
        this.captchaEnabled = !!s.captchaEnabled
        this.sensitiveFilterEnabled = !!s.sensitiveFilterEnabled
      } catch (e) {
        console.warn('[settings] 获取后端设置失败，使用本地缓存:', e.message)
        const local = getItem(KEY, null)
        if (local) {
          this.emailVerificationEnabled = !!local.emailVerificationEnabled
          this.captchaEnabled = !!local.captchaEnabled
          this.sensitiveFilterEnabled = !!local.sensitiveFilterEnabled
        }
      }
      const local = getItem(KEY, null)
      if (local) {
        this.inviteCodeEnabled = !!local.inviteCodeEnabled
      }
      this.initialized = true
    },

    _persist() {
      setItem(KEY, {
        emailVerificationEnabled: this.emailVerificationEnabled,
        captchaEnabled: this.captchaEnabled,
        sensitiveFilterEnabled: this.sensitiveFilterEnabled,
        inviteCodeEnabled: this.inviteCodeEnabled
      })
    },

    async setEmailVerification(enabled) {
      this.emailVerificationEnabled = !!enabled
      try {
        await adminApi.updateAdminSettings({ emailVerificationEnabled: !!enabled })
      } catch (e) {
        console.warn('[settings] 更新邮箱验证开关失败:', e.message)
      }
      this._persist()
    },

    async setCaptcha(enabled) {
      this.captchaEnabled = !!enabled
      try {
        await adminApi.updateAdminSettings({ captchaEnabled: !!enabled })
      } catch (e) {
        console.warn('[settings] 更新验证码开关失败:', e.message)
      }
      this._persist()
    },

    async setSensitiveFilter(enabled) {
      this.sensitiveFilterEnabled = !!enabled
      try {
        await adminApi.updateAdminSettings({ sensitiveFilterEnabled: !!enabled })
      } catch (e) {
        console.warn('[settings] 更新敏感词过滤开关失败:', e.message)
      }
      this._persist()
    },

    setInviteCode(enabled) {
      this.inviteCodeEnabled = !!enabled
      this._persist()
    },

    getInviteCodes() {
      return getItem(INVITE_CODES_KEY, [])
    },

    addInviteCodes(count = 1) {
      const codes = this.getInviteCodes()
      const added = []
      for (let i = 0; i < count; i++) {
        const code = generateCode()
        const item = { id: genId('ic-'), code, used: false, usedBy: null, usedAt: null, createdAt: Date.now() }
        codes.push(item)
        added.push(item)
      }
      setItem(INVITE_CODES_KEY, codes)
      return added
    },

    deleteInviteCode(id) {
      const codes = this.getInviteCodes()
      const idx = codes.findIndex((c) => c.id === id)
      if (idx >= 0) {
        codes.splice(idx, 1)
        setItem(INVITE_CODES_KEY, codes)
      }
    },

    useInviteCode(code, userId) {
      const codes = this.getInviteCodes()
      const item = codes.find((c) => c.code === code.toUpperCase() && !c.used)
      if (!item) return false
      item.used = true
      item.usedBy = userId
      item.usedAt = Date.now()
      setItem(INVITE_CODES_KEY, codes)
      return true
    },

    validateInviteCode(code) {
      const codes = this.getInviteCodes()
      return codes.some((c) => c.code === code.toUpperCase() && !c.used)
    }
  }
})