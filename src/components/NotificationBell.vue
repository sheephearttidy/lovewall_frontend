<template>
  <el-popover placement="bottom-end" :width="360" trigger="click" popper-class="notify-popper">
    <template #reference>
      <span class="bell-wrap" title="消息通知">
        <el-badge :value="unread" :hidden="unread === 0" :max="99">
          <el-icon :size="20" class="bell-icon"><Bell /></el-icon>
        </el-badge>
      </span>
    </template>

    <div class="notify-panel">
      <div class="notify-head">
        <span class="notify-title">消息通知</span>
        <span v-if="list.length" class="notify-ops">
          <el-link :underline="false" type="primary" @click="notify.markAllRead()">全部已读</el-link>
          <el-divider direction="vertical" />
          <el-link :underline="false" type="danger" @click="notify.clearAll()">清空</el-link>
        </span>
      </div>

      <div v-if="list.length" class="notify-list">
        <div
          v-for="n in list"
          :key="n.id"
          class="notify-item"
          :class="{ unread: !n.read }"
          @click="onClick(n)"
        >
          <span class="notify-icon" :class="n.type">
            {{ ICONS[n.type] || '🔔' }}
          </span>
          <div class="notify-body">
            <div class="notify-text">
              <b>{{ n.fromNickname }}</b> {{ n.text }}
            </div>
            <div class="notify-time">{{ timeAgo(n.createdAt) }}</div>
          </div>
          <span v-if="!n.read" class="unread-dot"></span>
        </div>
      </div>
      <el-empty v-else description="暂无消息，去收获一些心动吧～" :image-size="60" />
    </div>
  </el-popover>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import { useNotificationStore } from '@/stores/notification'
import { timeAgo } from '@/utils/format'

const ICONS = { like: '❤️', comment: '💬', reply: '↩️' }

const router = useRouter()
const notify = useNotificationStore()
notify.init().catch(() => {})

const list = computed(() => notify.myNotifications)
const unread = computed(() => notify.unreadCount)

function onClick(n) {
  if (!n.read) notify.markRead(n.id)
  if (n.confessionId) {
    router.push({ path: '/', query: { post: n.confessionId } })
  }
}
</script>

<style scoped>
.bell-wrap {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  margin-right: 14px;
}
.bell-icon {
  color: var(--hero-title);
}
.notify-panel {
  margin: -4px -6px;
}
.notify-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px 10px;
  border-bottom: 1px solid var(--border-soft);
}
.notify-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-1);
}
.notify-ops {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
}
.notify-list {
  max-height: 340px;
  overflow-y: auto;
}
.notify-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}
.notify-item:hover {
  background: var(--love-pink-light);
}
.notify-item.unread {
  background: var(--love-pink-light);
}
.notify-icon {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
.notify-icon.like {
  background: var(--love-pink-light);
}
.notify-icon.comment {
  background: var(--surface-2);
}
.notify-icon.reply {
  background: var(--surface-2);
}
.notify-body {
  flex: 1;
  min-width: 0;
}
.notify-text {
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.5;
  word-break: break-all;
}
.notify-text b {
  color: var(--hero-title);
  font-weight: 600;
}
.notify-time {
  font-size: 12px;
  color: var(--text-4);
  margin-top: 2px;
}
.unread-dot {
  position: absolute;
  right: 10px;
  top: 14px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f56c6c;
}
</style>