<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="admin-aside">
      <div class="logo">
        <span class="logo-icon">💌</span>
        <span>Lovewall Admin</span>
      </div>
      <el-menu
        :default-active="route.path"
        router
        background-color="#001529"
        text-color="#a6adb4"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/confessions">
          <el-icon><ChatDotRound /></el-icon>
          <span>表白管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/comments">
          <el-icon><Comment /></el-icon>
          <span>评论管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
      <div class="aside-footer">Lovewall v1.0.0</div>
    </el-aside>

    <el-container class="admin-main-container">
      <!-- 顶栏 -->
      <el-header class="admin-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
          <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="header-right">
          <el-button text @click="router.push('/')">
            <el-icon><House /></el-icon>
            <span class="hide-sm">前台表白墙</span>
          </el-button>
          <el-dropdown @command="onCommand">
            <span class="user-chip">
              <span class="avatar" :style="{ background: auth.currentUser?.avatarColor }">
                {{ (auth.currentUser?.nickname || 'A').slice(0, 1) }}
              </span>
              <span class="hide-sm">{{ auth.currentUser?.nickname }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="front">返回前台</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

function onCommand(cmd) {
  if (cmd === 'logout') {
    auth.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } else if (cmd === 'front') {
    router.push('/')
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100%;
}
.admin-aside {
  display: flex;
  flex-direction: column;
  background: #001529;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 18px;
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.logo-icon {
  font-size: 20px;
}
.admin-aside :deep(.el-menu) {
  border-right: none;
  flex: 1;
}
.admin-aside :deep(.el-menu-item.is-active) {
  background: var(--love-pink) !important;
  color: #fff !important;
}
.admin-aside :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.06);
}
.aside-footer {
  padding: 14px;
  color: #5c6672;
  font-size: 12px;
  text-align: center;
}
.admin-main-container {
  flex-direction: column;
}
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 5;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #303133;
  font-size: 14px;
  outline: none;
}
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.admin-main {
  background: #f5f7fa;
  padding: 18px;
  overflow-y: auto;
}
@media (max-width: 768px) {
  .hide-sm {
    display: none;
  }
}
</style>
