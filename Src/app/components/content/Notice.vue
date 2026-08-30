<script setup lang="ts">
/**
 * FR-12：MDC callout。用法：
 *
 * ::notice{type="danger" icon="lock"}
 * **標題**
 *
 * 內文
 * ::
 *
 * 樣式（.notice / .notice-info / .notice-warning / .notice-danger）
 * 已存在於 style.css，本元件只負責結構與圖示顏色。
 */
const props = withDefaults(
  defineProps<{
    type?: 'info' | 'warning' | 'danger'
    icon?: string
  }>(),
  { type: 'info', icon: 'check' },
)

const ICON_COLOR = {
  info: 'text-brand',
  warning: 'text-amber-500',
  danger: 'text-red-500',
} as const

const iconClass = computed(
  () => `icon icon--${props.icon} ${ICON_COLOR[props.type]} shrink-0 mt-1`,
)
</script>

<template>
  <div :class="['notice', `notice-${type}`]">
    <span :class="iconClass" aria-hidden="true" />
    <div class="notice-body">
      <slot />
    </div>
  </div>
</template>
