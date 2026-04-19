<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="heatmap-tooltip"
      :style="{ top: `${position.y + 12}px`, left: `${position.x + 12}px` }"
      role="tooltip"
    >
      <span class="heatmap-tooltip__date">{{ formattedDate }}</span>
      <span class="heatmap-tooltip__rate">
        {{ achievementRate === null ? '기록 없음' : `달성률: ${achievementRate}%` }}
      </span>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  date: string
  achievementRate: number | null
  visible: boolean
  position: { x: number; y: number }
}>()

const formattedDate = computed(() => {
  if (!props.date) return ''
  const [y, m, d] = props.date.split('-')
  return `${y}년 ${Number(m)}월 ${Number(d)}일`
})
</script>

<style lang="scss">
.heatmap-tooltip {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 10px;
  background: var(--color-primary);
  color: var(--color-bg);
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  pointer-events: none;
  white-space: nowrap;

  &__date {
    font-weight: 600;
  }

  &__rate {
    opacity: 0.85;
  }
}
</style>
