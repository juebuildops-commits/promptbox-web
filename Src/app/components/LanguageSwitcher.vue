<script setup lang="ts">
/**
 * F3：導覽列的「切換語言」鈕，階段一保留外觀但沒有行為，本階段接上。
 *
 * 用 `switchLocalePath()` 產生**同一頁的另一語版本**網址，而不是一律回首頁 ——
 * 讀到定價頁一半才想換語言的人，應該留在定價頁。
 *
 * 只有一個語系時整顆按鈕不渲染（ja 還沒出貨前這裡是兩個選項）。
 */
withDefaults(
  defineProps<{
    /** 行動版選單裡改為攤平的橫列，不用下拉 */
    variant?: 'button' | 'inline'
  }>(),
  { variant: 'button' },
)

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const available = computed(() => locales.value.filter(l => typeof l !== 'string'))

const open = ref(false)
const root = ref<HTMLElement | null>(null)

// 點外面關閉。用捕獲期監聽，避免下拉裡的連結先被 router 攔走而漏掉關閉。
function onDocumentPointerDown(e: Event) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}
onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown, true))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown, true))
</script>

<template>
  <div v-if="available.length > 1 && variant === 'inline'" class="flex items-center gap-2">
    <NuxtLink
      v-for="l in available"
      :key="l.code"
      :to="switchLocalePath(l.code)"
      :class="[
        'px-3 py-2 rounded-sm text-sm transition-colors duration-150',
        l.code === locale
          ? 'bg-brand-surface text-brand font-bold'
          : 'text-ink-700 hover:bg-brand-surface hover:text-brand font-medium',
      ]"
      :aria-current="l.code === locale ? 'true' : undefined"
    >
      {{ l.name }}
    </NuxtLink>
  </div>

  <div v-else-if="available.length > 1" ref="root" class="relative">
    <button
      class="w-[45px] h-[45px] rounded-sm text-ink-800 flex items-center justify-center hover:bg-brand-surface hover:text-brand transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
      type="button"
      :aria-label="$t('common.a11y.switchLang')"
      :aria-expanded="open ? 'true' : 'false'"
      aria-haspopup="menu"
      @click="open = !open"
    >
      <span class="icon icon--lang" aria-hidden="true" />
    </button>

    <div
      v-show="open"
      class="absolute right-0 top-full mt-2 min-w-[160px] p-1.5 bg-surface-card border border-line-300 rounded-lg shadow-xl z-50 flex flex-col gap-0.5"
      role="menu"
    >
      <NuxtLink
        v-for="l in available"
        :key="l.code"
        :to="switchLocalePath(l.code)"
        :class="[
          'px-3.5 py-2.5 rounded-sm text-base whitespace-nowrap transition-colors duration-150',
          l.code === locale
            ? 'bg-brand-surface text-brand font-bold'
            : 'text-ink-800 hover:bg-brand-surface hover:text-brand font-medium',
        ]"
        role="menuitem"
        :aria-current="l.code === locale ? 'true' : undefined"
        @click="open = false"
      >
        {{ l.name }}
      </NuxtLink>
    </div>
  </div>
</template>
