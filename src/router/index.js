import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '表白墙' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/ForgotPasswordView.vue'),
    meta: { title: '找回密码' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: '仪表盘', desc: '站点运营数据总览与快捷入口', requiresAdmin: true }
      },
      {
        path: 'confessions',
        name: 'admin-confessions',
        component: () => import('@/views/admin/ConfessionManageView.vue'),
        meta: { title: '表白管理', desc: '审核、置顶、隐藏或删除站内表白内容', requiresAdmin: true }
      },
      {
        path: 'comments',
        name: 'admin-comments',
        component: () => import('@/views/admin/CommentManageView.vue'),
        meta: { title: '评论管理', desc: '巡查并处理违规评论与楼中楼回复', requiresAdmin: true }
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/UserManageView.vue'),
        meta: { title: '用户管理', desc: '管理站内用户、角色与账号状态', requiresAdmin: true }
      },
      {
        path: 'audit',
        name: 'admin-audit',
        component: () => import('@/views/admin/AuditLogView.vue'),
        meta: { title: '操作日志', desc: '管理员全部敏感操作的审计记录', requiresAdmin: true }
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: () => import('@/views/admin/SettingsView.vue'),
        meta: { title: '系统设置', desc: '全局功能开关与站点安全策略', requiresAdmin: true }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  auth.init()

  // 已登录用户访问登录/注册页 → 回首页
  if ((to.name === 'login' || to.name === 'register') && auth.isLoggedIn) {
    return { name: 'home' }
  }

  // 需要登录的页面
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // 管理后台权限守卫
  if (to.meta.requiresAdmin) {
    if (!auth.isLoggedIn) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (!auth.isAdmin) {
      ElMessage.error('您没有管理员权限')
      return { name: 'home' }
    }
  }

  document.title = to.meta.title ? `${to.meta.title} · Lovewall 表白墙` : 'Lovewall 表白墙'
})

export default router
