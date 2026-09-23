<template>
  <div class="auth-page">
    <FloatingHearts />
    <div class="auth-card fade-in-up">
      <h2>欢迎回来 💕</h2>
      <p class="sub">登录后就可以发布表白、点赞和评论啦</p>

      <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent>
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="submit"
          />
        </el-form-item>
        <el-button type="primary" size="large" class="submit-btn" :loading="loading" round @click="submit">
          登 录
        </el-button>
      </el-form>

      <div class="extra">
        <span>还没有账号？<router-link to="/register">立即注册</router-link></span>
        <span><router-link to="/forgot-password">忘记密码？</router-link> · <router-link to="/">返回表白墙</router-link></span>
      </div>

      <el-divider>
        <span class="divider-text">演示账号</span>
      </el-divider>
      <div class="demo">
        <el-button size="small" round @click="fill('admin', 'admin123')">管理员 admin / admin123</el-button>
        <el-button size="small" round @click="fill('xiaomei', '123456')">用户 xiaomei / 123456</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import FloatingHearts from '@/components/FloatingHearts.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const formRef = ref()
const loading = ref(false)
const form = reactive({ username: '', password: '' })

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

function fill(username, password) {
  form.username = username
  form.password = password
}

async function submit() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    const user = auth.login({ username: form.username, password: form.password })
    ElMessage.success(`欢迎回来，${user.nickname}！`)
    const redirect = route.query.redirect
    if (redirect) {
      router.push(String(redirect))
    } else {
      router.push(user.role === 'admin' ? '/admin' : '/')
    }
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
  padding: 24px;
  background: linear-gradient(150deg, #ffd6e0 0%, #fff5f7 50%, #e8eaf6 100%);
}
.auth-card {
  position: relative;
  z-index: 1;
  width: 400px;
  max-width: 100%;
  background: #fff;
  border-radius: 18px;
  padding: 38px 36px 28px;
  box-shadow: 0 16px 40px rgba(200, 100, 130, 0.18);
  text-align: center;
}
h2 {
  margin: 0 0 8px;
  color: #c94f6d;
}
.sub {
  margin: 0 0 26px;
  color: #a09298;
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
  color: #909399;
}
.divider-text {
  font-size: 12px;
  color: #c0c4cc;
}
.demo {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
