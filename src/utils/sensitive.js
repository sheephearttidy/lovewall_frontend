import { SENSITIVE_WORDS } from '@/constants/sensitive-words'

/**
 * 敏感词检测与替换
 * @param {string} text 原文本
 * @returns {{ clean: string, hitCount: number, hitWords: string[] }} 替换后的文本与命中信息
 */
export function filterSensitiveText(text) {
  const source = String(text || '')
  let clean = source
  const hitWords = []

  for (const word of SENSITIVE_WORDS) {
    if (!word) continue
    // 忽略大小写匹配（英文词）
    const re = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    if (re.test(clean)) {
      hitWords.push(word)
      clean = clean.replace(re, '*'.repeat(word.length))
    }
  }

  return { clean, hitCount: hitWords.length, hitWords }
}
