<template>
  <div
    :id="'card-' + confession.id"
    class="confession-card"
    :class="{ liked, highlight: highlighted }"
    :style="cardStyle"
  >
    <span class="pin" :style="{ background: color.header }"></span>
    <span v-if="confession.pinned" class="pinned-badge">📌 置顶</span>

    <div class="card-to" :style="{ color: color.header }">To：{{ confession.to }}</div>
    <p class="card-content">{{ confession.content }}</p>

    <div v-if="confession.images && confession.images.length" class="card-images" :class="'n-' + Math.min(confession.images.length, 3)">
      <el-image
        v-for="(img, i) in confession.images"
        :key="i"
        :src="img"
        fit="cover"
        class="card-img"
        :preview-src-list="confession.images"
        :initial-index="i"
        preview-teleported
        lazy
      />
    </div>

    <div class="card-meta">
      <span class="from">—— {{ confession.from }}</span>
      <span class="time">{{ timeAgo(confession.createdAt) }}</span>
    </div>

    <div class="card-actions">
      <div class="action like-btn" :class="{ active: liked }" @click="onLike">
        <span class="heart-icon" :class="{ 'heart-pop': animating }">❤</span>
        <span>{{ confession.likeCount ?? confession.likes?.length ?? 0 }}</span>
        <span
          v-for="p in particles"
          :key="p.id"
          class="particle"
          :style="p.style"
        >❤</span>
      </div>
      <div class="action" :class="{ active: showComments }" @click="showComments = !showComments">
        <span>💬</span>
        <span>{{ confession.commentCount ?? confession.comments?.length ?? 0 }}</span>
      </div>
      <div class="action" title="分享" @click="$emit('share', confession)">
        <span>🔗</span>
      </div>
    </div>

    <CommentPanel v-if="showComments" :confession="confession" @need-login="$emit('open-login')" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useWallStore } from '@/stores/wall'
import { useThemeStore } from '@/stores/theme'
import { timeAgo } from '@/utils/format'
import { colorOf } from '@/constants/colors'
import CommentPanel from './CommentPanel.vue'

const props = defineProps({
  confession: { type: Object, required: true },
  index: { type: Number, default: 0 },
  highlighted: { type: Boolean, default: false }
})
defineEmits(['open-login', 'share'])

const wall = useWallStore()
const theme = useThemeStore()

const color = computed(() => colorOf(props.confession.color))
const liked = computed(() => wall.hasLiked(props.confession))
const showComments = ref(false)
const animating = ref(false)
const particles = ref([])
let particleId = 0

// 便签轻微旋转，营造贴纸墙效果；暗色模式使用便签深色变体
const cardStyle = computed(() => {
  const rot = ((props.index % 3) - 1) * 1.1
  return {
    background: theme.isDark ? color.value.darkBg : color.value.bg,
    borderColor: color.value.header + '55',
    '--rot': rot + 'deg'
  }
})

async function onLike() {
  try {
    const nowLiked = await wall.toggleLike(props.confession.id)
    if (nowLiked) {
      animating.value = true
      setTimeout(() => (animating.value = false), 420)
      spawnParticles()
    }
  } catch (e) {
    ElMessage.warning(e.message)
  }
}

function spawnParticles() {
  const list = []
  for (let i = 0; i < 6; i++) {
    list.push({
      id: particleId++,
      style: {
        '--dx': Math.random() * 44 - 22 + 'px',
        animationDuration: 0.6 + Math.random() * 0.4 + 's',
        animationDelay: Math.random() * 0.15 + 's',
        fontSize: 10 + Math.random() * 10 + 'px'
      }
    })
  }
  particles.value.push(...list)
  setTimeout(() => {
    particles.value = particles.value.filter((p) => !list.includes(p))
  }, 1200)
}
</script>

<style scoped>
.confession-card {
  position: relative;
  border: 1px solid;
  border-radius: 14px;
  padding: 18px 16px 14px;
  box-shadow: 0 4px 14px rgba(245, 108, 108, 0.08);
  transform: rotate(var(--rot));
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  overflow: visible;
  display: flex;
  flex-direction: column;
}
.confession-card:hover {
  transform: rotate(0deg) translateY(-4px);
  box-shadow: 0 10px 24px rgba(245, 108, 108, 0.16);
  z-index: 2;
}
.confession-card.highlight {
  animation: highlight-pulse 1.1s ease-in-out 3;
  border-color: var(--hero-title);
  z-index: 3;
}
@keyframes highlight-pulse {
  0%,
  100% {
    box-shadow: 0 4px 14px var(--card-shadow);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(201, 79, 109, 0.35);
    transform: rotate(0deg) scale(1.02);
  }
}
.pin {
  position: absolute;
  top: -7px;
  left: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
.pinned-badge {
  position: absolute;
  top: -10px;
  left: 12px;
  padding: 2px 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f56c6c, #e05c7e);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.4);
  z-index: 2;
}
.card-to {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-content {
  flex: 1;
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: var(--text-1);
  word-break: break-all;
  white-space: pre-wrap;
}
.card-images {
  display: grid;
  gap: 6px;
  margin-top: 10px;
}
.card-images.n-1 {
  grid-template-columns: 1fr;
}
.card-images.n-2,
.card-images.n-3 {
  grid-template-columns: repeat(3, 1fr);
}
.card-images.n-1 .card-img {
  height: 170px;
}
.card-img {
  width: 100%;
  height: 92px;
  border-radius: 8px;
  cursor: zoom-in;
}
.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-3);
}
.from {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.time {
  flex-shrink: 0;
}
.card-actions {
  display: flex;
  gap: 14px;
  margin-top: 10px;
}
.action {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--text-3);
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}
.action:hover {
  color: #f56c6c;
}
.action.active {
  color: #f56c6c;
}
.like-btn {
  position: relative;
}
.heart-icon {
  font-size: 15px;
  line-height: 1;
  display: inline-block;
}
.like-btn.active .heart-icon {
  color: #f56c6c;
}
.particle {
  position: absolute;
  left: 8px;
  bottom: 100%;
  pointer-events: none;
  animation: particle-up ease-out forwards;
}
@media (max-width: 480px) {
  .card-images.n-2,
  .card-images.n-3 {
    grid-template-columns: 1fr 1fr;
  }
  .card-images.n-1 .card-img {
    height: 140px;
  }
  .card-img {
    height: 80px;
  }
}
</style>