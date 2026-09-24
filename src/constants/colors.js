/**
 * 表白墙便签颜色主题（bg 为亮色背景，darkBg 为暗色模式背景）
 */
export const WALL_COLORS = [
  { key: 'pink', label: '浪漫粉', bg: '#fff0f5', darkBg: '#33202a', header: '#f56c6c' },
  { key: 'blue', label: '天空蓝', bg: '#eef6ff', darkBg: '#1c2a3d', header: '#5a9cf8' },
  { key: 'green', label: '清新绿', bg: '#eefaf2', darkBg: '#172e25', header: '#4faf7d' },
  { key: 'yellow', label: '柠檬黄', bg: '#fff9e6', darkBg: '#302a18', header: '#d9a406' },
  { key: 'purple', label: '梦幻紫', bg: '#f5efff', darkBg: '#272038', header: '#9370db' },
  { key: 'orange', label: '活力橙', bg: '#fff3e8', darkBg: '#33241a', header: '#f08c3a' }
]

export function colorOf(key) {
  return WALL_COLORS.find((c) => c.key === key) || WALL_COLORS[0]
}

/**
 * 头像背景色池
 */
export const AVATAR_COLORS = ['#f56c6c', '#e6a23c', '#67c23a', '#409eff', '#9370db', '#f08c3a', '#36cfc9']

export function avatarColorOf(seed = '') {
  let sum = 0
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}
