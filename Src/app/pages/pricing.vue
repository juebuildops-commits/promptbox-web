<script setup lang="ts">
import { PRICES, TOKENS, VAR_TOKEN } from '~/utils/pricing'

/**
 * F2 收尾：階段一把 `alert('線上金流（Paddle）即將開放！…')` 改成不綁廠商的
 * 說法，但**還是一個 alert**。本階段依 PRD 換成真的 email 訂閱表單 ——
 * 金流（Polar，D9）未開通期間，「留下 email、開通時通知你」才是能真的
 * 收到東西的行為；alert 按掉之後什麼都沒發生。
 */
const { t } = useI18n()
const localePath = useLocalePath()

// F1 / Q14：真實信箱未提供時，商業相關的聯絡動作導到本頁的諮詢表單，不留死 mailto。
// 🔴 2026-08-30：商業授權卡改為「還在計畫中」並封鎖行動點，卡片上那顆 CTA 已不再是連結，
//    因此 `href()` 在本頁暫時沒有使用者 —— 重新開放商業授權時要一併把它接回去（見卡片註解）。
const { hasEmail } = useContact()

useHead({
  title: () => t('pricing.meta.title'),
  meta: [{ name: 'description', content: () => t('pricing.meta.description') }],
})
</script>

<template>
  <!-- ========== Nav + Hero + 信任列 ========== -->
  <div class="relative overflow-hidden bg-[radial-gradient(ellipse_1300px_900px_at_30%_0%,rgba(0,159,183,0.22)_0%,rgba(0,159,183,0.06)_50%,transparent_75%)]">

    <!-- ---------- Nav ---------- -->
    <AppHeader />

    <!-- ---------- Hero ---------- -->
    <section class="relative z-1 pt-16 pb-16">
      <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
        <div class="flex flex-col items-center gap-8 text-center max-w-4xl mx-auto">

          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-brand-surface border border-brand-border text-brand font-sans font-bold text-sm">
            <span>{{ $t('pricing.hero.badge') }}</span>
          </div>

          <h1 class="font-sans font-black text-[48px] max-md:text-[36px] max-sm:text-[28px] leading-[1.2] text-brand">
            <span class="text-ink-900">{{ $t('pricing.hero.titleLead') }}</span> {{ $t('pricing.hero.titleAccent') }}
          </h1>

          <p class="font-sans font-normal text-xl max-md:text-lg text-ink-800 leading-relaxed max-w-3xl">
            {{ $t('pricing.hero.lead') }}
          </p>

        </div>
      </div>
    </section>

  </div>

  <!-- ========== 信任指標列 ========== -->
  <section class="py-6 bg-surface-card border-y border-line-200" :aria-label="$t('pricing.trust.aria')">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="flex justify-between items-center gap-6 flex-wrap max-lg:justify-center max-lg:gap-8">
        <div class="flex items-center gap-3 shrink-0">
          <span class="icon icon--check text-brand" aria-hidden="true" />
          <span class="font-sans font-medium text-base text-ink-800">{{ $t('pricing.trust.t1') }}</span>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span class="icon icon--gift text-brand" aria-hidden="true" />
          <span class="font-sans font-medium text-base text-ink-800">{{ $t('pricing.trust.t2') }}</span>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span class="icon icon--lock text-brand" aria-hidden="true" />
          <span class="font-sans font-medium text-base text-ink-800">{{ $t('pricing.trust.t3') }}</span>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span class="icon icon--devices text-brand" aria-hidden="true" />
          <span class="font-sans font-medium text-base text-ink-800">{{ $t('pricing.trust.t4') }}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== 4 張定價方案卡 ========== -->
  <section class="py-20 max-md:py-12 bg-surface-page" id="plans">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">

        <!-- 1. 免費版 Free -->
        <div class="bg-surface-card border border-line-200 rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
          <div class="flex flex-col gap-6">
            <div>
              <div class="flex items-center justify-between">
                <h3 class="font-sans font-bold text-2xl text-ink-900">{{ $t('pricing.free.name') }}</h3>
                <span class="text-xl">🌱</span>
              </div>
              <p class="text-ink-500 text-xs mt-1">{{ $t('pricing.free.tagline') }}</p>
            </div>

            <div class="flex items-baseline gap-2">
              <span class="font-accent font-bold text-5xl text-ink-900">$0</span>
              <span class="text-ink-500 text-xs font-sans">{{ $t('pricing.free.period') }}</span>
            </div>

            <hr class="border-line-200">

            <ul class="flex flex-col gap-3 text-xs text-ink-700">
              <li class="flex items-start gap-2.5">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.free.f1') }}</span>
              </li>
              <li class="flex items-start gap-2.5 font-bold text-brand">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.free.f2', TOKENS) }}</span>
              </li>
              <li class="flex items-start gap-2.5 font-bold text-brand">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.free.f3', TOKENS) }}</span>
              </li>
              <li class="flex items-start gap-2.5 font-bold text-brand">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.free.f4', TOKENS) }}</span>
              </li>
              <li class="flex items-start gap-2.5 font-bold text-brand">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.free.f5', TOKENS) }}</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.free.f6') }}</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.free.f7') }} <code>{{ VAR_TOKEN }}</code></span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.free.f8') }}</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.free.f9') }}</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.free.f10') }}</span>
              </li>
            </ul>
          </div>

          <div class="pt-8">
            <NuxtLink class="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-md bg-brand-surface hover:bg-brand-surface-hover text-brand font-sans font-bold text-base transition border border-brand-border" :to="localePath('/download')">
              <span class="icon icon--apple" />
              <span>{{ $t('common.cta.downloadFree') }}</span>
            </NuxtLink>
          </div>
        </div>

        <!-- 2. 個人版 Pro (焦點早鳥卡) -->
        <div class="gradient-border-card bg-surface-card rounded-2xl p-7 flex flex-col justify-between shadow-xl relative xl:scale-105 transition-all duration-200 hover:-translate-y-1 border-2 border-brand/40">

          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-pill bg-brand text-white text-xs font-bold font-sans tracking-wide shadow-sm whitespace-nowrap">
            {{ $t('pricing.pro.badge', TOKENS) }}
          </div>

          <div class="flex flex-col gap-6 pt-2">
            <div>
              <div class="flex items-center justify-between">
                <h3 class="font-sans font-black text-2xl text-ink-900">{{ $t('pricing.pro.name') }}</h3>
                <span class="text-xl">⚡</span>
              </div>
              <p class="text-ink-500 text-xs mt-1">{{ $t('pricing.pro.tagline', TOKENS) }}</p>
            </div>

            <div class="flex flex-col gap-0.5">
              <div class="flex items-baseline gap-2">
                <span class="text-ink-400 line-through text-lg font-bold font-sans">${{ PRICES.proStandard }}</span>
                <span class="font-accent font-bold text-5xl text-brand">${{ PRICES.proEarly }}</span>
              </div>
              <span class="text-brand text-xs font-bold font-sans">{{ $t('pricing.pro.period') }}</span>
            </div>

            <hr class="border-line-200">

            <ul class="flex flex-col gap-3 text-xs text-ink-800">
              <li class="flex items-start gap-2.5 font-bold text-brand">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.pro.f1') }}</span>
              </li>
              <li class="flex items-start gap-2.5 font-bold">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.pro.f2') }}</span>
              </li>
              <li class="flex items-start gap-2.5 font-bold">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.pro.f3') }}</span>
              </li>
              <li class="flex items-start gap-2.5 font-bold">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.pro.f4') }}</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.pro.f5') }}</span>
              </li>
              <li class="flex items-start gap-2.5 font-bold text-brand">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.pro.f6', TOKENS) }}</span>
              </li>
              <li class="flex items-start gap-2.5 text-ink-500">
                <span class="icon icon--check text-ink-400 w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.pro.f7') }}</span>
              </li>
            </ul>
          </div>

          <div class="pt-8">
            <a class="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-md bg-brand hover:bg-brand-hover text-white font-sans font-bold text-base transition shadow-btn" href="#early-access">
              <span>{{ $t('pricing.pro.cta', TOKENS) }}</span>
            </a>
          </div>
        </div>

        <!-- 3. 永久更新權 Lifetime -->
        <div class="bg-surface-card border border-line-200 rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
          <div class="flex flex-col gap-6">
            <div>
              <div class="flex items-center justify-between">
                <h3 class="font-sans font-bold text-2xl text-ink-900">{{ $t('pricing.lifetime.name') }}</h3>
                <span class="text-xl">💎</span>
              </div>
              <p class="text-ink-500 text-xs mt-1">{{ $t('pricing.lifetime.tagline') }}</p>
            </div>

            <div class="flex items-baseline gap-2">
              <span class="font-accent font-bold text-5xl text-brand">${{ PRICES.lifetime }}</span>
              <span class="text-ink-500 text-xs font-sans">{{ $t('pricing.lifetime.period') }}</span>
            </div>

            <hr class="border-line-200">

            <ul class="flex flex-col gap-3 text-xs text-ink-800">
              <li class="flex items-start gap-2.5 font-bold text-brand">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.lifetime.f1') }}</span>
              </li>
              <li class="flex items-start gap-2.5 font-bold">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.lifetime.f2') }}</span>
              </li>
              <li class="flex items-start gap-2.5 font-bold">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.lifetime.f3') }}</span>
              </li>
              <li class="flex items-start gap-2.5 font-bold text-brand">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.lifetime.f4') }}</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.lifetime.f5') }}</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.lifetime.f6') }}</span>
              </li>
              <li class="flex items-start gap-2.5 text-ink-500">
                <span class="icon icon--check text-ink-400 w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.lifetime.f7') }}</span>
              </li>
            </ul>
          </div>

          <div class="pt-8">
            <a class="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-md bg-brand hover:bg-brand-hover text-white font-sans font-bold text-base transition shadow-btn" href="#early-access">
              <span>{{ $t('pricing.lifetime.cta', TOKENS) }}</span>
            </a>
          </div>
        </div>

        <!--
          4. 商業授權 Commercial —— 🔴 **刻意封鎖，不是壞掉**（2026-08-30 決策）
          整張卡標「還在計畫中」：置灰、不 hover、行動點是 disabled 的 button 而非連結。
          企業發票需要統一編號，[前置鏈 P2] 公司登記未完成 ⇒ 這條線在能力到位前不接受任何購買意向。
          要重新開放＝改回 <a :href="commercialHref">，並同步 主張與依據 §三 的商業授權列。
        -->
        <div class="bg-surface-subtle border border-line-200 rounded-2xl p-7 flex flex-col justify-between opacity-70 grayscale-[0.35]">
          <div class="flex flex-col gap-6">
            <div>
              <div class="flex items-center justify-between">
                <h3 class="font-sans font-bold text-2xl text-ink-900">{{ $t('pricing.commercial.name') }}</h3>
                <!--
                  D3（2026-08-30）：整張卡標為「即將開放」。企業發票需要統一編號，
                  公司登記未完成前不得承諾（見 主張與依據 §缺口 1）。與 macOS 卡片同一個處理方式：
                  不給假的購買鈕，改導向登記表單。
                -->
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 bg-surface-subtle border border-line-300 text-ink-600 rounded-pill text-xs font-bold font-sans whitespace-nowrap">{{ $t('pricing.commercial.soonBadge') }}</span>
                  <span class="text-xl">🏢</span>
                </div>
              </div>
              <p class="text-ink-500 text-xs mt-1">{{ $t('pricing.commercial.tagline') }}</p>
            </div>

            <div class="flex items-baseline gap-2">
              <span class="font-accent font-bold text-5xl text-ink-900">${{ PRICES.commercial }}</span>
              <span class="text-ink-500 text-xs font-sans">{{ $t('pricing.commercial.period') }}</span>
            </div>

            <hr class="border-line-200">

            <ul class="flex flex-col gap-3 text-xs text-ink-800">
              <li class="flex items-start gap-2.5 font-bold text-brand">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.commercial.f1') }}</span>
              </li>
              <li class="flex items-start gap-2.5 font-bold">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.commercial.f2') }}</span>
              </li>
              <li class="flex items-start gap-2.5 font-bold text-brand">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.commercial.f3') }}</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.commercial.f4') }}</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="icon icon--check text-brand w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.commercial.f6') }}</span>
              </li>
              <li class="flex items-start gap-2.5 text-ink-500">
                <span class="icon icon--check text-ink-400 w-4 h-4 shrink-0" />
                <span>{{ $t('pricing.commercial.f5') }}</span>
              </li>
            </ul>
          </div>

          <div class="pt-8">
            <button
              class="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-md bg-surface-muted text-ink-500 font-sans font-bold text-base border border-line-300 cursor-not-allowed"
              type="button"
              disabled
            >
              <span>{{ $t('pricing.commercial.cta') }}</span>
            </button>
          </div>
        </div>

      </div>

      <!--
        F2 / F4：早鳥 CTA 的落點。D25 已定「預購不收錢，只收 email +
        早鳥資格保證，150 名以訂閱時間戳為準」—— 這個表單就是那個時間戳的來源。
      -->
      <div class="max-w-3xl mx-auto mt-14">
        <SubscribeForm kind="early-bird" />
      </div>

      <!-- 只有在沒設定聯絡信箱時才需要這條備援管道（見 useContact） -->
      <div v-if="!hasEmail" class="max-w-3xl mx-auto mt-6">
        <SubscribeForm kind="commercial" />
      </div>

    </div>
  </section>

  <!-- ========== 促銷與續訂優惠說明 ========== -->
  <section class="py-12 bg-surface-subtle border-y border-line-200">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">

        <div class="p-6 bg-surface-card rounded-xl border border-line-200 flex flex-col gap-2">
          <div class="flex items-center gap-2 text-brand font-bold text-base">
            <span class="icon icon--gift" />
            <span>{{ $t('pricing.promo.twoYear.title') }}</span>
          </div>
          <p class="text-ink-700 text-xs leading-relaxed">
            {{ $t('pricing.promo.twoYear.bodyPre', TOKENS) }}<strong>{{ $t('pricing.promo.twoYear.bodyStrong', TOKENS) }}</strong>{{ $t('pricing.promo.twoYear.bodyPost') }}
          </p>
        </div>

        <div class="p-6 bg-surface-card rounded-xl border border-line-200 flex flex-col gap-2">
          <div class="flex items-center gap-2 text-brand font-bold text-base">
            <span class="icon icon--devices" />
            <span>{{ $t('pricing.promo.bundle.title') }}</span>
          </div>
          <p class="text-ink-700 text-xs leading-relaxed">
            {{ $t('pricing.promo.bundle.bodyPre', TOKENS) }}<strong>{{ $t('pricing.promo.bundle.bodyStrong', TOKENS) }}</strong>{{ $t('pricing.promo.bundle.bodyPost') }}
          </p>
        </div>

        <div class="p-6 bg-surface-card rounded-xl border border-line-200 flex flex-col gap-2">
          <div class="flex items-center gap-2 text-brand font-bold text-base">
            <span class="icon icon--lock" />
            <span>{{ $t('pricing.promo.earlyBird.title') }}</span>
          </div>
          <p class="text-ink-700 text-xs leading-relaxed">
            {{ $t('pricing.promo.earlyBird.bodyPre', TOKENS) }}<strong>{{ $t('pricing.promo.earlyBird.bodyStrong', TOKENS) }}</strong>{{ $t('pricing.promo.earlyBird.bodyPost', TOKENS) }}
          </p>
        </div>

      </div>
    </div>
  </section>

  <!-- ========== 完整功能規格對照表 ========== -->
  <section class="py-20 max-md:py-12 bg-surface-card border-t border-line-200">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="max-w-5xl mx-auto">

        <div class="text-center mb-12">
          <span class="text-brand font-bold text-sm tracking-wider uppercase">{{ $t('pricing.compare.eyebrow') }}</span>
          <h2 class="font-sans font-black text-4xl max-md:text-3xl text-ink-900 mt-2">{{ $t('pricing.compare.title') }}</h2>
        </div>

        <div class="overflow-x-auto rounded-xl border border-line-300 bg-surface-page shadow-sm">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-surface-subtle border-b border-line-300 text-ink-900 font-bold">
                <th class="p-4 md:p-5">{{ $t('pricing.compare.colFeature') }}</th>
                <th class="p-4 md:p-5 text-center w-28">{{ $t('pricing.compare.colFree') }}</th>
                <th class="p-4 md:p-5 text-center w-36 text-brand bg-brand/15">{{ $t('pricing.compare.colPro') }}</th>
                <th class="p-4 md:p-5 text-center w-36 text-brand bg-brand/10">{{ $t('pricing.compare.colLifetime') }}</th>
                <th class="p-4 md:p-5 text-center w-36">{{ $t('pricing.compare.colCommercial') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line-200 text-ink-800">
              <tr>
                <td class="p-4 md:p-5 font-medium">{{ $t('pricing.compare.r1') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/8">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/4">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">✓</td>
              </tr>
              <tr>
                <td class="p-4 md:p-5 font-medium">{{ $t('pricing.compare.r2') }}</td>
                <td class="p-4 md:p-5 text-center text-ink-700 font-bold">{{ $t('pricing.compare.r2free', TOKENS) }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/8">{{ $t('pricing.compare.unlimited') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/4">{{ $t('pricing.compare.unlimited') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">{{ $t('pricing.compare.unlimited') }}</td>
              </tr>
              <tr>
                <td class="p-4 md:p-5 font-medium">{{ $t('pricing.compare.r3') }}</td>
                <td class="p-4 md:p-5 text-center text-ink-700 font-bold">{{ $t('pricing.compare.r3free', TOKENS) }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/8">{{ $t('pricing.compare.unlimited') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/4">{{ $t('pricing.compare.unlimited') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">{{ $t('pricing.compare.unlimited') }}</td>
              </tr>
              <tr>
                <td class="p-4 md:p-5 font-medium">{{ $t('pricing.compare.r4') }}</td>
                <td class="p-4 md:p-5 text-center text-ink-700 font-bold">{{ $t('pricing.compare.r4free', TOKENS) }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/8">{{ $t('pricing.compare.unlimited') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/4">{{ $t('pricing.compare.unlimited') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">{{ $t('pricing.compare.unlimited') }}</td>
              </tr>
              <tr>
                <td class="p-4 md:p-5 font-medium">{{ $t('pricing.compare.r5') }}</td>
                <td class="p-4 md:p-5 text-center text-ink-700 font-bold">{{ $t('pricing.compare.r5free', TOKENS) }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/8">{{ $t('pricing.compare.unlimited') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/4">{{ $t('pricing.compare.unlimited') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">{{ $t('pricing.compare.unlimited') }}</td>
              </tr>
              <tr>
                <td class="p-4 md:p-5 font-medium">{{ $t('pricing.compare.r6') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">{{ $t('pricing.compare.unlimited') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/8">{{ $t('pricing.compare.unlimited') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/4">{{ $t('pricing.compare.unlimited') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">{{ $t('pricing.compare.unlimited') }}</td>
              </tr>
              <!--
                🔴 r7（變數樣板）與 r8（全庫靜態加密）在 Free 欄一律是 ✓，不是 —。
                依據 BRD-03 §2 真相表：「每卡變數數｜無限｜不 gate」、§2.6「變數替換開關 Free 完整」、
                §1 G1「全庫靜態加密永久免費、無限、絕不設限」。
                gate 變數等於 gate 變數功能本身（§2.6 明文），而 G1 的對外口徑是
                「加密永遠免費；Pro 賣的是規模與釋放護欄」——改動這兩列前先回 BRD-03。
              -->
              <tr>
                <td class="p-4 md:p-5 font-medium">{{ $t('pricing.compare.r7pre') }}<code>{{ VAR_TOKEN }}</code>{{ $t('pricing.compare.r7post') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/8">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/4">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">✓</td>
              </tr>
              <tr>
                <td class="p-4 md:p-5 font-medium">{{ $t('pricing.compare.r8') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">{{ $t('pricing.compare.r8free') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/8">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/4">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">✓</td>
              </tr>
              <!-- 釋放稽核：記錄與檢視 Free 完整（§2.2），只有「匯出」是 Pro 的那一半 -->
              <tr>
                <td class="p-4 md:p-5 font-medium">{{ $t('pricing.compare.r13') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/8">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/4">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">✓</td>
              </tr>
              <tr>
                <td class="p-4 md:p-5 font-medium">{{ $t('pricing.compare.r14') }}</td>
                <td class="p-4 md:p-5 text-center text-ink-300">{{ $t('pricing.compare.dash') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/8">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/4">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">✓</td>
              </tr>
              <tr>
                <td class="p-4 md:p-5 font-medium">{{ $t('pricing.compare.r9') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/8">{{ $t('pricing.compare.r9forever') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/4">{{ $t('pricing.compare.r9forever') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">{{ $t('pricing.compare.r9forever') }}</td>
              </tr>
              <tr>
                <td class="p-4 md:p-5 font-medium">{{ $t('pricing.compare.r10') }}</td>
                <td class="p-4 md:p-5 text-center text-ink-700">{{ $t('pricing.compare.r10free') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/8">{{ $t('pricing.compare.r10pro', TOKENS) }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/4">{{ $t('pricing.compare.r10lifetime') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">{{ $t('pricing.compare.r10commercial') }}</td>
              </tr>
              <tr>
                <td class="p-4 md:p-5 font-medium">{{ $t('pricing.compare.r11') }}</td>
                <td class="p-4 md:p-5 text-center text-ink-300">{{ $t('pricing.compare.dash') }}</td>
                <td class="p-4 md:p-5 text-center text-ink-300 bg-brand/8">{{ $t('pricing.compare.dash') }}</td>
                <td class="p-4 md:p-5 text-center text-ink-300 bg-brand/4">{{ $t('pricing.compare.dash') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">{{ $t('pricing.compare.r11commercial') }}</td>
              </tr>
              <tr>
                <td class="p-4 md:p-5 font-medium">{{ $t('pricing.compare.r12') }}</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/8">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold bg-brand/4">✓</td>
                <td class="p-4 md:p-5 text-center text-brand font-bold">✓</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </section>

  <!-- ========== 常見問題 FAQ ========== -->
  <section class="py-20 max-md:py-12 bg-surface-page" id="faq">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="max-w-3xl mx-auto">

        <div class="text-center mb-12">
          <span class="text-brand font-bold text-sm tracking-wider uppercase">{{ $t('pricing.faq.eyebrow') }}</span>
          <h2 class="font-sans font-black text-4xl max-md:text-3xl text-ink-900 mt-2">{{ $t('pricing.faq.title') }}</h2>
        </div>

        <div class="flex flex-col gap-4">

          <details class="gradient-border-faq relative group p-6 bg-surface-card border border-line-200 rounded-xl transition-all duration-200 open:rounded-lg" open>
            <summary class="flex items-center justify-between gap-4 cursor-pointer list-none text-ink-800 font-sans font-bold text-lg leading-normal [&::-webkit-details-marker]:hidden">
              <span>{{ $t('pricing.faq.q1') }}</span>
              <span class="icon icon--chevron text-ink-800 rotate-180 group-open:rotate-0 transition-transform duration-200" aria-hidden="true" />
            </summary>
            <div class="mt-4 pt-4 border-t border-line-200">
              <p class="text-ink-700 text-base leading-relaxed">
                {{ $t('pricing.faq.a1pre') }}<strong>{{ $t('pricing.faq.a1s1') }}</strong>{{ $t('pricing.faq.a1mid') }}<strong>{{ $t('pricing.faq.a1s2', TOKENS) }}</strong>{{ $t('pricing.faq.a1post') }}
              </p>
            </div>
          </details>

          <details class="gradient-border-faq relative group p-6 bg-surface-card border border-line-200 rounded-xl transition-all duration-200 open:rounded-lg">
            <summary class="flex items-center justify-between gap-4 cursor-pointer list-none text-ink-800 font-sans font-bold text-lg leading-normal [&::-webkit-details-marker]:hidden">
              <span>{{ $t('pricing.faq.q2') }}</span>
              <span class="icon icon--chevron text-ink-800 rotate-180 group-open:rotate-0 transition-transform duration-200" aria-hidden="true" />
            </summary>
            <div class="mt-4 pt-4 border-t border-line-200">
              <p class="text-ink-700 text-base leading-relaxed">
                {{ $t('pricing.faq.a2pre', TOKENS) }}<strong>{{ $t('pricing.faq.a2s1', TOKENS) }}</strong>{{ $t('pricing.faq.a2mid', TOKENS) }}<strong>{{ $t('pricing.faq.a2s2', TOKENS) }}</strong>{{ $t('pricing.faq.a2post', TOKENS) }}
              </p>
            </div>
          </details>

          <details class="gradient-border-faq relative group p-6 bg-surface-card border border-line-200 rounded-xl transition-all duration-200 open:rounded-lg">
            <summary class="flex items-center justify-between gap-4 cursor-pointer list-none text-ink-800 font-sans font-bold text-lg leading-normal [&::-webkit-details-marker]:hidden">
              <span>{{ $t('pricing.faq.q3') }}</span>
              <span class="icon icon--chevron text-ink-800 rotate-180 group-open:rotate-0 transition-transform duration-200" aria-hidden="true" />
            </summary>
            <div class="mt-4 pt-4 border-t border-line-200">
              <p class="text-ink-700 text-base leading-relaxed">
                {{ $t('pricing.faq.a3pre') }}<strong>{{ $t('pricing.faq.a3s1') }}</strong>{{ $t('pricing.faq.a3post') }}
              </p>
            </div>
          </details>

          <details class="gradient-border-faq relative group p-6 bg-surface-card border border-line-200 rounded-xl transition-all duration-200 open:rounded-lg">
            <summary class="flex items-center justify-between gap-4 cursor-pointer list-none text-ink-800 font-sans font-bold text-lg leading-normal [&::-webkit-details-marker]:hidden">
              <span>{{ $t('pricing.faq.q4', TOKENS) }}</span>
              <span class="icon icon--chevron text-ink-800 rotate-180 group-open:rotate-0 transition-transform duration-200" aria-hidden="true" />
            </summary>
            <div class="mt-4 pt-4 border-t border-line-200">
              <p class="text-ink-700 text-base leading-relaxed">
                {{ $t('pricing.faq.a4pre', TOKENS) }}<strong>{{ $t('pricing.faq.a4s1') }}</strong>{{ $t('pricing.faq.a4post') }}
              </p>
            </div>
          </details>

          <details class="gradient-border-faq relative group p-6 bg-surface-card border border-line-200 rounded-xl transition-all duration-200 open:rounded-lg">
            <summary class="flex items-center justify-between gap-4 cursor-pointer list-none text-ink-800 font-sans font-bold text-lg leading-normal [&::-webkit-details-marker]:hidden">
              <span>{{ $t('pricing.faq.q5') }}</span>
              <span class="icon icon--chevron text-ink-800 rotate-180 group-open:rotate-0 transition-transform duration-200" aria-hidden="true" />
            </summary>
            <div class="mt-4 pt-4 border-t border-line-200">
              <p class="text-ink-700 text-base leading-relaxed">
                {{ $t('pricing.faq.a5pre', TOKENS) }}<strong>{{ $t('pricing.faq.a5s1') }}</strong>{{ $t('pricing.faq.a5post') }}
              </p>
            </div>
          </details>

          <details class="gradient-border-faq relative group p-6 bg-surface-card border border-line-200 rounded-xl transition-all duration-200 open:rounded-lg">
            <summary class="flex items-center justify-between gap-4 cursor-pointer list-none text-ink-800 font-sans font-bold text-lg leading-normal [&::-webkit-details-marker]:hidden">
              <span>{{ $t('pricing.faq.q6') }}</span>
              <span class="icon icon--chevron text-ink-800 rotate-180 group-open:rotate-0 transition-transform duration-200" aria-hidden="true" />
            </summary>
            <div class="mt-4 pt-4 border-t border-line-200">
              <p class="text-ink-700 text-base leading-relaxed">
                {{ $t('pricing.faq.a6') }}
              </p>
            </div>
          </details>

        </div>

      </div>
    </div>
  </section>

  <!-- ========== 底部 CTA ========== -->
  <section class="py-20 max-md:py-12 bg-surface-card border-t border-line-200">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="flex flex-col items-center gap-6 text-center max-w-3xl mx-auto">
        <h2 class="font-sans font-black text-4xl max-md:text-3xl text-ink-900">
          {{ $t('pricing.cta.title') }}
        </h2>
        <p class="text-ink-600 text-base">
          {{ $t('pricing.cta.body') }}
        </p>
        <NuxtLink class="inline-flex items-center justify-center gap-3 px-8 py-5 rounded-pill bg-brand hover:bg-brand-hover text-white font-sans font-bold text-lg leading-snug transition duration-150 active:translate-y-px shadow-btn" :to="localePath('/download')">
          <span class="icon icon--apple" aria-hidden="true" />
          <span>{{ $t('common.cta.downloadAndStart') }}</span>
        </NuxtLink>
      </div>
    </div>
  </section>

  <!-- ========== Footer ========== -->
  <AppFooter />
</template>
