<template>
  <div class="auth-page">
    <FloatingHearts />
    <div class="auth-card fade-in-up">
      <h2>找回密码 🔑</h2>
      <p class="sub">通过注册邮箱验证身份，三步重置密码</p>

      <el-steps :active="step" simple class="steps">
        <el-step title="验证身份" />
        <el-step title="邮箱验证码" />
        <el-step title="重置密码" />
      </el-steps>

      <!-- 第一步：验证身份 -->
      <el-form v-if="step === 0" ref="step0Ref" :model="form" :rules="step0Rules" size="large" label-position="top" @submit.prevent>
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="注册时绑定的邮箱" :prefix-icon="Message" />
        </el-form-item>
        <el-button type="primary" size="large" class="submit-btn" round @click="verifyIdentity">
          下一步
        </el-button>
      </el-form>

      <!-- 第二步：邮箱验证码 -->
      <div v-else-if="step === 1" class="step-body">
        <el-alert type="success" :closable="false" class="mb">
          <template #title>
            身份验证通过：{{ resetUser.nickname }}（{{ maskedEmail }}）
          </template>
        </el-alert>
        <el-form size="large" label-position="top" @submit.prevent>
          <el-form-item>
            <div class="inline-row">
              <el-input v-model="form.emailCode" placeholder="邮箱验证码（6 位）" :prefix-icon="Key" maxlength="6" />
              <el-button class="side-btn" :disabled="cooldown > 0" @click="sendCode">
                {{ cooldown > 0 ? `${cooldown}s 后重发` : '重新发送' }}
              </el-button>
            </div>
          </el-form-item>
          <el-button type="primary" size="large" class="submit-btn" round @click="verifyCode">
            下一步
          </el-button>
        </el-form>
      </div>

      <!-- 第三步：设置新密码 -->
      <el-form v-else ref="step2Ref" :model="form" :rules="step2Rules" size="large" label-position="top" @submit.prevent>
        <el-form-item prop="newPassword">
          <el-input v-model="form.newPassword" type="password" placeholder="新密码（至少 6 位）" :prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item prop="confirm">
          <el-input v-model="form.confirm" type="password" placeholder="确认新密码" :prefix-icon="Lock" show-password />
        </el-form-item>
        <el-button type="primary" size="large" class="submit-btn" round :loading="loading" @click="resetPassword">
          重置密码
        </el-button>
      </el-form>

      <div class="extra">
        <span>想起来了？<router-link to="/login">直接登录</router-link></span>
        <router-link to="/">返回表白墙</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { User, Message, Key, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import * as authApi from '@/api/auth'
import FloatingHearts from '@/components/FloatingHearts.vue'

const router = useRouter()
const auth = useAuthStore()

const step = ref(0)
const loading = ref(false)
const cooldown = ref(0)
let cooldownTimer = null
const resetUser = ref(null)

const step0Ref = ref()
const step2Ref = ref()

const form = reactive({
  username: '',
  email: '',
  emailCode: '',
  newPassword: '',
  confirm: ''
})

const maskedEmail = computed(() => {
  const mail = resetUser.value?.email || ''
  const [name, domain] = mail.split('@')
  if (!domain) return mail
  const head = name.slice(0, Math.min(2, name.length))
  return `${head}${'*'.repeat(Math.max(name.length - 2, 2))}@${domain}`
})

const step0Rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

const step2Rules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirm: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== form.newPassword) callback(new Error('两次输入的密码不一致'))
        else callback()
      },
      trigger: 'blur'
    }
  ]
}

function startCooldown() {
  cooldown.value = 60
  clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

const resetToken = ref('')

async function sendCode() {
  try {
    const data = await authApi.sendEmailCode(resetUser.value.email)
    if (data.code) {
      ElNotification({
        title: '验证码已发送（开发模式）',
        message: `验证码 ${data.code}，5 分钟内有效`,
        type: 'info',
        duration: 10000
      })
    } else {
      ElMessage.success(`验证码已发送至 ${resetUser.value.email}，5 分钟内有效`)
    }
  } catch (e) {
    ElMessage.error(e.message || '发送验证码失败')
    return
  }
  startCooldown()
}

async function verifyIdentity() {
  try {
    await step0Ref.value.validate()
  } catch {
    return
  }
  try {
    const data = await auth.findUserForReset(form.username, form.email)
    resetUser.value = data.user
    resetToken.value = data.resetToken
    await sendCode()
    step.value = 1
  } catch (e) {
    ElMessage.error(e.message)
  }
}

function verifyCode() {
  if (!/^\d{6}$/.test(form.emailCode.trim())) {
    ElMessage.warning('请输入 6 位数字验证码')
    return
  }
  step.value = 2
}

async function resetPassword() {
  try {
    await step2Ref.value.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    await auth.setPasswordByReset(resetUser.value.id, resetToken.value, form.newPassword, form.emailCode.trim())
    ElMessage.success('密码重置成功，请使用新密码登录')
    router.push('/login')
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  position: relative;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: var(--hero-grad);
}
.auth-card {
  position: relative;
  z-index: 1;
  width: 420px;
  max-width: 100%;
  background: var(--surface);
  border-radius: 18px;
  padding: 36px 32px 28px;
  box-shadow: 0 16px 40px var(--card-shadow-hover);
  text-align: center;
}
h2 {
  margin: 0 0 8px;
  color: var(--hero-title);
}
.sub {
  margin: 0 0 20px;
  color: var(--text-3);
  font-size: 13px;
}
.steps {
  margin-bottom: 24px;
}
.submit-btn {
  width: 100%;
  margin-top: 4px;
}
.extra {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
  font-size: 13px;
  color: var(--text-3);
  flex-wrap: wrap;
  gap: 8px;
}
.inline-row {
  display: flex;
  gap: 10px;
  width: 100%;
  align-items: center;
}
.side-btn {
  flex-shrink: 0;
}
.step-body {
  text-align: left;
}
.mb {
  margin-bottom: 18px;
}
@media (max-width: 480px) {
  .auth-card {
    padding: 28px 20px 22px;
    border-radius: 14px;
  }
  .extra {
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
}
</style>