<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 首頁的頁尾沒有上邊框，其餘頁面有 */
    bordered?: boolean
  }>(),
  { bordered: true },
)

const route = useRoute()
const localePath = useLocalePath()

// F1 / Q14：真實信箱仍未提供。改由 useContact() 收斂 ——
// 有設 NUXT_PUBLIC_CONTACT_EMAIL 就發 mailto，沒設就導到隱私頁的聯絡區，
// 不再留一個指向 test1234@google.com 的死連結在線上。
const { hasEmail, href } = useContact()
const contactHref = computed(() => href('PromptBox', '/privacy#contact'))

const NAV = [
  { to: '/download', key: 'common.footer.download' },
  { to: '/pricing', key: 'common.footer.buy' },
  { to: '/docs', key: 'common.footer.docs' },
  { to: '/changelog', key: 'common.footer.changelog' },
  // 2026-09-03 下架：「我們不做什麼」語氣太死，暫時撤出頁尾導覽。
  // 頁面與 /what-we-dont-do 路由都還在，語系鍵 common.footer.notDoing 也留著 ——
  // 這是暫時下架，要復原就把下面這行的註解拿掉。
  // { to: '/what-we-dont-do', key: 'common.footer.notDoing' },
  { to: '/privacy', key: 'common.footer.privacy' },
]

const ACTIVE = 'text-brand font-sans font-medium text-base leading-normal transition-colors duration-150'
const IDLE
  = 'text-ink-800 hover:text-brand font-sans font-normal text-base leading-normal transition-colors duration-150'

const isActive = (to: string) => route.path === localePath(to)
</script>

<template>
  <footer :class="['py-10 bg-surface-card', bordered ? 'border-t border-line-200' : '']">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="w-full flex flex-col gap-9">
        <div class="flex items-center gap-6 flex-wrap max-md:gap-5 max-sm:flex-col max-sm:items-start">
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
          <nav
            class="flex flex-1 justify-end items-center gap-6.5 flex-wrap max-md:gap-5 max-sm:justify-start max-sm:gap-4"
            :aria-label="$t('common.nav.ariaFooter')"
          >
            <NuxtLink
              v-for="item in NAV"
              :key="item.to"
              :to="localePath(item.to)"
              :class="isActive(item.to) ? ACTIVE : IDLE"
            >
              {{ $t(item.key) }}
            </NuxtLink>
            <a v-if="hasEmail" :class="IDLE" :href="contactHref">{{ $t('common.footer.contact') }}</a>
            <NuxtLink v-else :class="IDLE" :to="contactHref">{{ $t('common.footer.contact') }}</NuxtLink>
          </nav>
        </div>

        <hr class="w-full h-px bg-line-300 border-0 m-0">

        <div
          class="flex justify-between items-center gap-6 flex-wrap max-sm:flex-col max-sm:items-start max-sm:gap-3 text-ink-500 font-sans font-normal text-base leading-normal"
        >
          <p>{{ $t('common.footer.copyright') }}</p>
          <p>{{ $t('common.footer.tagline') }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>
