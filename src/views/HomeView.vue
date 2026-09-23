<template>
  <div class="home-page">
    <FloatingHearts />

    <!-- 顶部导航 -->
    <nav class="topbar">
      <div class="brand">💌 Lovewall</div>
      <div class="right">
        <template v-if="auth.isLoggedIn">
          <el-button v-if="auth.isAdmin" text @click="router.push('/admin')">
            <el-icon><Setting /></el-icon>管理后台
          </el-button>
          <el-dropdown>
            <span class="user-chip">
              <span class="avatar" :style="{ background: auth.currentUser.avatarColor }">
                {{ auth.currentUser.nickname.slice(0, 1) }}
              </span>
              {{ auth.currentUser.nickname }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openPost">发布表白</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button text @click="router.push('/login')">登录</el-button>
          <el-button type="primary" round @click="router.push('/register')">注册</el-button>
        </template>
      </div>
    </nav>

    <!-- Hero 区 -->
    <header class="hero">
      <div class="hero-inner fade-in-up">
        <h1>把藏在心底的话<br />大声说出来</h1>
        <p class="slogan">Lovewall 表白墙 · 每一条便签，都是一次心跳</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" round @click="openPost">
            <el-icon class="btn-icon"><EditPen /></el-icon>写下我的表白
          </el-button>
          <el-button size="large" round plain @click="scrollToWall">看看大家的心声</el-button>
        </div>
        <div class="hero-stats">
          <div class="stat"><b>{{ wall.visible.length }}</b><span>条表白</span></div>
          <div class="stat"><b>{{ wall.totalLikes }}</b><span>次心动</span></div>
          <div class="stat"><b>{{ wall.totalComments }}</b><span>条回应</span></div>
        </div>
      </div>
    </header>

    <!-- 表白墙主体 -->
    <main ref="wallRef" class="wall-section">
      <div class="toolbar">
        <el-input
          v-model="keyword"
          class="search-input"
          placeholder="搜索表白内容 / 收件人 / 署名"
          clearable
          :prefix-icon="Search"
        />
        <el-radio-group v-model="sortBy">
          <el-radio-button value="latest">最新</el-radio-button>
          <el-radio-button value="hot">最热</el-radio-button>
        </el-radio-group>
        <div class="color-chips">
          <button class="chip" :class="{ active: activeColor === '' }" @click="activeColor = ''">全部</button>
          <button
            v-for="c in WALL_COLORS"
            :key="c.key"
            class="chip"
            :class="{ active: activeColor === c.key }"
            @click="activeColor = activeColor === c.key ? '' : c.key"
          >
            <i class="dot" :style="{ background: c.header }"></i>{{ c.label }}
          </button>
        </div>
      </div>

      <div v-if="filtered.length" class="card-grid">
        <ConfessionCard
          v-for="(c, i) in filtered"
          :key="c.id"
          :confession="c"
          :index="i"
          @open-login="goLogin"
        />
      </div>
      <el-empty v-else description="暂无符合条件的表白，快来写下第一条吧～" />

      <button class="fab" title="发布表白" @click="openPost">＋</button>
    </main>

    <footer class="footer">Lovewall · 用爱发电 · Made with 💗</footer>

    <PostDialog v-model="postVisible" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useWallStore } from '@/stores/wall'
import { WALL_COLORS } from '@/constants/colors'
import FloatingHearts from '@/components/FloatingHearts.vue'
import ConfessionCard from '@/components/ConfessionCard.vue'
import PostDialog from '@/components/PostDialog.vue'

const router = useRouter()
const auth = useAuthStore()
const wall = useWallStore()
wall.init()

const keyword = ref('')
const sortBy = ref('latest')
const activeColor = ref('')
const postVisible = ref(false)
const wallRef = ref()

const filtered = computed(() => {
  let list = wall.visible
  const kw = keyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(
      (c) =>
        c.content.toLowerCase().includes(kw) ||
        c.to.toLowerCase().includes(kw) ||
        c.from.toLowerCase().includes(kw)
    )
  }
  if (activeColor.value) {
    list = list.filter((c) => c.color === activeColor.value)
  }
  if (sortBy.value === 'hot') {
    return [...list].sort((a, b) => b.likes.length - a.likes.length || b.createdAt - a.createdAt)
  }
  return list
})

function openPost() {
  if (!auth.isLoggedIn) {
    ElMessage.warning('请先登录后再发布表白')
    router.push('/login')
    return
  }
  postVisible.value = true
}

function goLogin() {
  ElMessage.warning('登录之后才能进行该操作哦')
  router.push('/login')
}

function logout() {
  auth.logout()
  ElMessage.success('已退出登录')
}

function scrollToWall() {
  wallRef.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.home-page {
  position: relative;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* 顶部导航 */
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 28px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
}
.brand {
  font-size: 20px;
  font-weight: 800;
  color: var(--love-pink);
}
.right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #303133;
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

/* Hero */
.hero {
  position: relative;
  padding: 72px 20px 56px;
  background: linear-gradient(135deg, #ffd6e0 0%, #fff5f7 55%, #e3f2ff 100%);
  text-align: center;
  z-index: 1;
}
.hero-inner h1 {
  margin: 0 0 14px;
  font-size: 42px;
  line-height: 1.35;
  color: #c94f6d;
  letter-spacing: 2px;
}
.slogan {
  margin: 0 0 26px;
  color: #8d6e77;
  font-size: 15px;
  letter-spacing: 1px;
}
.hero-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}
.btn-icon {
  margin-right: 4px;
}
.hero-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-top: 36px;
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat b {
  font-size: 26px;
  color: #e05c7e;
}
.stat span {
  font-size: 13px;
  color: #a08890;
}

/* 表白墙 */
.wall-section {
  position: relative;
  z-index: 1;
  flex: 1;
  width: min(1200px, 94%);
  margin: 0 auto;
  padding: 34px 0 80px;
}
.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 26px;
}
.search-input {
  width: 320px;
}
.color-chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #f0d5dc;
  border-radius: 16px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.chip:hover {
  border-color: var(--love-pink);
  color: var(--love-pink);
}
.chip.active {
  background: var(--love-pink);
  border-color: var(--love-pink);
  color: #fff;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 22px;
}

/* 移动端悬浮按钮 */
.fab {
  display: none;
  position: fixed;
  right: 22px;
  bottom: 30px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: var(--love-pink);
  color: #fff;
  font-size: 24px;
  box-shadow: 0 6px 18px rgba(245, 108, 108, 0.45);
  cursor: pointer;
  z-index: 9;
}

.footer {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 20px;
  color: #c4a9b0;
  font-size: 13px;
}

@media (max-width: 768px) {
  .hero-inner h1 {
    font-size: 30px;
  }
  .search-input {
    width: 100%;
  }
  .fab {
    display: block;
  }
}
</style>
