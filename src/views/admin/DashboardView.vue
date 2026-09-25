<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col v-for="s in statCards" :key="s.label" :xs="12" :sm="12" :md="6">
        <div class="stat-card fade-in-up">
          <div class="stat-top">
            <div class="icon-wrap" :style="{ background: s.bg, color: s.color }">
              <el-icon :size="20"><component :is="s.icon" /></el-icon>
            </div>
            <span v-if="s.today > 0" class="stat-trend" :style="{ color: s.color, background: s.bg }">
              今日 +{{ s.today }}
            </span>
          </div>
          <div class="info">
            <div class="num">{{ s.value }}</div>
            <div class="label">{{ s.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 趋势图 + 快捷操作 -->
    <el-row :gutter="16" class="mt">
      <el-col :xs="24" :md="16">
        <el-card shadow="never" class="panel">
          <template #header>
            <div class="panel-title">
              <el-icon><TrendCharts /></el-icon>近 7 日发布趋势
              <span class="legend">
                <i class="dot" style="background: var(--love-pink)"></i>表白
                <i class="dot" style="background: #5a9cf8"></i>评论
              </span>
            </div>
          </template>
          <div class="chart-wrap">
            <svg :viewBox="`0 0 ${W} ${H}`" class="trend-svg" preserveAspectRatio="none" role="img" aria-label="近 7 日表白与评论发布趋势折线图">
              <!-- 网格线 -->
              <line v-for="g in gridYs" :key="g" x1="34" :x2="W - 6" :y1="g" :y2="g" class="grid-line" />
              <!-- 纵轴刻度 -->
              <text v-for="(g, i) in gridYs" :key="'t' + i" x="28" :y="g + 4" class="axis-text">{{ yTicks[i] }}</text>
              <!-- 表白折线 -->
              <polyline :points="postPoints" class="line line-post" />
              <circle v-for="(p, i) in postDots" :key="'pd' + i" :cx="p.x" :cy="p.y" r="3.5" class="dot-post" />
              <!-- 评论折线 -->
              <polyline :points="commentPoints" class="line line-comment" />
              <circle v-for="(p, i) in commentDots" :key="'cd' + i" :cx="p.x" :cy="p.y" r="3.5" class="dot-comment" />
            </svg>
            <div class="x-labels">
              <span v-for="d in trend" :key="d.label">{{ d.label }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 快捷操作 + 系统状态 -->
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="panel">
          <template #header>
            <div class="panel-title"><el-icon><Promotion /></el-icon>快捷操作</div>
          </template>
          <div class="quick-grid">
            <button v-for="q in quicks" :key="q.label" class="quick-btn" @click="q.run">
              <el-icon :size="20" :style="{ color: q.color }"><component :is="q.icon" /></el-icon>
              <span>{{ q.label }}</span>
            </button>
          </div>
        </el-card>

        <el-card shadow="never" class="panel mt-sm">
          <template #header>
            <div class="panel-title"><el-icon><Monitor /></el-icon>系统状态</div>
          </template>
          <div class="sys-row">
            <span>置顶表白</span>
            <b>{{ wall.pinnedCount }} / 3</b>
          </div>
          <div class="sys-row">
            <span>隐藏表白</span>
            <b>{{ hiddenCount }}</b>
          </div>
          <div class="sys-row">
            <span>封禁用户</span>
            <b>{{ bannedCount }}</b>
          </div>
          <div class="sys-row">
            <span>邮箱验证</span>
            <b :class="settings.emailVerificationEnabled ? 'on' : 'off'">
              {{ settings.emailVerificationEnabled ? '已开启' : '已关闭' }}
            </b>
          </div>
          <div class="sys-row">
            <span>敏感词过滤</span>
            <b :class="settings.sensitiveFilterEnabled ? 'on' : 'off'">
              {{ settings.sensitiveFilterEnabled ? '已开启' : '已关闭' }}
            </b>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mt">
      <!-- 点赞 Top5 -->
      <el-col :xs="24" :md="14">
        <el-card shadow="never" class="panel">
          <template #header>
            <div class="panel-title"><el-icon><Trophy /></el-icon>点赞 Top 5 表白</div>
          </template>
          <div v-for="(c, i) in top5" :key="c.id" class="bar-row">
            <div class="bar-name" :title="c.to">
              <span class="rank" :class="'r' + (i + 1)">{{ i + 1 }}</span>
              {{ c.to }}
            </div>
            <div class="bar-track">
              <div class="bar" :style="{ width: barWidth(c), background: colorOf(c.color).header }"></div>
            </div>
            <div class="bar-count">{{ c.likes.length }} 赞</div>
          </div>
          <el-empty v-if="!top5.length" description="暂无数据" :image-size="60" />
        </el-card>
      </el-col>

      <!-- 便签颜色分布 + 最新动态 -->
      <el-col :xs="24" :md="10">
        <el-card shadow="never" class="panel">
          <template #header>
            <div class="panel-title"><el-icon><PieChart /></el-icon>便签颜色分布</div>
          </template>
          <div v-for="c in colorStats" :key="c.key" class="color-row">
            <span class="color-label">
              <i class="dot" :style="{ background: c.header }"></i>{{ c.label }}
            </span>
            <el-progress
              :percentage="c.percent"
              :color="c.header"
              :stroke-width="10"
              class="color-progress"
            />
            <span class="color-count">{{ c.count }}</span>
          </div>
        </el-card>

        <el-card shadow="never" class="panel mt-sm">
          <template #header>
            <div class="panel-title"><el-icon><Bell /></el-icon>最新表白动态</div>
          </template>
          <div v-for="c in latest5" :key="c.id" class="feed-row">
            <span class="feed-dot" :style="{ background: colorOf(c.color).header }"></span>
            <div class="feed-content">
              <div class="text-ellipsis-2">{{ c.from }} → {{ c.to }}：{{ c.content }}</div>
              <div class="feed-time">{{ timeAgo(c.createdAt) }}</div>
            </div>
          </div>
          <el-empty v-if="!latest5.length" description="暂无数据" :image-size="60" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWallStore } from '@/stores/wall'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { WALL_COLORS, colorOf } from '@/constants/colors'
import { timeAgo } from '@/utils/format'

const wall = useWallStore()
const auth = useAuthStore()
const settings = useSettingsStore()
const router = useRouter()
wall.init()
auth.init()
settings.init()

const DAY = 24 * 60 * 60 * 1000

/** 今日零点起的新增数量 */
function todayCount(list, field) {
  const start = new Date().setHours(0, 0, 0, 0)
  return list.filter((x) => x[field] >= start).length
}

const statCards = computed(() => [
  {
    label: '表白总数', value: wall.totalConfessions, today: todayCount(wall.confessions, 'createdAt'),
    icon: 'ChatDotRound', color: '#f56c6c', bg: 'rgba(245, 108, 108, 0.12)'
  },
  {
    label: '累计点赞', value: wall.totalLikes, today: todayLikes(),
    icon: 'Star', color: '#e6a23c', bg: 'rgba(230, 162, 60, 0.12)'
  },
  {
    label: '累计评论', value: wall.totalComments, today: todayComments(),
    icon: 'Comment', color: '#409eff', bg: 'rgba(64, 158, 255, 0.12)'
  },
  {
    label: '注册用户', value: auth.users.length, today: todayCount(auth.users, 'createdAt'),
    icon: 'User', color: '#67c23a', bg: 'rgba(103, 194, 58, 0.12)'
  }
])

/** 点赞无独立时间戳，近似取当日有活动的表白点赞增长（Mock 简化：跳过历史） */
function todayLikes() {
  return 0
}
function todayComments() {
  return todayCount(wall.allComments, 'createdAt')
}

/* ===== 近 7 日趋势（SVG 折线）===== */
const W = 560
const H = 200
const PAD_X = 40
const PAD_TOP = 16
const PAD_BOTTOM = 14

const trend = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const day = new Date(Date.now() - i * DAY)
    const start = new Date(day).setHours(0, 0, 0, 0)
    const end = start + DAY
    const posts = wall.confessions.filter((c) => c.createdAt >= start && c.createdAt < end).length
    const comments = wall.allComments.filter((c) => c.createdAt >= start && c.createdAt < end).length
    days.push({
      label: `${day.getMonth() + 1}/${day.getDate()}`,
      posts,
      comments
    })
  }
  return days
})

