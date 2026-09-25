<template>
  <div class="comment-panel">
    <div v-if="confession.comments.length" class="comment-list">
      <div
        v-for="cm in confession.comments"
        :key="cm.id"
        class="comment-item"
        :class="{ 'is-reply': cm.replyTo }"
      >
        <span class="avatar" :style="{ background: avatarColorOf(cm.nickname) }">
          {{ cm.nickname.slice(0, 1) }}
        </span>
        <div class="body">
          <div class="head">
            <span class="nickname">{{ cm.nickname }}</span>
            <span v-if="cm.replyToNickname" class="reply-tag">回复 @{{ cm.replyToNickname }}</span>
            <span class="time">{{ timeAgo(cm.createdAt) }}</span>
            <span class="reply-btn" @click="startReply(cm)">回复</span>
          </div>
          <div class="text">{{ cm.content }}</div>
        </div>
      </div>
    </div>
    <el-empty v-else description="还没有评论，来抢沙发～" :image-size="56" />

    <div class="comment-input">
      <el-tag
        v-if="replyTarget"
        closable
        type="info"
        effect="plain"
        size="small"
        class="replying-tag"
        @close="cancelReply"
      >
        回复 @{{ replyTarget.nickname }}
      </el-tag>
      <div class="input-row">
        <el-input
          v-model="text"
          :placeholder="replyTarget ? `回复 @${replyTarget.nickname}…` : '说点什么吧…'"
          maxlength="100"
          clearable
          @keyup.enter="submit"
        />
        <el-button type="primary" round :disabled="!text.trim()" @click="submit">发送</el-button>
      </div>
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
const replyTarget = ref(null)

function startReply(cm) {
  replyTarget.value = { id: cm.id, nickname: cm.nickname }
}

function cancelReply() {
  replyTarget.value = null
}

async function submit() {
  if (!text.value.trim()) return
  try {
    const { filtered } = await wall.addComment(props.confession.id, text.value, replyTarget.value)
    text.value = ''
    replyTarget.value = null
    ElMessage.success(filtered > 0 ? `评论成功（已过滤 ${filtered} 处敏感词）` : '评论成功')
  } catch (e) {
    ElMessage.warning(e.message)
    if (e.message.includes('请先登录')) emit('need-login')
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
.comment-item.is-reply {
  margin-left: 36px;
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
.comment-item.is-reply .avatar {
  width: 24px;
  height: 24px;
  font-size: 12px;
}
.body {
  flex: 1;
  min-width: 0;
}
.head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.nickname {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
}
.reply-tag {
  font-size: 12px;
  color: var(--hero-title);
  background: rgba(201, 79, 109, 0.08);
  border-radius: 999px;
  padding: 0 8px;
}
.time {
  font-size: 12px;
  color: var(--text-4);
}
.reply-btn {
  font-size: 12px;
  color: var(--text-3);
  cursor: pointer;
  margin-left: auto;
  transition: color 0.15s;
}
.reply-btn:hover {
  color: var(--hero-title);
}
.text {
  font-size: 13px;
  color: var(--text-1);
  line-height: 1.6;
  margin-top: 2px;
  word-break: break-all;
}
.comment-input {
  margin-top: 12px;
}
.replying-tag {
  margin-bottom: 8px;
}
.input-row {
  display: flex;
  gap: 8px;
}
@media (max-width: 480px) {
  .comment-item.is-reply {
    margin-left: 20px;
  }
  .input-row {
    flex-wrap: wrap;
  }
}
</style>