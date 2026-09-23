<template>
  <div class="comment-panel">
    <div v-if="confession.comments.length" class="comment-list">
      <div v-for="cm in confession.comments" :key="cm.id" class="comment-item">
        <span class="avatar" :style="{ background: avatarColorOf(cm.nickname) }">
          {{ cm.nickname.slice(0, 1) }}
        </span>
        <div class="body">
          <div class="head">
            <span class="nickname">{{ cm.nickname }}</span>
            <span class="time">{{ timeAgo(cm.createdAt) }}</span>
          </div>
          <div class="text">{{ cm.content }}</div>
        </div>
      </div>
    </div>
    <el-empty v-else description="还没有评论，来抢沙发～" :image-size="56" />

    <div class="comment-input">
      <el-input
        v-model="text"
        placeholder="说点什么吧…"
        maxlength="100"
        clearable
        @keyup.enter="submit"
      />
      <el-button type="primary" round :disabled="!text.trim()" @click="submit">发送</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useWallStore } from '@/stores/wall'
import { timeAgo } from '@/utils/format'
import { avatarColorOf } from '@/constants/colors'

const props = defineProps({
  confession: { type: Object, required: true }
})
const emit = defineEmits(['need-login'])

const wall = useWallStore()
const text = ref('')

function submit() {
  if (!text.value.trim()) return
  try {
    wall.addComment(props.confession.id, text.value)
    text.value = ''
    ElMessage.success('评论成功')
  } catch (e) {
    ElMessage.warning(e.message)
    emit('need-login')
  }
}
</script>

<style scoped>
.comment-panel {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 4px;
}
.comment-item {
  display: flex;
  gap: 8px;
}
.avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.body {
  flex: 1;
  min-width: 0;
}
.head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.nickname {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}
.time {
  font-size: 12px;
  color: #c0c4cc;
}
.text {
  font-size: 13px;
  color: #303133;
  line-height: 1.6;
  margin-top: 2px;
  word-break: break-all;
}
.comment-input {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
</style>
