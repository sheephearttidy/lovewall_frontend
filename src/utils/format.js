function pad(n) {
  return n < 10 ? '0' + n : '' + n
}

/**
 * 时间戳 → YYYY-MM-DD HH:mm
 */
export function formatDateTime(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * 时间戳 → 相对时间（刚刚 / n 分钟前 / n 小时前 / n 天前 / 日期）
 */
export function timeAgo(ts) {
  if (!ts) return '-'
  const diff = Date.now() - ts
  const m = 60 * 1000
  const h = 60 * m
  const d = 24 * h
  if (diff < m) return '刚刚'
  if (diff < h) return Math.floor(diff / m) + ' 分钟前'
  if (diff < d) return Math.floor(diff / h) + ' 小时前'
  if (diff < 7 * d) return Math.floor(diff / d) + ' 天前'
  return formatDateTime(ts).slice(0, 10)
}

/**
 * 生成短 ID
 */
export function genId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}
