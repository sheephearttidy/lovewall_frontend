/**
 * Mock 邮件服务（演示模式）
 *
 * 正式环境应替换为后端发送邮件 + 服务端校验验证码。
 * 当前实现：验证码生成后存于内存（带过期时间），并以返回值形式交给调用方展示。
 */

const CODE_TTL = 5 * 60 * 1000 // 5 分钟有效

const codes = new Map()

/**
 * 发送验证码（Mock：返回验证码本身，由前端以通知形式展示）
 */
export function sendVerificationCode(email) {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  codes.set(email, { code, expiresAt: Date.now() + CODE_TTL })
  return code
}

/**
 * 校验验证码
 */
export function verifyEmailCode(email, input) {
  const rec = codes.get(email)
  if (!rec) return { ok: false, msg: '请先获取邮箱验证码' }
  if (Date.now() > rec.expiresAt) {
    codes.delete(email)
    return { ok: false, msg: '验证码已过期，请重新获取' }
  }
  if (rec.code !== String(input || '').trim()) {
    return { ok: false, msg: '邮箱验证码错误' }
  }
  codes.delete(email)
  return { ok: true }
}
