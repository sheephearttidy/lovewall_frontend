/**
 * CSV 导出工具：生成带 BOM 的 UTF-8 CSV（Excel 中文不乱码）并触发浏览器下载
 */

/** 单元格转义：含分隔符/引号/换行时用双引号包裹并转义内部引号 */
function esc(v) {
  const s = v === null || v === undefined ? '' : String(v)
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

/**
 * 导出 CSV 文件
 * @param {string} filename 文件名（不含扩展名）
 * @param {string[]} headers 表头
 * @param {Array<Array>} rows 数据行（与表头同序）
 */
export function exportCsv(filename, headers, rows) {
  const lines = [headers, ...rows].map((r) => r.map(esc).join(','))
  const csv = '\uFEFF' + lines.join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
