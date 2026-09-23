<template>
  <canvas
    ref="canvasRef"
    class="captcha-canvas"
    width="120"
    height="40"
    title="看不清？点击刷新"
    @click="refresh"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  length: { type: Number, default: 4 }
})

const canvasRef = ref()
let code = ''

// 去掉易混淆字符（0/O、1/I/l）
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const BG_COLORS = ['#f2f4f7', '#fdf0f0', '#eef6ff', '#f0f9eb', '#f5efff']
const FG_COLORS = ['#303133', '#c94f6d', '#5a9cf8', '#4faf7d', '#9370db', '#f08c3a']

function randomCode() {
  code = ''
  for (let i = 0; i < props.length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  randomCode()

  // 背景
  ctx.fillStyle = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)]
  ctx.fillRect(0, 0, w, h)

  // 干扰线
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = FG_COLORS[Math.floor(Math.random() * FG_COLORS.length)]
    ctx.globalAlpha = 0.45
    ctx.beginPath()
    ctx.moveTo(Math.random() * w, Math.random() * h)
    ctx.lineTo(Math.random() * w, Math.random() * h)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // 字符
  const charW = (w - 20) / code.length
  code.split('').forEach((ch, i) => {
    ctx.save()
    ctx.translate(12 + i * charW + charW / 2, h / 2)
    ctx.rotate((Math.random() - 0.5) * 0.5)
    ctx.font = `bold ${20 + Math.random() * 4}px Arial`
    ctx.fillStyle = FG_COLORS[Math.floor(Math.random() * FG_COLORS.length)]
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ch, 0, 0)
    ctx.restore()
  })

  // 噪点
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  for (let i = 0; i < 24; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.6, 1.6)
  }
}

function refresh() {
  draw()
}

/**
 * 校验用户输入（不区分大小写）
 */
function verify(input) {
  return String(input || '').trim().toUpperCase() === code
}

defineExpose({ refresh, verify })

onMounted(draw)
</script>

<style scoped>
.captcha-canvas {
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  flex-shrink: 0;
}
</style>
