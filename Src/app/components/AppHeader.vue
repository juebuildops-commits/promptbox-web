<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** 額外掛在 <header> 上的 class（docs / changelog 為 pb-6） */
    headerClass?: string
    /** 右側主 CTA 目標。可為站內路徑、頁內錨點（#platforms）或外部網址 */
    ctaHref?: string
  }>(),
  { headerClass: '', ctaHref: '/download' },
)

const route = useRoute()
const { isDark, toggleTheme } = useTheme()
const localePath = useLocalePath()

const { locale } = useI18n()

// 🔴 `/demo` 只對 zh-TW 露出（webplan/模擬試用頁.md D5）：demo 本體的介面
//    只有繁體中文，對英文使用者露出等於把人送進一個看不懂的頁。
//    英文讀者仍能從首頁那一段的 CTA 進去 —— 那段的文案有寫明語言。
//    要對 en 開放＝把 demo-app/index.html 的文案抽出來翻，然後刪掉這個 filter。
//    ⚠️ 這裡是**唯一**的 NAV 來源，桌機與行動版選單共用，改一處兩邊都會動。
const NAV = computed(() => [
  { to: '/', key: 'common.nav.home' },
  ...(locale.value === 'zh-TW' ? [{ to: '/demo', key: 'common.nav.demo' }] : []),
  { to: '/download', key: 'common.nav.download' },
  { to: '/pricing', key: 'common.nav.pricing' },
  { to: '/docs', key: 'common.nav.docs' },
  { to: '/changelog', key: 'common.nav.changelog' },
])

const DESKTOP_ACTIVE
  = 'px-3.5 py-2.5 rounded-sm bg-brand-surface text-brand font-sans font-bold text-base leading-tight min-w-[92px] text-center transition-colors duration-150'
const DESKTOP_IDLE
  = 'px-3.5 py-2.5 rounded-sm text-ink-500 hover:bg-brand-surface hover:text-brand font-sans font-medium text-base leading-tight transition-colors duration-150'
const MOBILE_ACTIVE = 'px-4 py-3 rounded-sm bg-brand-surface text-brand font-bold text-base'
const MOBILE_IDLE
  = 'px-4 py-3 rounded-sm text-ink-800 hover:bg-brand-surface hover:text-brand font-medium text-base'

// 語系前綴之後 `route.path` 會是 `/en/pricing`，直接比對 `/pricing` 會全部不中。
// 一律拿 localePath() 產生的當前語系網址來比。
const isActive = (to: string) => route.path === localePath(to)

// 外部網址與頁內錨點都不是路由，套語系前綴會變成 /en/#platforms 這種壞網址
const ctaExternal = computed(() => /^(https?:|#)/.test(props.ctaHref))
const ctaTo = computed(() => (ctaExternal.value ? props.ctaHref : localePath(props.ctaHref)))

const menuOpen = ref(false)
</script>

<template>
  <header :class="['relative z-10 pt-6', headerClass]">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div
        class="flex items-center gap-6 py-5 px-10 bg-[var(--glass-nav)] border border-line-400 rounded-nav backdrop-blur-md max-xl:gap-4 max-xl:py-4 max-xl:px-6 max-lg:justify-between max-md:py-3 max-md:px-4 max-md:rounded-lg"
      >
        <!-- Logo -->
        <NuxtLink class="flex items-center gap-2.5 shrink-0 group" :to="localePath('/')" :aria-label="$t('common.a11y.homeLink')">
          <img
            class="w-10 h-10 object-contain rounded-lg group-hover:scale-105 transition-transform"
            src="/assets/icon.png"
            :alt="$t('common.a11y.logoAlt')"
            width="40"
            height="40"
          >
          <span class="font-ui font-bold text-2xl leading-tight -tracking-[0.025em] text-ink-800">PromptBox</span>
        </NuxtLink>

        <!-- 主導覽 -->
        <nav
          class="hidden lg:flex items-center justify-center gap-1.5 flex-1 max-xl:gap-0.5"
          :aria-label="$t('common.nav.ariaMain')"
        >
          <NuxtLink
            v-for="item in NAV"
            :key="item.to"
            :to="localePath(item.to)"
            :class="isActive(item.to) ? DESKTOP_ACTIVE : DESKTOP_IDLE"
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            {{ $t(item.key) }}
          </NuxtLink>
        </nav>

        <!-- 工具與下載按鈕 -->
        <div class="flex items-center gap-6 shrink-0 max-md:gap-2">
          <!-- F3：階段一是死鈕，本階段接上（LanguageSwitcher） -->
          <div class="max-md:hidden">
            <LanguageSwitcher />
          </div>
          <button
            class="w-[45px] h-[45px] rounded-sm text-ink-800 flex items-center justify-center hover:bg-brand-surface hover:text-brand transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 max-md:hidden"
            type="button"
            :aria-label="$t('common.a11y.toggleTheme')"
            :aria-pressed="isDark ? 'true' : 'false'"
            @click="toggleTheme"
          >
            <span class="icon icon--theme" aria-hidden="true" />
          </button>

          <a
            v-if="ctaExternal"
            class="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-sm font-sans font-medium text-lg leading-snug shadow-btn transition duration-150 active:translate-y-px"
            :href="ctaTo"
            target="_blank"
            rel="noopener"
          >
            <span class="icon icon--apple" aria-hidden="true" />
            <span>{{ $t('common.cta.download') }}</span>
          </a>
          <NuxtLink
            v-else
            class="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-sm font-sans font-medium text-lg leading-snug shadow-btn transition duration-150 active:translate-y-px"
            :to="ctaTo"
          >
            <span class="icon icon--apple" aria-hidden="true" />
            <span>{{ $t('common.cta.download') }}</span>
          </NuxtLink>

          <!-- 行動版選單漢堡按鈕 -->
          <button
            class="w-[45px] h-[45px] rounded-sm text-ink-800 flex lg:hidden items-center justify-center hover:bg-brand-surface hover:text-brand transition-colors duration-150 cursor-pointer"
            type="button"
            :aria-label="$t('common.a11y.openMenu')"
            :aria-expanded="menuOpen ? 'true' : 'false'"
            @click="menuOpen = !menuOpen"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 行動版下拉導覽選單 -->
      <div
        :class="[
          menuOpen ? 'flex' : 'hidden',
          'lg:hidden mt-3 p-4 bg-surface-card border border-line-300 rounded-lg shadow-xl flex-col gap-2',
        ]"
      >
        <NuxtLink
          v-for="item in NAV"
          :key="item.to"
          :to="localePath(item.to)"
          :class="isActive(item.to) ? MOBILE_ACTIVE : MOBILE_IDLE"
          @click="menuOpen = false"
        >
          {{ $t(item.key) }}
        </NuxtLink>
        <div class="flex items-center justify-around pt-3 border-t border-line-200 flex-wrap gap-2">
          <button
            class="flex items-center gap-2 text-ink-700 py-2 cursor-pointer"
            type="button"
            :aria-label="$t('common.a11y.toggleTheme')"
            @click="toggleTheme"
          >
            <span class="icon icon--theme" /><span>{{ $t('common.menu.theme') }}</span>
          </button>
        </div>
        <!-- 桌機版的語言鈕在 max-md 被藏起來，行動版改用攤平橫列 -->
        <div class="flex justify-center pt-1">
          <LanguageSwitcher variant="inline" />
        </div>
      </div>
    </div>
  </header>
</template>
