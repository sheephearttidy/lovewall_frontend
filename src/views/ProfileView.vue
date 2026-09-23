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
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useWallStore } from '@/stores/wall'
import { AVATAR_COLORS } from '@/constants/colors'
import { formatDateTime } from '@/utils/format'
import FloatingHearts from '@/components/FloatingHearts.vue'

const router = useRouter()
const auth = useAuthStore()
const wall = useWallStore()
wall.init()

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

function saveProfile() {
  savingProfile.value = true
  try {
    const { user, oldNickname } = auth.updateProfile({ ...profileForm })
    // 同步历史表白署名与评论昵称
    wall.syncAuthorNickname(user.id, oldNickname, user.nickname)
    ElMessage.success('资料已更新')
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    savingProfile.value = false
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
    auth.changePassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword })
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
  background: linear-gradient(150deg, #ffd6e0 0%, #fff5f7 50%, #e8eaf6 100%);
  padding: 32px 20px 60px;
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
  background: #fff;
  border-radius: 16px;
  padding: 22px 24px;
  box-shadow: 0 10px 28px rgba(200, 100, 130, 0.14);
  margin-bottom: 16px;
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
  color: #c94f6d;
  font-size: 20px;
}
.meta {
  font-size: 13px;
  color: #909399;
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
  color: #303133;
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
</style>
