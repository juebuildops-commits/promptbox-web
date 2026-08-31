<script setup lang="ts">
import { PRICES, SHOW_LIFETIME, TOKENS } from '~/utils/pricing'

const { t } = useI18n()
const localePath = useLocalePath()

useHead({
  title: () => t('home.meta.title'),
  meta: [{ name: 'description', content: () => t('home.meta.description') }],
})
</script>

<template>
  <!-- ========== Nav + Hero + 信任列（純 CSS Radial Gradient 最佳化背景）========== -->
  <div class="relative overflow-hidden bg-[radial-gradient(ellipse_1300px_900px_at_30%_0%,rgba(0,159,183,0.22)_0%,rgba(0,159,183,0.06)_50%,transparent_75%)]">

    <!-- ---------- Nav（14:14）---------- -->
    <AppHeader />

    <!-- ---------- Hero（14:42）---------- -->
    <section class="relative z-1 pt-15">
      <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
        <div class="flex flex-col items-center gap-15 max-md:gap-10">

          <!-- 標題組 -->
          <div class="flex flex-col items-center gap-9 text-center">
            <div class="flex flex-col items-center gap-5">
              <h1 class="font-sans font-black text-[54px] max-xl:text-[44px] max-md:text-[36px] max-sm:text-[28px] leading-[1.2] tracking-[0.0185em] text-brand">
                <!--
                  兩行是**版面決定，不是文案決定**：換行用 `block` 分行，
                  不把 <br> 寫進語系檔 —— 訊息裡帶標籤就得改用 v-html，
                  等於為了一個換行把 XSS 面打開，而且每個語系都要自己記得帶那顆標籤。
                -->
                <span class="block text-ink-900">{{ $t('home.hero.titleLead') }}</span>
                <span class="block">{{ $t('home.hero.titleAccent') }}</span>
              </h1>
              <p class="font-sans font-normal text-2xl max-md:text-xl max-sm:text-lg text-ink-800 leading-[1.2] tracking-[0.0417em]">
                {{ $t('home.hero.lead') }}
              </p>
            </div>
          </div>

          <!-- CTA 群組 -->
          <div class="flex gap-6 flex-wrap justify-center max-sm:flex-col max-sm:w-full">
            <!--
              F16：這兩顆鈕原本指向 `#download-win` / `#download-mac` ——
              兩個片段識別**全站都不存在**，點下去頁面不動，只在網址列多一個 hash。
              首頁最上與最下的主要轉換點都按不動，是階段一 1:1 搬遷的殘留。

              改指下載頁的平台卡區（`#platforms` 是真的存在的 id）。
              🔴 用 NuxtLink + localePath，不要寫死 href —— 寫死會在 /en 掉語系，
              英文訪客會被丟回中文頁。

              macOS 那顆**不是下載鈕**：build 不存在（前置鏈 P3/P4 未啟動）。
              依 Q15-b 為下載頁定下的同一個決定 ——「沒有檔案就不給下載鈕」——
              文案改為「即將推出」，並把實心主鈕讓給真的能用的 Windows。
              原本的配置是反的：不存在的那個是主鈕，能用的是次要鈕。
            -->
            <NuxtLink class="inline-flex items-center justify-center gap-3 px-8 py-6 rounded-pill border border-brand-border bg-brand hover:bg-brand-hover text-white font-sans font-bold text-xl max-md:text-lg max-md:px-6 max-md:py-4 leading-snug transition duration-150 active:translate-y-px shadow-btn" :to="`${localePath('/download')}#platforms`">
              <span class="icon icon--devices" aria-hidden="true" />
              <span>{{ $t('common.cta.downloadWin') }}</span>
            </NuxtLink>
            <NuxtLink class="inline-flex items-center justify-center gap-3 px-8 py-6 rounded-pill border border-brand-border bg-brand-surface hover:bg-brand-surface-hover text-brand font-sans font-bold text-xl max-md:text-lg max-md:px-6 max-md:py-4 leading-snug transition duration-150 active:translate-y-px" :to="`${localePath('/download')}#platforms`">
              <span class="icon icon--apple" aria-hidden="true" />
              <span>{{ $t('common.cta.macSoon') }}</span>
            </NuxtLink>
          </div>

          <!-- 產品截圖與浮動標籤 -->
          <figure class="relative w-full m-0">
            <img
              class="w-full h-auto object-contain rounded-[6px]"
              src="/assets/ExImg/index-dark.png"
              :alt="$t('home.hero.imageAlt')"
              width="1480" height="963"
            >
            <span class="absolute hidden xl:inline-flex items-center gap-3 px-8 py-6 rounded-pill border border-brand-border text-ink-900 whitespace-nowrap z-2 font-sans font-bold text-xl max-xl:text-base max-xl:px-6 max-xl:py-4 leading-tight tracking-[0.05em] uppercase top-[15%] -right-12 2xl:-right-20 bg-[var(--glass-raised)] backdrop-blur-md shadow-sm">{{ $t('home.hero.floatTag') }}</span>
            <span class="absolute hidden xl:inline-flex items-center gap-3 px-8 py-6 rounded-pill border border-brand-border text-ink-900 whitespace-nowrap z-2 font-sans font-bold text-xl max-xl:text-base max-xl:px-6 max-xl:py-4 leading-tight tracking-[0.05em] uppercase top-[66%] -left-12 2xl:-left-20 bg-[var(--glass-raised-soft)] backdrop-blur-md shadow-sm">{{ $t('home.hero.floatTag') }}</span>
          </figure>

        </div>
      </div>
    </section>

    <!-- ---------- 信任列（14:63）---------- -->
    <section class="relative z-1 mt-15 w-full" :aria-label="$t('home.trust.aria')">
      <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
        <div class="w-full">
          <ul class="flex justify-center items-center gap-10 min-h-[82px] py-6 flex-wrap max-md:gap-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
            <li class="flex items-center gap-2.5 font-sans font-medium text-base leading-normal text-ink-800">
              <span class="icon icon--storage text-brand" aria-hidden="true" />
              <span>{{ $t('home.trust.local') }}<span class="text-ink-500">{{ $t('home.trust.localSub') }}</span></span>
            </li>
            <li class="w-px h-8 bg-line-200 max-md:hidden" aria-hidden="true" />
            <li class="flex items-center gap-2.5 font-sans font-medium text-base leading-normal text-ink-800">
              <span class="icon icon--lock text-brand" aria-hidden="true" />
              <span>{{ $t('home.trust.encryption') }}</span>
            </li>
            <li class="w-px h-8 bg-line-200 max-md:hidden" aria-hidden="true" />
            <li class="flex items-center gap-2.5 font-sans font-medium text-base leading-normal text-ink-800">
              <span class="icon icon--gift text-brand" aria-hidden="true" />
              <span>{{ $t('home.trust.free') }}</span>
            </li>
            <li class="w-px h-8 bg-line-200 max-md:hidden" aria-hidden="true" />
            <li class="flex items-center gap-2.5 font-sans font-medium text-base leading-normal text-ink-800">
              <span class="icon icon--devices text-brand" aria-hidden="true" />
              <span>{{ $t('home.trust.platforms') }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

  </div>

  <!-- ========== Figma 14:89：Privacy & Security ========== -->
  <section class="py-25 max-md:py-15" id="privacy" aria-labelledby="privacy-title">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="w-full">
        <div class="flex flex-col xl:flex-row items-stretch justify-center gap-12 2xl:gap-30">

          <!-- ---------- 左欄：標題 + 三條說明（14:91）---------- -->
          <div class="flex-1 min-w-0 flex flex-col gap-12 max-md:gap-8">

            <div class="flex flex-col items-center gap-4 text-center">
              <h2 id="privacy-title" class="w-full text-center font-sans font-bold text-[48px] max-2xl:text-[40px] max-md:text-[32px] max-sm:text-[26px] leading-normal tracking-[0.0185em] uppercase bg-gradient-to-r from-teal-500 to-teal-900 bg-clip-text text-transparent">{{ $t('home.privacy.title') }}</h2>
              <p class="font-sans font-bold text-[28px] max-md:text-[22px] max-sm:text-[18px] leading-tight -tracking-[0.0396em] text-ink-600">{{ $t('home.privacy.subtitle') }}</p>
            </div>

            <div class="flex flex-col gap-8 max-sm:gap-6">

              <article class="flex flex-col justify-center gap-4 p-4 md:px-5 max-sm:p-0">
                <div class="flex items-center gap-4">
                  <span class="text-ink-300 font-sans font-bold text-2xl leading-tight tracking-[0.0417em]" aria-hidden="true">01</span>
                  <h3 class="text-ink-800 font-sans font-bold text-2xl leading-tight tracking-[0.0417em]">{{ $t('home.privacy.item1.title') }}</h3>
                </div>
                <p class="text-ink-700 font-sans font-normal text-base leading-relaxed">{{ $t('home.privacy.item1.body') }}</p>
              </article>

              <hr class="w-full h-px bg-line-300 border-0 m-0">

              <article class="flex flex-col justify-center gap-4 p-4 md:px-5 max-sm:p-0">
                <div class="flex items-center gap-4">
                  <span class="text-ink-300 font-sans font-bold text-2xl leading-tight tracking-[0.0417em]" aria-hidden="true">02</span>
                  <h3 class="text-ink-800 font-sans font-bold text-2xl leading-tight tracking-[0.0417em]">{{ $t('home.privacy.item2.title') }}</h3>
                </div>
                <p class="text-ink-700 font-sans font-normal text-base leading-relaxed">{{ $t('home.privacy.item2.body') }}</p>
              </article>

              <hr class="w-full h-px bg-line-300 border-0 m-0">

              <article class="flex flex-col justify-center gap-4 p-4 md:px-5 max-sm:p-0">
                <div class="flex items-center gap-4">
                  <span class="text-ink-300 font-sans font-bold text-2xl leading-tight tracking-[0.0417em]" aria-hidden="true">03</span>
                  <h3 class="text-ink-800 font-sans font-bold text-2xl leading-tight tracking-[0.0417em]">{{ $t('home.privacy.item3.title') }}</h3>
                </div>
                <p class="text-ink-700 font-sans font-normal text-base leading-relaxed">{{ $t('home.privacy.item3.body') }}</p>
              </article>

            </div>
          </div>

          <!-- ---------- 右欄：本機 → AI 的授權流程（14:113）---------- -->
          <div class="w-full xl:w-[640px] 2xl:w-[760px] xl:shrink-0 flex flex-col justify-center items-center gap-9">

            <!-- 你的電腦（14:115） -->
            <div class="flex flex-col items-center justify-center gap-9 w-full min-h-[320px] max-sm:min-h-0 p-9 md:px-12 max-sm:p-6 rounded-lg text-center bg-brand-surface border border-brand-border-strong">
              <div class="flex flex-col items-center gap-6">
                <h3 class="text-ink-800 font-sans font-bold text-2xl leading-tight tracking-[0.0417em]">{{ $t('home.privacy.flow.yourComputer') }}</h3>
                <span class="inline-flex items-center justify-center p-5 rounded-pill bg-[var(--glass-raised)] shadow-sm">
                  <span class="icon icon--computer [--icon-size:36px] text-ink-900" aria-hidden="true" />
                </span>
              </div>
              <div class="flex flex-col items-center gap-3">
                <p class="font-sans font-normal text-xl leading-normal tracking-[0.05em] text-ink-800">{{ $t('home.privacy.flow.yourComputerBody') }}</p>
                <p class="font-accent font-semibold text-xl leading-none uppercase text-brand">{{ $t('home.privacy.flow.noCloud') }}</p>
              </div>
            </div>

            <!-- 授權指示（14:124） -->
            <div class="flex items-center gap-4 max-sm:flex-col max-sm:gap-2 max-sm:text-center text-ink-900">
              <span class="icon icon--flow [--icon-size:48px] text-ink-900" aria-hidden="true" />
              <span class="font-sans font-bold text-base leading-normal tracking-[0.0406em] uppercase text-ink-900">{{ $t('home.privacy.flow.needAuth') }}</span>
            </div>

            <!-- AI 工具（14:128） -->
            <div class="flex flex-col items-center justify-center gap-9 w-full min-h-[320px] max-sm:min-h-0 p-9 md:px-12 max-sm:p-6 rounded-lg text-center bg-surface-muted border border-line-200">
              <div class="flex flex-col items-center gap-6">
                <h3 class="text-ink-800 font-sans font-bold text-2xl leading-tight tracking-[0.0417em]">{{ $t('home.privacy.flow.aiTools') }}</h3>
                <ul class="flex flex-wrap justify-center gap-x-6 gap-y-10">
                  <li class="inline-flex items-center justify-center p-5 rounded-pill bg-brand-surface"><span class="icon icon--openai [--icon-size:36px] text-ink-800" role="img" aria-label="ChatGPT" /></li>
                  <li class="inline-flex items-center justify-center p-5 rounded-pill bg-brand-surface"><span class="icon icon--claude [--icon-size:36px] text-ink-800" role="img" aria-label="Claude" /></li>
                  <li class="inline-flex items-center justify-center p-5 rounded-pill bg-brand-surface"><span class="icon icon--gemini [--icon-size:36px] text-ink-800" role="img" aria-label="Gemini" /></li>
                </ul>
              </div>
              <p class="font-sans font-normal text-xl leading-normal tracking-[0.05em] text-ink-800">{{ $t('home.privacy.flow.aiToolsBody') }}</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  </section>

  <!-- ========== Figma 14:139：ADVANCED ========== -->
  <section class="py-20 max-md:py-15 bg-surface-tint" id="advanced" aria-labelledby="advanced-title">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="w-full flex flex-col gap-15">

        <div class="flex flex-col justify-center items-center gap-4 text-center">
          <h2 id="advanced-title" class="w-full text-center font-sans font-bold text-[48px] max-2xl:text-[40px] max-md:text-[32px] max-sm:text-[26px] leading-normal tracking-[0.0185em] uppercase bg-gradient-to-r from-teal-900 to-teal-500 bg-clip-text text-transparent">{{ $t('home.advanced.title') }}</h2>
          <p class="font-sans font-bold text-[28px] max-md:text-[22px] max-sm:text-[18px] leading-tight -tracking-[0.0396em] text-ink-600">{{ $t('home.advanced.subtitle') }}</p>
        </div>

        <div class="flex flex-col gap-15 max-sm:gap-10">
          <!-- 列 1 -->
          <div class="flex flex-col lg:flex-row items-center gap-15 max-xl:gap-10 max-lg:gap-6">
            <div class="w-full lg:w-[600px] lg:shrink-0 p-1 rounded-md overflow-hidden aspect-[16/10] bg-surface-card border border-dashed border-ink-300 flex items-center justify-center text-ink-500 font-medium" role="img" :aria-label="$t('home.advanced.row1.imageAria')">
              <img class="w-full h-auto rounded-[12px]" src="/assets/ExImg/encryption-status.webp" :alt="$t('home.advanced.row1.imageAlt')" width="1200" height="823" loading="lazy" decoding="async">
            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-center gap-6">
              <h3 class="text-ink-800 font-sans font-bold text-[32px] max-sm:text-2xl leading-tight tracking-[0.0313em]">{{ $t('home.advanced.row1.title') }}</h3>
              <ul class="flex flex-col gap-5 pl-11 max-sm:pl-6">
                <li class="text-ink-700 font-sans font-normal text-xl max-sm:text-base leading-normal"><span>{{ $t('home.advanced.row1.b1') }}</span></li>
                <li class="text-ink-700 font-sans font-normal text-xl max-sm:text-base leading-normal"><span>{{ $t('home.advanced.row1.b2') }}</span></li>
                <li class="text-ink-700 font-sans font-normal text-xl max-sm:text-base leading-normal"><span>{{ $t('home.advanced.row1.b3') }}</span></li>
              </ul>
            </div>
          </div>

          <!-- 列 2（反轉） -->
          <div class="flex flex-col lg:flex-row-reverse items-center gap-15 max-xl:gap-10 max-lg:gap-6">
            <div class="w-full lg:w-[600px] lg:shrink-0 p-1 rounded-md overflow-hidden">

              <img class="w-full h-auto rounded-[12px]" src="/assets/ExImg/MCP.webp" :alt="$t('home.advanced.row2.imageAlt')" width="1200" height="823" loading="lazy" decoding="async">
            </div>

            <div class="flex-1 min-w-0 flex flex-col justify-center gap-6">
              <h3 class="text-ink-800 font-sans font-bold text-[32px] max-sm:text-2xl leading-tight tracking-[0.0313em]">{{ $t('home.advanced.row2.title') }}</h3>
              <ul class="flex flex-col gap-5 pl-11 max-sm:pl-6">
                <li class="text-ink-700 font-sans font-normal text-xl max-sm:text-base leading-normal"><span>{{ $t('home.advanced.row2.b1') }}</span></li>
                <li class="text-ink-700 font-sans font-normal text-xl max-sm:text-base leading-normal"><span>{{ $t('home.advanced.row2.b2') }}</span></li>
                <li class="text-ink-700 font-sans font-normal text-xl max-sm:text-base leading-normal"><span>{{ $t('home.advanced.row2.b3') }}</span></li>
              </ul>
            </div>
          </div>

          <!-- 列 3 -->
          <div class="flex flex-col lg:flex-row items-center gap-15 max-xl:gap-10 max-lg:gap-6">
            <div class="w-full lg:w-[600px] lg:shrink-0 p-1 rounded-md overflow-hidden aspect-[16/10] bg-surface-card border border-dashed border-ink-300 flex items-center justify-center text-ink-500 font-medium" role="img" :aria-label="$t('home.advanced.row3.imageAria')">

              <img class="w-full h-auto rounded-[12px]" src="/assets/ExImg/chaining-demo.webp" :alt="$t('home.advanced.row3.imageAlt')" width="1200" height="823" loading="lazy" decoding="async">

            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-center gap-6">
              <h3 class="text-ink-800 font-sans font-bold text-[32px] max-sm:text-2xl leading-tight tracking-[0.0313em]">{{ $t('home.advanced.row3.title') }}</h3>
              <ul class="flex flex-col gap-5 pl-11 max-sm:pl-6">
                <li class="text-ink-700 font-sans font-normal text-xl max-sm:text-base leading-normal"><span>{{ $t('home.advanced.row3.b1') }}</span></li>
                <li class="text-ink-700 font-sans font-normal text-xl max-sm:text-base leading-normal"><span>{{ $t('home.advanced.row3.b2') }}</span></li>
                <li class="text-ink-700 font-sans font-normal text-xl max-sm:text-base leading-normal"><span>{{ $t('home.advanced.row3.b3') }}</span></li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>

  <!-- ========== Figma 14:196：PRICE ========== -->
  <section class="py-20 max-md:py-15" id="pricing" aria-labelledby="price-title">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="w-full flex flex-col items-center gap-15">

        <div class="flex flex-col items-center gap-4 text-center max-w-3xl">
          <h2 id="price-title" class="w-full text-center font-sans font-bold text-[48px] max-2xl:text-[40px] max-md:text-[32px] max-sm:text-[26px] leading-normal tracking-[0.0185em] uppercase bg-gradient-to-r from-teal-500 to-teal-900 bg-clip-text text-transparent">{{ $t('home.price.title') }}</h2>
          <p class="font-sans font-bold text-[28px] max-md:text-[22px] max-sm:text-[18px] leading-tight -tracking-[0.0396em] text-ink-600">{{ $t('home.price.subtitle') }}</p>
        </div>

        <!-- 🔴 欄數跟著 SHOW_LIFETIME 走：少一張卡卻留 4 欄會在最後留一個空格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-7xl mx-auto items-stretch" :class="SHOW_LIFETIME ? 'xl:grid-cols-4' : 'xl:grid-cols-3'">

          <!-- FREE 免費版 -->
          <article class="gradient-border-card flex flex-col justify-between p-8 bg-surface-card rounded-2xl shadow-sm">
            <div class="flex flex-col items-center gap-6">
              <span class="w-14 h-14 rounded-pill bg-brand-surface flex items-center justify-center font-ui font-normal text-2xl" aria-hidden="true">🌱</span>
              <div class="text-center">
                <h3 class="text-ink-800 font-sans font-bold text-2xl leading-tight">{{ $t('home.price.free.name') }}</h3>
                <p class="text-ink-500 font-sans text-xs mt-1">{{ $t('home.price.free.tagline') }}</p>
              </div>
              <div class="price-amount-group flex flex-col items-center gap-1 w-full">
                <p class="price-amount text-ink-900 font-sans font-bold text-4xl leading-tight">$0</p>
                <p class="price-period text-ink-500 font-sans font-normal text-sm">{{ $t('home.price.free.period') }}</p>
              </div>
              <ul class="flex flex-col gap-3 w-full p-4 bg-surface-subtle rounded-md text-xs text-ink-800">
                <li class="flex gap-2 before:content-['-'] before:shrink-0"><span>{{ $t('home.price.free.f1') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0 font-bold text-brand"><span>{{ $t('home.price.free.f2', TOKENS) }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0 font-bold text-brand"><span>{{ $t('home.price.free.f3', TOKENS) }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0 font-bold text-brand"><span>{{ $t('home.price.free.f4', TOKENS) }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0 font-bold text-brand"><span>{{ $t('home.price.free.f5', TOKENS) }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0"><span>{{ $t('home.price.free.f6') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0"><span>{{ $t('home.price.free.f7') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0"><span>{{ $t('home.price.free.f8') }}</span></li>
              </ul>
            </div>
            <div class="pt-6">
              <NuxtLink class="inline-flex items-center justify-center w-full p-3.5 bg-brand hover:bg-brand-hover text-white rounded-md font-sans font-bold text-lg leading-tight shadow-btn transition duration-150 active:translate-y-px" :to="localePath('/download')">{{ $t('common.cta.startTrial') }}</NuxtLink>
            </div>
          </article>

          <!-- PRO 早鳥方案 (焦點卡片) -->
          <article class="gradient-border-card gradient-border-card-reverse flex flex-col justify-between p-8 bg-surface-card rounded-2xl shadow-lg relative xl:scale-105 border-2 border-brand/40">
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-pill bg-brand text-white text-xs font-bold font-sans tracking-wide shadow-sm">
              {{ $t('home.price.pro.badge', TOKENS) }}
            </div>
            <div class="flex flex-col items-center gap-6">
              <span class="w-14 h-14 rounded-pill bg-brand-surface flex items-center justify-center font-ui font-normal text-2xl" aria-hidden="true">⚡</span>
              <div class="text-center">
                <h3 class="text-ink-800 font-sans font-bold text-2xl leading-tight">{{ $t('home.price.pro.name') }}</h3>
                <p class="text-ink-500 font-sans text-xs mt-1">{{ $t('home.price.pro.tagline', TOKENS) }}</p>
              </div>
              <div class="price-amount-group flex flex-col items-center gap-1 w-full">
                <div class="flex items-baseline gap-2">
                  <span class="text-ink-400 line-through text-lg font-bold font-sans">${{ PRICES.proStandard }}</span>
                  <p class="price-amount text-brand font-sans font-black text-4xl leading-tight">${{ PRICES.proEarly }}</p>
                </div>
                <p class="price-period text-brand font-sans font-bold text-xs">{{ $t('home.price.pro.period') }}</p>
              </div>
              <ul class="flex flex-col gap-3 w-full p-4 bg-surface-subtle rounded-md text-xs text-ink-800">
                <li class="flex gap-2 before:content-['-'] before:shrink-0 font-bold text-brand"><span>{{ $t('home.price.pro.f1') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0 font-bold"><span>{{ $t('home.price.pro.f2') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0 font-bold"><span>{{ $t('home.price.pro.f3') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0"><span>{{ $t('home.price.pro.f4', TOKENS) }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0"><span>{{ $t('home.price.pro.f5') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0"><span>{{ $t('home.price.pro.f6', TOKENS) }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0 text-ink-500"><span>{{ $t('home.price.pro.f7') }}</span></li>
              </ul>
            </div>
            <div class="pt-6">
              <NuxtLink class="inline-flex items-center justify-center w-full p-3.5 bg-brand hover:bg-brand-hover text-white rounded-md font-sans font-bold text-lg leading-tight shadow-btn transition duration-150 active:translate-y-px" :to="localePath('/pricing')">{{ $t('common.cta.preorderEarlyBird') }}</NuxtLink>
            </div>
          </article>

          <!-- LIFETIME 永久更新權 —— 🔴 SHOW_LIFETIME=false 期間整張卡不渲染，見 utils/pricing.ts 的旗標註解 -->
          <article v-if="SHOW_LIFETIME" class="gradient-border-card flex flex-col justify-between p-8 bg-surface-card rounded-2xl shadow-sm">
            <div class="flex flex-col items-center gap-6">
              <span class="w-14 h-14 rounded-pill bg-brand-surface flex items-center justify-center font-ui font-normal text-2xl" aria-hidden="true">💎</span>
              <div class="text-center">
                <h3 class="text-ink-800 font-sans font-bold text-2xl leading-tight">{{ $t('home.price.lifetime.name') }}</h3>
                <p class="text-ink-500 font-sans text-xs mt-1">{{ $t('home.price.lifetime.tagline') }}</p>
              </div>
              <div class="price-amount-group flex flex-col items-center gap-1 w-full">
                <p class="price-amount text-brand font-sans font-bold text-4xl leading-tight">${{ PRICES.lifetime }}</p>
                <p class="price-period text-ink-500 font-sans font-normal text-sm">{{ $t('home.price.lifetime.period') }}</p>
              </div>
              <ul class="flex flex-col gap-3 w-full p-4 bg-surface-subtle rounded-md text-xs text-ink-800">
                <li class="flex gap-2 before:content-['-'] before:shrink-0 font-bold text-brand"><span>{{ $t('home.price.lifetime.f1') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0 font-bold"><span>{{ $t('home.price.lifetime.f2') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0 font-bold text-brand"><span>{{ $t('home.price.lifetime.f3') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0"><span>{{ $t('home.price.lifetime.f4') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0"><span>{{ $t('home.price.lifetime.f5') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0 text-ink-500"><span>{{ $t('home.price.lifetime.f6') }}</span></li>
              </ul>
            </div>
            <div class="pt-6">
              <NuxtLink class="inline-flex items-center justify-center w-full p-3.5 bg-brand hover:bg-brand-hover text-white rounded-md font-sans font-bold text-lg leading-tight shadow-btn transition duration-150 active:translate-y-px" :to="localePath('/pricing')">{{ $t('common.cta.buyLifetime') }}</NuxtLink>
            </div>
          </article>

          <!--
            COMMERCIAL 商業授權 —— 🔴 **刻意置灰，不是壞掉**（2026-08-30 決策，與定價頁同一裁決）
            狀態為「還在計畫中」：卡片置灰，行動點仍連到 /pricing（那是資訊，不是購買），
            真正的購買動作在定價頁已封鎖為 disabled button。
          -->
          <article class="gradient-border-card flex flex-col justify-between p-8 bg-surface-subtle rounded-2xl shadow-sm opacity-70 grayscale-[0.35]">
            <div class="flex flex-col items-center gap-6">
              <span class="w-14 h-14 rounded-pill bg-brand-surface flex items-center justify-center font-ui font-normal text-2xl" aria-hidden="true">🏢</span>
              <div class="text-center">
                <h3 class="text-ink-800 font-sans font-bold text-2xl leading-tight">{{ $t('home.price.commercial.name') }}</h3>
                <!-- D3（2026-08-30）：與定價頁同一裁決 —— 商業授權標為「還在計畫中」，統編到位前不承諾企業發票 -->
                <p class="inline-block mt-1.5 px-2.5 py-0.5 bg-surface-card border border-line-300 text-ink-600 rounded-pill text-xs font-bold font-sans">{{ $t('home.price.commercial.soonBadge') }}</p>
                <p class="text-ink-500 font-sans text-xs mt-1">{{ $t('home.price.commercial.tagline') }}</p>
              </div>
              <div class="price-amount-group flex flex-col items-center gap-1 w-full">
                <p class="price-amount text-ink-900 font-sans font-bold text-4xl leading-tight">${{ PRICES.commercial }}</p>
                <p class="price-period text-ink-500 font-sans font-normal text-sm">{{ $t('home.price.commercial.period') }}</p>
              </div>
              <ul class="flex flex-col gap-3 w-full p-4 bg-surface-subtle rounded-md text-xs text-ink-800">
                <li class="flex gap-2 before:content-['-'] before:shrink-0 font-bold text-brand"><span>{{ $t('home.price.commercial.f1') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0 font-bold"><span>{{ $t('home.price.commercial.f2') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0 font-bold text-brand"><span>{{ $t('home.price.commercial.f3') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0"><span>{{ $t('home.price.commercial.f4') }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0"><span>{{ $t('home.price.commercial.f6', TOKENS) }}</span></li>
                <li class="flex gap-2 before:content-['-'] before:shrink-0 text-ink-500"><span>{{ $t('home.price.commercial.f5') }}</span></li>
              </ul>
            </div>
            <div class="pt-6">
              <NuxtLink class="inline-flex items-center justify-center w-full p-3.5 bg-surface-subtle hover:bg-surface-muted text-ink-800 rounded-md font-sans font-bold text-lg leading-tight border border-line-300 transition duration-150 active:translate-y-px" :to="localePath('/pricing')">{{ $t('common.cta.learnLicense') }}</NuxtLink>
            </div>
          </article>

        </div>

      </div>
    </div>
  </section>

  <!-- ========== Figma 14:268：FAQ ========== -->
  <section class="py-20 max-md:py-15 bg-surface-tint" id="faq" aria-labelledby="faq-title">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="w-full flex flex-col items-center gap-15 max-md:gap-10">

        <h2 id="faq-title" class="w-full text-center font-sans font-bold text-[48px] max-2xl:text-[40px] max-md:text-[32px] max-sm:text-[26px] leading-normal tracking-[0.0185em] uppercase bg-gradient-to-r from-teal-500 to-teal-900 bg-clip-text text-transparent">{{ $t('home.faq.title') }}</h2>

        <div class="flex flex-col gap-5 w-full">

          <details
            v-for="n in 5"
            :key="n"
            class="gradient-border-faq relative group p-9 max-md:p-7 max-sm:p-5 bg-surface-card border border-line-200 rounded-xl max-sm:rounded-md transition-all duration-200 open:rounded-lg"
            name="faq"
            :open="n === 5"
          >
            <summary class="flex items-center justify-between gap-6 max-sm:gap-3 cursor-pointer list-none text-ink-800 font-sans font-normal group-open:font-bold text-xl max-md:text-lg max-sm:text-base leading-normal tracking-[0.05em] focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-4 focus-visible:rounded-[4px] [&::-webkit-details-marker]:hidden">
              <span>{{ $t(`home.faq.q${n}`) }}</span>
              <span class="icon icon--chevron text-ink-800 rotate-180 group-open:rotate-0 transition-transform duration-200" aria-hidden="true" />
            </summary>
            <div class="flex flex-col gap-6 mt-6">
              <hr class="w-full h-px bg-line-300 border-0 m-0">
              <p class="p-5 max-sm:p-4 bg-surface-faint text-ink-700 font-sans font-medium text-lg max-sm:text-base leading-relaxed tracking-[0.02em]">{{ $t(`home.faq.a${n}`, TOKENS) }}</p>
            </div>
          </details>

        </div>

      </div>
    </div>
  </section>

  <!-- ========== Figma 1464:1630：CTA Section ========== -->
  <section class="py-20 max-md:py-15 bg-surface-card" aria-labelledby="cta-title">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="w-full flex flex-col items-center gap-15 max-md:gap-10">

        <div class="flex flex-col items-center gap-3 text-center">
          <h2 id="cta-title" class="text-ink-800 font-sans font-black text-5xl max-md:text-4xl max-sm:text-[28px] leading-normal tracking-[0.0208em] text-center">{{ $t('home.cta.title') }}</h2>
          <p class="text-ink-500 font-sans font-normal text-base leading-normal text-center">{{ $t('home.cta.body') }}</p>
        </div>

        <div class="flex gap-6 flex-wrap justify-center max-sm:flex-col max-sm:w-full">
          <!--
            F16：這兩顆鈕原本指向 `#download-win` / `#download-mac` ——
            兩個片段識別**全站都不存在**，點下去頁面不動，只在網址列多一個 hash。
            首頁最上與最下的主要轉換點都按不動，是階段一 1:1 搬遷的殘留。

            改指下載頁的平台卡區（`#platforms` 是真的存在的 id）。
            🔴 用 NuxtLink + localePath，不要寫死 href —— 寫死會在 /en 掉語系，
            英文訪客會被丟回中文頁。

            macOS 那顆**不是下載鈕**：build 不存在（前置鏈 P3/P4 未啟動）。
            依 Q15-b 為下載頁定下的同一個決定 ——「沒有檔案就不給下載鈕」——
            文案改為「即將推出」，並把實心主鈕讓給真的能用的 Windows。
            原本的配置是反的：不存在的那個是主鈕，能用的是次要鈕。
          -->
          <NuxtLink class="inline-flex items-center justify-center gap-3 px-8 py-6 rounded-pill border border-brand-border bg-brand hover:bg-brand-hover text-white font-sans font-bold text-xl max-md:text-lg max-md:px-6 max-md:py-4 leading-snug transition duration-150 active:translate-y-px shadow-btn" :to="`${localePath('/download')}#platforms`">
            <span class="icon icon--devices" aria-hidden="true" />
            <span>{{ $t('common.cta.downloadWin') }}</span>
          </NuxtLink>
          <NuxtLink class="inline-flex items-center justify-center gap-3 px-8 py-6 rounded-pill border border-brand-border bg-brand-surface hover:bg-brand-surface-hover text-brand font-sans font-bold text-xl max-md:text-lg max-md:px-6 max-md:py-4 leading-snug transition duration-150 active:translate-y-px" :to="`${localePath('/download')}#platforms`">
            <span class="icon icon--apple" aria-hidden="true" />
            <span>{{ $t('common.cta.macSoon') }}</span>
          </NuxtLink>
        </div>

        <!--
          F4 補件（D30）：首頁原本一個收集欄位都沒有 —— 訂閱表單只放在
          changelog / download / pricing / privacy 四頁，而比賽曝光的流量
          絕大多數會落在 `/`。名單是改名公告與新版通知的**唯一**送達管道
          （v3.3.0 之後 App 完全不連網），所以這一格不是轉換率優化，是管道本身。

          放在 CTA 區之內、下載鈕之後：主行動仍然是「拿到 App」，
          留 email 是沒下載的人的第二條路，不與主行動搶。
          kind 用 updates 而非 early-bird —— 首頁沒有在談定價，
          在這裡承諾早鳥資格會超出這一段文案講過的話。
        -->
        <div class="w-full max-w-2xl">
          <SubscribeForm kind="updates" />
        </div>

      </div>
    </div>
  </section>

  <!-- ========== Figma 1464:1646：Footer ========== -->
  <AppFooter :bordered="false" />
</template>
