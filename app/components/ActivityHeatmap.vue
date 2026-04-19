<template>
  <div class="heatmap">
    <div class="heatmap__grid">
      <div
        v-for="cell in cells"
        :key="cell.date"
        class="heatmap__cell"
        :class="`heatmap__cell--level-${cell.level}`"
        :aria-label="`${cell.date} ${cell.achievementRate === null ? '기록 없음' : cell.achievementRate + '%'}`"
        @mouseenter="onEnter($event, cell)"
        @mouseleave="onLeave"
      />
    </div>

    <HeatmapTooltip
      :date="tooltip.date"
      :achievement-rate="tooltip.achievementRate"
      :visible="tooltip.visible"
      :position="tooltip.position"
    />
  </div>
</template>

<script setup lang="ts">
import type { HeatmapData } from '~/composables/useHeatmap'

const props = defineProps<{
  year: number
  month?: number
  data: HeatmapData
}>()

type Cell = {
  date: string
  level: 0 | 1 | 2 | 3 | 4
  achievementRate: number | null
}

const cells = computed<Cell[]>(() => {
  const result: Cell[] = []
  const start = props.month
    ? new Date(props.year, props.month - 1, 1)
    : new Date(props.year, 0, 1)
  const end = props.month
    ? new Date(props.year, props.month, 0)
    : new Date(props.year, 11, 31)

  const cur = new Date(start)
  while (cur <= end) {
    const dateStr = cur.toISOString().split('T')[0]
    const entry = props.data[dateStr]
    result.push({
      date: dateStr,
      level: entry?.level ?? 0,
      achievementRate: entry?.achievement_rate ?? null,
    })
    cur.setDate(cur.getDate() + 1)
  }
  return result
})

const tooltip = reactive({
  visible: false,
  date: '',
  achievementRate: null as number | null,
  position: { x: 0, y: 0 },
})

function onEnter(e: MouseEvent, cell: Cell) {
  tooltip.visible = true
  tooltip.date = cell.date
  tooltip.achievementRate = cell.achievementRate
  tooltip.position = { x: e.clientX, y: e.clientY }
}

function onLeave() {
  tooltip.visible = false
}
</script>

<style lang="scss">
.heatmap {
  display: inline-block;

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }

  &__cell {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    cursor: default;

    &--level-0 { background: var(--heatmap-0); }
    &--level-1 { background: var(--heatmap-1); }
    &--level-2 { background: var(--heatmap-2); }
    &--level-3 { background: var(--heatmap-3); }
    &--level-4 { background: var(--heatmap-4); }

    &:hover {
      outline: 1px solid var(--color-primary);
      outline-offset: 1px;
    }
  }
}
</style>
