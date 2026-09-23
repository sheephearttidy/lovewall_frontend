const PREFIX = 'lovewall:'

/**
 * 读取 localStorage（带 JSON 解析与容错）
 */
export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

/**
 * 写入 localStorage（JSON 序列化）
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    // 存储空间不足等异常时静默失败，避免页面崩溃
    console.warn('[storage] 写入失败:', e)
  }
}

/**
 * 删除 localStorage 键
 */
export function removeItem(key) {
  localStorage.removeItem(PREFIX + key)
}
