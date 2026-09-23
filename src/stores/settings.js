import { defineStore } from 'pinia'
import { getItem, setItem } from '@/utils/storage'

const KEY = 'settings'

/**
 * 系统设置（管理员可在后台调整）
 */
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    emailVerificationEnabled: false,
    captchaEnabled: false,
    sensitiveFilterEnabled: false,
    initialized: false
  }),

  actions: {
    init() {
      if (this.initialized) return
      const data = getItem(KEY, null)
      if (data) {
        this.emailVerificationEnabled = !!data.emailVerificationEnabled
        this.captchaEnabled = !!data.captchaEnabled
        this.sensitiveFilterEnabled = !!data.sensitiveFilterEnabled
      }
      this.initialized = true
    },

    _persist() {
      setItem(KEY, {
        emailVerificationEnabled: this.emailVerificationEnabled,
        captchaEnabled: this.captchaEnabled,
        sensitiveFilterEnabled: this.sensitiveFilterEnabled
      })
    },

    setEmailVerification(enabled) {
      this.emailVerificationEnabled = !!enabled
      this._persist()
    },

    setCaptcha(enabled) {
      this.captchaEnabled = !!enabled
      this._persist()
    },

    setSensitiveFilter(enabled) {
      this.sensitiveFilterEnabled = !!enabled
      this._persist()
    }
  }
})
