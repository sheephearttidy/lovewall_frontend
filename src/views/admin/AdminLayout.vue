<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="collapsed ? '64px' : '220px'" class="admin-aside" :class="{ collapsed }">
      <div class="logo">
        <span class="logo-icon">💌</span>
        <transition name="fade">
          <span v-if="!collapsed" class="logo-text">Lovewall Admin</span>
        </transition>
      </div>
      <el-scrollbar class="menu-scroll">
        <el-menu
          :default-active="route.path"
          :collapse="collapsed"
          :collapse-transition="false"
          router
          background-color="transparent"
          text-color="rgba(255, 255, 255, 0.66)"
          active-text-color="#ffffff"
        >
          <div v-if="!collapsed" class="menu-group-title">概览</div>
          <el-menu-item index="/admin/dashboard">
            <el-icon><Odometer /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>

          <div v-if="!collapsed" class="menu-group-title">内容管理</div>
          <el-menu-item index="/admin/confessions">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>表白管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/comments">
            <el-icon><Comment /></el-icon>
            <template #title>评论管理</template>
          </el-menu-item>

          <div v-if="!collapsed" class="menu-group-title">系统管理</div>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/audit">
            <el-icon><Document /></el-icon>
            <template #title>操作日志</template>
          </el-menu-item>
          <el-menu-item index="/admin/settings">
            <el-icon><Setting /></el-icon>
            <template #title>系统设置</template>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
      <div class="aside-footer">
        <span v-if="!collapsed">Lovewall v1.1.0</span>
        <span v-else>v1.1</span>
      </div>
    </el-aside>

    <el-container class="admin-main-container">
      <!-- 顶栏 -->
      <el-header class="admin-header" height="56px">
        <div class="header-left">
          <button class="collapse-btn" :title="collapsed ? '展开菜单' : '收起菜单'" @click="collapsed = !collapsed">
            <el-icon :size="18"><Expand v-if="collapsed" /><Fold v-else /></el-icon>
          </button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <ThemeToggle />
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
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="front">返回前台</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="admin-main">
        <div class="page-head">
          <div class="page-title">{{ route.meta.title || '仪表盘' }}</div>
          <div v-if="route.meta.desc" class="page-desc">{{ route.meta.desc }}</div>
        </div>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const collapsed = ref(false)

function onCommand(cmd) {
  if (cmd === 'logout') {
    auth.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } else if (cmd === 'front') {
    router.push('/')
  } else if (cmd === 'profile') {
    router.push('/profile')
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
  background: #141a24;
  transition: width 0.25s ease;
  overflow: hidden;
}
html.dark .admin-aside {
  background: #14161c;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  height: 56px;
  box-sizing: border-box;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
  white-space: nowrap;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.collapsed .logo {
  justify-content: center;
  padding: 16px 0;
}
.logo-icon {
  font-size: 20px;
  flex-shrink: 0;
}
.menu-scroll {
  flex: 1;
}
.admin-aside :deep(.el-menu) {
  border-right: none;
  padding: 6px 8px;
}
.menu-group-title {
  padding: 14px 12px 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 0.12em;
}
.admin-aside :deep(.el-menu-item) {
  border-radius: 8px;
  margin-bottom: 2px;
  height: 44px;
}
.admin-aside :deep(.el-menu-item.is-active) {
  background: var(--love-pink) !important;
  color: #fff !important;
}
.admin-aside :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.08);
}
.admin-aside :deep(.el-menu--collapse .el-menu-item) {
  padding: 0 16px;
}
.aside-footer {
  padding: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.admin-main-container {
  flex-direction: column;
  min-width: 0;
}
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  box-shadow: 0 1px 4px var(--card-shadow);
  z-index: 5;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 4px;
}
.collapse-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
  transition: background 0.2s;
}
.collapse-btn:hover {
  background: var(--love-pink-light);
  color: var(--love-pink);
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
  color: var(--text-1);
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
  background: var(--surface-2);
  padding: 20px 22px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.page-head {
  margin-bottom: 18px;
}
.page-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--text-1);
  line-height: 1.4;
}
.page-desc {
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-3);
}
@media (max-width: 768px) {
  .hide-sm {
    display: none;
  }
  .admin-aside {
    position: fixed;
    z-index: 20;
    height: 100%;
  }
  .admin-main {
    padding: 14px;
  }
}
</style>
