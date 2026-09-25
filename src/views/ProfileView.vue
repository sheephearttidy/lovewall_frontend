<template>
  <div class="profile-page">
    <FloatingHearts />
    <div class="profile-container fade-in-up">
      <!-- 头部信息 -->
      <div class="profile-header">
        <span class="big-avatar" :style="{ background: profileForm.avatarColor }">
          {{ nicknamePreview.slice(0, 1) }}
        </span>
        <div class="header-info">
          <h2>{{ auth.currentUser?.nickname }}</h2>
          <div class="meta">
            @{{ auth.currentUser?.username }} ·
            {{ auth.currentUser?.role === 'admin' ? '管理员' : '普通用户' }} ·
            注册于 {{ formatDateTime(auth.currentUser?.createdAt) }}
          </div>
          <div v-if="auth.currentUser?.email" class="meta">邮箱：{{ auth.currentUser.email }}</div>
        </div>
        <el-button text @click="router.push('/')">
          <el-icon><Back /></el-icon>返回表白墙
        </el-button>
      </div>

      <el-row :gutter="16">
        <!-- 资料设置 -->
        <el-col :xs="24" :md="12">
          <el-card shadow="never" class="panel">
            <template #header>
              <div class="panel-title"><el-icon><Brush /></el-icon>资料设置</div>
            </template>
            <el-form label-width="84px">
              <el-form-item label="昵称">
                <el-input v-model="profileForm.nickname" maxlength="20" show-word-limit placeholder="给自己起个好听的名字" />
              </el-form-item>
              <el-form-item label="头像颜色">
                <div class="color-row">
                  <span
                    v-for="c in AVATAR_COLORS"
                    :key="c"
                    class="color-ball"
                    :class="{ active: profileForm.avatarColor === c }"
                    :style="{ background: c }"
                    @click="profileForm.avatarColor = c"
                  >
                    <el-icon v-if="profileForm.avatarColor === c" class="check"><Check /></el-icon>
                  </span>
                </div>
              </el-form-item>
              <el-form-item label="头像预览">
                <span class="preview-avatar" :style="{ background: profileForm.avatarColor }">
                  {{ nicknamePreview.slice(0, 1) || '?' }}
                </span>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" round :loading="savingProfile" @click="saveProfile">保存资料</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 修改密码 -->
        <el-col :xs="24" :md="12">
          <el-card shadow="never" class="panel">
            <template #header>
              <div class="panel-title"><el-icon><Lock /></el-icon>修改密码</div>
            </template>
            <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="84px">
              <el-form-item label="原密码" prop="oldPassword">
                <el-input v-model="pwdForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="pwdForm.newPassword" type="password" placeholder="至少 6 位" show-password />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirm">
                <el-input v-model="pwdForm.confirm" type="password" placeholder="再次输入新密码" show-password />
              </el-form-item>
              <el-form-item>
              <el-button type="primary" round :loading="savingPwd" @click="savePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      </el-row>

      <!-- 我的表白 -->
      <el-card shadow="never" class="panel">
        <template #header>
          <div class="panel-title">
            <el-icon><ChatDotRound /></el-icon>我的表白
            <span class="my-count">共 {{ myConfessions.length }} 条</span>
          </div>
        </template>

        <div v-if="myConfessions.length" class="my-list">
          <div v-for="c in myConfessions" :key="c.id" class="my-item" :class="{ hidden: c.status !== 'normal' }">
            <div class="my-item-main">
              <div class="my-item-to">To：{{ c.to }}</div>
              <div class="my-item-content">{{ c.content }}</div>
              <div class="my-item-meta">
                <span>{{ timeAgo(c.createdAt) }}</span>
                <span>❤ {{ c.likes.length }}</span>
                <span>💬 {{ c.comments.length }}</span>
                <el-tag v-if="c.status !== 'normal'" size="small" type="info">已被管理员隐藏</el-tag>
              </div>
            </div>
            <div class="my-item-ops">
              <el-button text size="small" @click="locatePost(c.id)">查看</el-button>
              <el-button text size="small" type="danger" @click="removeMine(c)">删除</el-button>
            </div>
          </div>
        </div>
        <el-empty v-else description="还没有发布过表白，去写第一条吧～" :image-size="70">
          <el-button type="primary" round @click="router.push('/')">去发布</el-button>
        </el-empty>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useWallStore } from '@/stores/wall'
