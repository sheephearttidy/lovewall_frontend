<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col v-for="s in statCards" :key="s.label" :xs="12" :sm="12" :md="6">
        <div class="stat-card fade-in-up">
          <div class="icon-wrap" :style="{ background: s.bg, color: s.color }">
            <el-icon :size="22"><component :is="s.icon" /></el-icon>
          </div>
          <div class="info">
            <div class="num">{{ s.value }}</div>
            <div class="label">{{ s.label }}</div>
          </div>
        </div>
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

        <el-card shadow="never" class="panel mt">
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
import { useWallStore } from '@/stores/wall'
import { useAuthStore } from '@/stores/auth'
import { WALL_COLORS, colorOf } from '@/constants/colors'
import { timeAgo } from '@/utils/format'

const wall = useWallStore()
const auth = useAuthStore()
wall.init()
auth.init()

const statCards = computed(() => [
  { label: '表白总数', value: wall.totalConfessions, icon: 'ChatDotRound', color: '#f56c6c', bg: '#fef0f0' },
  { label: '累计点赞', value: wall.totalLikes, icon: 'Star', color: '#e6a23c', bg: '#fdf6ec' },
  { label: '累计评论', value: wall.totalComments, icon: 'Comment', color: '#409eff', bg: '#ecf5ff' },
  { label: '注册用户', value: auth.users.length, icon: 'User', color: '#67c23a', bg: '#f0f9eb' }
])

const top5 = computed(() => wall.topLiked.slice(0, 5))
const latest5 = computed(() =>
  wall.confessions.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)
)

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
.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--surface);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px var(--card-shadow);
  margin-bottom: 16px;
}
.icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.num {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-1);
  line-height: 1.2;
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
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
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
