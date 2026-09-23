<template>
  <div class="floating-hearts" aria-hidden="true">
    <span v-for="h in hearts" :key="h.id" class="fh" :style="h.style">❤</span>
  </div>
</template>

<script setup>
const COLORS = ['#ffb3c6', '#ff8fab', '#fb6f92', '#ffc8dd', '#cdb4db', '#a2d2ff', '#bde0fe']
const COUNT = 16

const hearts = Array.from({ length: COUNT }, (_, i) => {
  const size = 14 + Math.random() * 22
  const dur = 11 + Math.random() * 14
  const delay = -Math.random() * dur
  return {
    id: i,
    style: {
      left: Math.random() * 100 + 'vw',
      fontSize: size + 'px',
      color: COLORS[i % COLORS.length],
      animationDuration: dur + 's',
      animationDelay: delay + 's',
      '--s': (size / 20).toFixed(2)
    }
  }
})
</script>

<style scoped>
.floating-hearts {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}
.fh {
  position: absolute;
  top: 0;
  animation: bg-float linear infinite;
}
</style>
