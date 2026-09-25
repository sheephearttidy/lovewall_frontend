<template>
  <el-dialog
    v-model="visible"
    title="分享这条表白"
    width="min(480px, 92vw)"
    append-to-body
    destroy-on-close
    align-center
  >
    <div v-if="confession" class="share-body">
      <!-- 卡片预览 -->
      <div
        class="share-preview"
        :style="{
          background: theme.isDark ? colorOf(confession.color).darkBg : colorOf(confession.color).bg,
          borderColor: colorOf(confession.color).border
        }"
      >
        <div class="s-to" :style="{ color: colorOf(confession.color).header }">
          To：{{ confession.to }}
        </div>
        <p class="s-content">{{ confession.content }}</p>
        <div class="s-meta">
          —— {{ confession.from }} · {{ timeAgo(confession.createdAt) }} ·
          {{ confession.likes.length }} 人心动
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="share-actions">
        <el-button type="primary" round @click="copyLink">
          <el-icon class="btn-icon"><Link /></el-icon>复制链接
        </el-button>
        <el-button round @click="copyText">
          <el-icon class="btn-icon"><DocumentCopy /></el-icon>复制文案
        </el-button>
      </div>
      <div class="share-tip">复制链接发给好友，打开后将自动定位并高亮这条表白</div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { Link, DocumentCopy } from '@element-plus/icons-vue'
import { timeAgo } from '@/utils/format'
import { colorOf } from '@/constants/colors'
import { useThemeStore } from '@/stores/theme'

const theme = useThemeStore()

const visible = defineModel({ type: Boolean, default: false })
const props = defineProps({
  confession: { type: Object, default: null }
})

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // 兼容不支持 Clipboard API 的环境
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  ElMessage.success('已复制到剪贴板')
  visible.value = false
}

function copyLink() {
  const url = `${location.origin}${location.pathname}?post=${props.confession.id}`
  copyToClipboard(url)
}

function copyText() {
  const c = props.confession
  const text = `【Lovewall 表白墙】\nTo：${c.to}\n${c.content}\n—— ${c.from}`
  copyToClipboard(text)
}
</script>

<style scoped>
.share-body {
  text-align: center;
}
.share-preview {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 20px 18px;
  text-align: left;
  transform: rotate(-0.6deg);
}
.s-to {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 8px;
}
.s-content {
  margin: 0 0 10px;
  color: var(--text-1);
  line-height: 1.7;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 180px;
  overflow-y: auto;
}
.s-meta {
  font-size: 12px;
  color: var(--text-3);
}
.share-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}
.btn-icon {
  margin-right: 4px;
}
.share-tip {
  margin-top: 14px;
  font-size: 12px;
  color: var(--text-4);
}
</style>