const maxVal = computed(() => Math.max(4, ...trend.value.flatMap((d) => [d.posts, d.comments])))
const yTicks = computed(() => {
  const m = maxVal.value
  return [m, Math.round(m * 0.5), 0]
})
const gridYs = computed(() =>
  yTicks.value.map((_, i) => PAD_TOP + ((H - PAD_TOP - PAD_BOTTOM) * i) / 2)
)

function toPoints(field) {
  const n = trend.value.length
  const stepX = (W - PAD_X - 10) / (n - 1)
  const usableH = H - PAD_TOP - PAD_BOTTOM
  return trend.value.map((d, i) => ({
    x: PAD_X + i * stepX,
    y: PAD_TOP + usableH - (d[field] / maxVal.value) * usableH
  }))
}

const postPoints = computed(() => toPoints('posts').map((p) => `${p.x},${p.y}`).join(' '))
const commentPoints = computed(() => toPoints('comments').map((p) => `${p.x},${p.y}`).join(' '))
const postDots = computed(() => toPoints('posts'))
const commentDots = computed(() => toPoints('comments'))

/* ===== 快捷操作 ===== */
const quicks = [
  { label: '表白管理', icon: 'ChatDotRound', color: '#f56c6c', run: () => router.push('/admin/confessions') },
  { label: '评论管理', icon: 'Comment', color: '#409eff', run: () => router.push('/admin/comments') },
  { label: '用户管理', icon: 'User', color: '#67c23a', run: () => router.push('/admin/users') },
  { label: '系统设置', icon: 'Setting', color: '#e6a23c', run: () => router.push('/admin/settings') },
  { label: '操作日志', icon: 'Document', color: '#9370db', run: () => router.push('/admin/audit') },
  { label: '查看前台', icon: 'House', color: '#f08c3a', run: () => router.push('/') }
]

