<template>
  <div class="auth-page">
    <FloatingHearts />
    <div class="auth-card fade-in-up">
      <h2>加入 Lovewall 💌</h2>
      <p class="sub">注册一个账号，开启你的表白之旅</p>

      <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent>
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名（3-20 位字母、数字或下划线）" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="nickname">
          <el-input v-model="form.nickname" placeholder="昵称（留空则默认使用用户名）" :prefix-icon="Avatar" />
        </el-form-item>

        <template v-if="settings.emailVerificationEnabled">
          <el-form-item prop="email">
            <el-input v-model="form.email" placeholder="邮箱（用于接收验证码）" :prefix-icon="Message" />
          </el-form-item>
          <el-form-item prop="emailCode">
            <div class="inline-row">
              <el-input v-model="form.emailCode" placeholder="邮箱验证码（6 位）" :prefix-icon="Key" maxlength="6" />
              <el-button class="side-btn" :disabled="cooldown > 0" @click="sendCode">
                {{ cooldown > 0 ? `${cooldown}s 后重发` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
        </template>

        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码（至少 6 位）" :prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item prop="confirm">
          <el-input v-model="form.confirm" type="password" placeholder="确认密码" :prefix-icon="Lock" show-password />
        </el-form-item>

        <el-form-item v-if="settings.inviteCodeEnabled" prop="inviteCode">
          <el-input v-model="form.inviteCode" placeholder="邀请码（8 位）" :prefix-icon="Ticket" maxlength="8" />
        </el-form-item>

        <el-form-item v-if="settings.captchaEnabled" prop="captcha">
          <div class="inline-row">
            <el-input v-model="form.captcha" placeholder="图形验证码" :prefix-icon="Key" maxlength="4" @keyup.enter="submit" />
            <ImageCaptcha ref="captchaRef" class="side-btn" />
          </div>
        </el-form-item>

        <el-button type="primary" size="large" class="submit-btn" :loading="loading" round @click="submit">
          注 册
        </el-button>
      </el-form>

      <div class="extra">
        <span>已有账号？<router-link to="/login">直接登录</router-link></span>
        <router-link to="/">返回表白墙</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { User, Lock, Avatar, Message, Key, Ticket } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import * as authApi from '@/api/auth'
import FloatingHearts from '@/components/FloatingHearts.vue'
import ImageCaptcha from '@/components/ImageCaptcha.vue'

const router = useRouter()
const auth = useAuthStore()
const settings = useSettingsStore()
settings.init().catch(() => {})

const formRef = ref()
const captchaRef = ref()
const loading = ref(false)
const cooldown = ref(0)
let cooldownTimer = null

const form = reactive({
  username: '',
  nickname: '',
  email: '',
  emailCode: '',
  password: '',
  confirm: '',
  inviteCode: '',
  captcha: ''
})

const rules = computed(() => {
  const r = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '3-20 位字母、数字或下划线', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
    ],
    confirm: [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
      {
        validator: (_rule, value, callback) => {
          if (value !== form.password) callback(new Error('两次输入的密码不一致'))
          else callback()
        },
        trigger: 'blur'
      }
    ]
  }
  if (settings.emailVerificationEnabled) {
    r.email = [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ]
    r.emailCode = [{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }]
  }
  if (settings.captchaEnabled) {
    r.captcha = [{ required: true, message: '请输入图形验证码', trigger: 'blur' }]
  }
  if (settings.inviteCodeEnabled) {
    r.inviteCode = [{ required: true, message: '请输入邀请码', trigger: 'blur' }]
  }
  return r
})

async function sendCode() {
  if (!/^[\w.-]+@[\w-]+(\.[\w-]+)+$/.test(form.email.trim())) {
    ElMessage.warning('请先填写正确的邮箱地址')
    return
  }
  const email = form.email.trim()
  try {
    const data = await authApi.sendEmailCode(email)
    if (data.code) {
      ElNotification({
        title: '验证码已发送（开发模式）',
        message: `验证码 ${data.code}，5 分钟内有效`,
        type: 'info',
        duration: 10000
      })
    } else {
      ElMessage.success(`验证码已发送至 ${email}，5 分钟内有效`)
    }
  } catch (e) {
    ElMessage.error(e.message || '发送验证码失败')
    return
  }
  cooldown.value = 60
  clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

async function submit() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  if (settings.captchaEnabled) {
    if (!captchaRef.value.verify(form.captcha)) {
      ElMessage.error('图形验证码错误，请重试')
      captchaRef.value.refresh()
      form.captcha = ''
      return
    }
  }

  loading.value = true
  try {
    const user = await auth.register({
      username: form.username,
      password: form.password,
      nickname: form.nickname,
      email: settings.emailVerificationEnabled ? form.email.trim() : '',
      inviteCode: settings.inviteCodeEnabled ? form.inviteCode.trim() : '',
      emailCode: settings.emailVerificationEnabled ? form.emailCode : '',
      captchaId: settings.captchaEnabled ? (captchaRef.value?.captchaId || '') : '',
      captchaText: settings.captchaEnabled ? form.captcha : ''
    })
    ElMessage.success(`注册成功，欢迎加入，${user.nickname}！`)
    router.push('/')
  } catch (e) {
    ElMessage.error(e.message)
    if (settings.captchaEnabled) {
      captchaRef.value.refresh()
      form.captcha = ''
    }
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
  margin: 0 0 26px;
  color: var(--text-3);
  font-size: 13px;
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