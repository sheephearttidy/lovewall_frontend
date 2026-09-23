import { getItem, setItem } from './storage'

/**
 * 操作频率检查（基于 localStorage 的简易节流）
 * @param {string} key 操作标识（建议按 用户ID:动作 区分）
 * @param {number} intervalMs 冷却间隔毫秒
 * @returns {{ ok: boolean, remainSec: number }}
 */
export function checkThrottle(key, intervalMs) {
  const last = getItem('throttle:' + key, 0)
  const elapsed = Date.now() - last
  if (elapsed < intervalMs) {
    return { ok: false, remainSec: Math.ceil((intervalMs - elapsed) / 1000) }
  }
  return { ok: true, remainSec: 0 }
}

/**
 * 记录一次操作时间（成功执行后调用）
 */
export function markThrottle(key) {
  setItem('throttle:' + key, Date.now())
}