/* ===== 其余面板 ===== */
const top5 = computed(() => wall.topLiked.slice(0, 5))
const latest5 = computed(() =>
  wall.confessions.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)
)
const hiddenCount = computed(() => wall.confessions.filter((c) => c.status === 'hidden').length)
const bannedCount = computed(() => auth.users.filter((u) => u.status === 'banned').length)

const colorStats = computed(() => {
  const total = wall.totalConfessions || 1
  return WALL_COLORS.map((c) => {
    const count = wall.confessions.filter((x) => x.color === c.key).length
    return { ...c, count, percent: Math.round((count / total) * 100) }
  })
})

function barWidth(c) {
  const max = top5.value[0]?.likes.length || 1
  return Math.max(8, Math.round((c.likes.length / max) * 100)) + '%'
}
</script>

<style scoped>
.mt {
  margin-top: 16px;
}
.mt-sm {
  margin-top: 14px;
}
.stat-card {
  background: var(--surface);
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px var(--card-shadow);
  margin-bottom: 16px;
}
.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-trend {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
}
.num {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-1);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.label {
  font-size: 13px;
  color: var(--text-3);
  margin-top: 2px;
}
.panel {
  border-radius: 12px;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: var(--text-1);
}
.legend {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 400;
  color: var(--text-3);
}
.legend .dot,
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.chart-wrap {
  padding: 4px 0 0;
}
.trend-svg {
  width: 100%;
  height: 200px;
  display: block;
}
.grid-line {
  stroke: var(--border-soft);
  stroke-width: 1;
  stroke-dasharray: 4 4;
}
.axis-text {
  font-size: 10px;
  fill: var(--text-4);
  text-anchor: end;
}
.line {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.line-post {
  stroke: var(--love-pink);
}
.line-comment {
  stroke: #5a9cf8;
}
.dot-post {
  fill: var(--love-pink);
  stroke: var(--surface);
  stroke-width: 1.5;
}
.dot-comment {
  fill: #5a9cf8;
  stroke: var(--surface);
  stroke-width: 1.5;
}
.x-labels {
  display: flex;
  justify-content: space-between;
  padding: 6px 0 0 34px;
  font-size: 11px;
  color: var(--text-4);
}
.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text-2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.quick-btn:hover {
  border-color: var(--love-pink);
  color: var(--love-pink);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--card-shadow-hover);
}
.sys-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 0;
  font-size: 13px;
  color: var(--text-2);
  border-bottom: 1px dashed var(--border-soft);
}
.sys-row:last-child {
  border-bottom: none;
}
.sys-row b {
  color: var(--text-1);
  font-weight: 600;
}
.sys-row b.on {
  color: var(--chart-positive, #67c23a);
}
.sys-row b.off {
  color: var(--text-4);
  font-weight: 400;
}
.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.bar-name {
  width: 130px;
  font-size: 13px;
  color: var(--text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.rank {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: var(--surface-2);
  color: var(--text-3);
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rank.r1 {
  background: #f56c6c;
  color: #fff;
}
.rank.r2 {
  background: #e6a23c;
  color: #fff;
}
.rank.r3 {
  background: #f0c26a;
  color: #fff;
}
.bar-track {
  flex: 1;
  height: 12px;
  background: var(--surface-2);
  border-radius: 6px;
  overflow: hidden;
}
.bar {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s ease;
}
.bar-count {
  width: 44px;
  text-align: right;
  font-size: 12px;
  color: var(--text-3);
  flex-shrink: 0;
}
.color-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.color-label {
  width: 76px;
  font-size: 13px;
  color: var(--text-2);
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}
.color-progress {
  flex: 1;
}
.color-count {
  width: 30px;
  text-align: right;
  font-size: 12px;
  color: var(--text-3);
}
.feed-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}
.feed-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}
.feed-content {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.6;
}
.feed-time {
  font-size: 12px;
  color: var(--text-4);
  margin-top: 2px;
}
</style>