import { AVATAR_COLORS } from '@/constants/colors'
import { formatDateTime, timeAgo } from '@/utils/format'
import FloatingHearts from '@/components/FloatingHearts.vue'

const router = useRouter()
const auth = useAuthStore()
const wall = useWallStore()
wall.init().catch(() => {})

const savingProfile = ref(false)
const savingPwd = ref(false)
const pwdFormRef = ref()

const profileForm = reactive({
  nickname: auth.currentUser?.nickname || '',
  avatarColor: auth.currentUser?.avatarColor || AVATAR_COLORS[0]
})

const nicknamePreview = computed(() => profileForm.nickname.trim() || auth.currentUser?.username || '?')

const pwdForm = reactive({ oldPassword: '', newPassword: '', confirm: '' })
const pwdRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirm: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== pwdForm.newPassword) callback(new Error('两次输入的密码不一致'))
        else callback()
      },
      trigger: 'blur'
    }
  ]
}

async function saveProfile() {
  savingProfile.value = true
  try {
    const { user, oldNickname } = await auth.updateProfile({ ...profileForm })
    wall.syncAuthorNickname(user.id, oldNickname, user.nickname)
    ElMessage.success('资料已更新')
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    savingProfile.value = false
  }
}

/* ================= 我的表白 ================= */

const myConfessions = computed(() =>
  wall.confessions
    .filter((c) => c.authorId === auth.currentUser?.id)
    .sort((a, b) => b.createdAt - a.createdAt)
)

function locatePost(postId) {
  router.push({ path: '/', query: { post: postId } })
}

async function removeMine(c) {
  try {
    await ElMessageBox.confirm(
      `删除后无法恢复，确定删除这条发给「${c.to}」的表白吗？`,
      '删除表白',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }
  try {
    await wall.deleteOwnConfession(c.id)
    ElMessage.success('已删除')
  } catch (e) {
    ElMessage.error(e.message)
  }
}

async function savePassword() {
  try {
    await pwdFormRef.value.validate()
  } catch {
    return
  }
  savingPwd.value = true
  try {
    await auth.changePassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword })
    ElMessage.success('密码修改成功，请牢记新密码')
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirm = ''
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    savingPwd.value = false
  }
}
</script>

<style scoped>
.profile-page {
  position: relative;
  min-height: 100%;
  background: var(--hero-grad);
  padding: 32px 16px 60px;
}
.profile-container {
  position: relative;
  z-index: 1;
  width: min(900px, 100%);
  margin: 0 auto;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--surface);
  border-radius: 16px;
  padding: 22px 24px;
  box-shadow: 0 10px 28px var(--card-shadow-hover);
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.big-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  color: #fff;
  font-size: 26px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.header-info {
  flex: 1;
  min-width: 0;
}
.header-info h2 {
  margin: 0 0 6px;
  color: var(--hero-title);
  font-size: 20px;
}
.meta {
  font-size: 13px;
  color: var(--text-3);
  line-height: 1.7;
}
.panel {
  border-radius: 12px;
  margin-bottom: 16px;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: var(--text-1);
}
.color-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.color-ball {
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
}
.color-ball:hover {
  transform: scale(1.12);
}
.color-ball.active {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--love-pink);
}
.check {
  color: #fff;
  font-size: 14px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}
.preview-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: #fff;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.my-count {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-3);
  margin-left: 8px;
}
.my-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.my-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  padding: 12px 14px;
  transition: background 0.15s;
}
.my-item:hover {
  background: var(--love-pink-light);
}
.my-item.hidden .my-item-content {
  color: var(--text-4);
  text-decoration: line-through;
}
.my-item-main {
  flex: 1;
  min-width: 0;
}
.my-item-to {
  font-size: 13px;
  font-weight: 600;
  color: var(--hero-title);
  margin-bottom: 4px;
}
.my-item-content {
  font-size: 13px;
  color: var(--text-1);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.my-item-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-4);
  flex-wrap: wrap;
}
.my-item-ops {
  flex-shrink: 0;
}
@media (max-width: 768px) {
  .profile-header {
    padding: 16px;
  }
  .big-avatar {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
  .header-info h2 {
    font-size: 17px;
  }
}
@media (max-width: 480px) {
  .profile-page {
    padding: 16px 10px 40px;
  }
  .my-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .my-item-ops {
    align-self: flex-end;
  }
}
</style>