<script setup lang="ts">
import { PRICES, TOKENS } from '~/utils/pricing'

/**
 * 支持組織頁（`/enterprise`，2026-08-31）。
 *
 * 這一頁是 [主張與依據 §三] 那一列的「產品待辦」的兌現物 ——
 *   「持有 25 席以上的組織，可列名為支持組織」
 *   ⚠️ 它同時是一個產品待辦：要列名就得有一個列名的地方，那一頁目前不存在。
 * 現在它存在了。對標 Obsidian 的 /enterprise，但**前提完全相反**：
 * Obsidian 那頁是一萬多個組織的名單，我們這頁**一個都還沒有**。
 *
 * 🔴 因此本頁的主體是一個「**誠實的空狀態**」，不是一面假的 logo 牆。
 *    在真的收到第一筆商業授權費之前：
 *      - 不放任何公司標誌 —— 包含「使用中」「測試中」「洽談中」的公司
 *      - 不放 case study、不放推薦語、不放「受信賴於」這類集合名詞
 *    誠實紅線 C1（不得暗示超出實際）在這頁的具體形態就是這兩條。
 *    空的佔位格走全站既有的 dashed 佔位語彙（systemV2 §3.3）。
 *
 * 🔴 **本頁刻意不掛進 AppHeader / AppFooter 的導覽**：商業授權尚未開放購買
 *    （D3，定價頁那張卡的行動點是 disabled 的按鈕），在能開始賣之前，
 *    導覽裡多一個「支持組織」只會把訪客送到一個買不了東西的頁。
 *    開賣時的掛法：AppFooter 的 `NAV` 加一列 `/enterprise` ＋ `common.footer.*` 加一個 key。
 *
 * 🔴 **沒有導覽連結 ⇒ crawlLinks 爬不到 ⇒ 不會被預繪。**
 *    `nuxt.config.ts` 的 `nitro.prerender.routes` 已明列 `/enterprise` 與 `/en/enterprise`。
 *    刪掉那兩行的症狀與 README §五 描述的一樣惡毒：建置照樣成功，只是這頁不存在。
 *
 * 頁面上每個數字都來自 `app/utils/pricing.ts`（紅線 1），包含列名門檻 `sponsorSeats`。
 */
const { t } = useI18n()
const localePath = useLocalePath()

// 有真信箱就發 mailto，沒有就用商業授權諮詢表單 —— 不留寄不到人的 mailto
const { hasEmail, href } = useContact()
const contactHref = computed(() => href(t('enterprise.cta.subject'), '/enterprise#commercial'))

useHead({
  title: () => t('enterprise.meta.title'),
  meta: [{ name: 'description', content: () => t('enterprise.meta.description') }],
})

/** 空狀態的佔位格數。純視覺，不代表任何名額或預期數量 */
const PLACEHOLDER_SLOTS = 8

/** 資安區塊的四條，各配一個既有的 mask 圖示 */
const TRUST_ITEMS = [
  { n: 1, icon: 'icon--computer' },
  { n: 2, icon: 'icon--lock' },
  { n: 3, icon: 'icon--storage' },
  { n: 4, icon: 'icon--gift' },
]
</script>

<template>
  <!-- ========== Nav + Hero ========== -->
  <div class="relative overflow-hidden bg-[radial-gradient(ellipse_1300px_900px_at_30%_0%,rgba(0,159,183,0.22)_0%,rgba(0,159,183,0.06)_50%,transparent_75%)]">

    <AppHeader header-class="pb-6" />

    <section class="relative z-1 pt-12 pb-16">
      <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
        <div class="flex flex-col items-center gap-6 text-center max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-brand-surface border border-brand-border text-brand font-sans font-bold text-sm">
            <span>{{ $t('enterprise.hero.badge') }}</span>
          </div>
          <h1 class="font-sans font-black text-[48px] max-md:text-[36px] max-sm:text-[28px] leading-[1.2] text-brand">
            <span class="text-ink-900">{{ $t('enterprise.hero.titleLead') }}</span> {{ $t('enterprise.hero.titleAccent') }}
          </h1>
          <p class="text-ink-700 text-base leading-relaxed">{{ $t('enterprise.hero.lead', TOKENS) }}</p>
        </div>
      </div>
    </section>

  </div>

  <main class="py-16 bg-surface-page">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="max-w-4xl mx-auto flex flex-col gap-16">

        <!--
          1. 支持組織牆 —— 🔴 空狀態是內容，不是待填的坑。
             要放上第一個標誌之前，先確認三件事：那家公司真的付了授權費、
             席次達到門檻、而且**同意被列名**（列名同意的取得方式尚未有裁示，
             見 PageDescription 08 §4 的待決事項）。
        -->
        <section class="flex flex-col gap-6">
          <div class="flex flex-col gap-3">
            <p class="font-sans font-bold text-sm tracking-wider uppercase text-brand">{{ $t('enterprise.wall.eyebrow') }}</p>
            <h2 class="font-sans font-black text-3xl max-md:text-2xl text-ink-900">{{ $t('enterprise.wall.title') }}</h2>
            <p class="text-ink-700 text-base leading-relaxed">{{ $t('enterprise.wall.rule', TOKENS) }}</p>
          </div>

          <!-- 佔位格：全站既有的 dashed 佔位語彙。純裝飾，資訊在下方文字裡 -->
          <div class="grid grid-cols-4 max-md:grid-cols-2 gap-4" aria-hidden="true">
            <div
              v-for="n in PLACEHOLDER_SLOTS"
              :key="n"
              class="h-24 max-md:h-20 rounded-xl border border-dashed border-ink-300 flex items-center justify-center"
            >
              <span class="text-ink-300 font-accent font-bold text-2xl leading-none">—</span>
            </div>
          </div>

          <div class="bg-surface-card border border-line-200 rounded-2xl p-7 max-md:p-6 flex flex-col gap-2.5 shadow-sm">
            <h3 class="font-sans font-bold text-xl max-md:text-lg text-ink-900">{{ $t('enterprise.wall.emptyTitle') }}</h3>
            <p class="text-ink-700 text-base leading-relaxed">{{ $t('enterprise.wall.emptyBody') }}</p>
          </div>

          <!-- 這面牆不會出現什麼 —— 與「我們不做什麼」同一種語氣，刻意用否定式 -->
          <ul class="flex flex-col gap-3">
            <li
              v-for="n in 3"
              :key="n"
              class="bg-surface-subtle border border-line-200 rounded-xl px-5 py-4 flex items-start gap-2.5 text-ink-800 text-base leading-relaxed"
            >
              <span class="text-ink-400 shrink-0 font-bold" aria-hidden="true">✕</span>
              <span>{{ $t(`enterprise.wall.never.i${n}`) }}</span>
            </li>
          </ul>
        </section>

        <!-- 2. 商業授權是什麼（數字全部來自 pricing.ts） -->
        <section class="flex flex-col gap-6">
          <div class="flex flex-col gap-3">
            <h2 class="font-sans font-black text-3xl max-md:text-2xl text-ink-900">{{ $t('enterprise.license.title') }}</h2>
            <p class="text-ink-700 text-base leading-relaxed">{{ $t('enterprise.license.lead') }}</p>
          </div>

          <div class="flex items-baseline gap-2.5 flex-wrap">
            <span class="font-accent font-bold text-5xl text-brand">${{ PRICES.commercial }}</span>
            <span class="text-ink-500 text-sm font-sans">{{ $t('enterprise.license.period') }}</span>
            <span class="ml-auto px-2.5 py-0.5 bg-surface-subtle border border-line-300 text-ink-600 rounded-pill text-xs font-bold font-sans whitespace-nowrap">{{ $t('enterprise.license.soonBadge') }}</span>
          </div>

          <ul class="grid grid-cols-2 max-md:grid-cols-1 gap-4">
            <li
              v-for="n in 4"
              :key="n"
              class="bg-surface-card border border-line-200 rounded-2xl p-7 max-md:p-6 flex flex-col gap-2.5 shadow-sm"
            >
              <h3 class="font-sans font-bold text-xl text-ink-900 flex items-start gap-2.5">
                <span class="icon icon--check text-brand w-5 h-5 shrink-0 mt-1" />
                <span>{{ $t(`enterprise.license.i${n}.title`, TOKENS) }}</span>
              </h3>
              <p class="text-ink-700 text-base leading-relaxed">{{ $t(`enterprise.license.i${n}.body`, TOKENS) }}</p>
            </li>
          </ul>

          <!--
            D3：尚未開放購買。發票需要統一編號（前置鏈 P2 公司登記未完成），
            在能力到位前不承諾發票、不承諾專人諮詢 —— 見 主張與依據 §三。
          -->
          <div class="notice notice-warning">
            <span class="icon icon--lock text-amber-500 shrink-0 mt-1" />
            <div class="notice-body">
              <strong>{{ $t('enterprise.license.notOpenTitle') }}</strong>
              <p>{{ $t('enterprise.license.notOpenBody') }}</p>
            </div>
          </div>
        </section>

        <!--
          3. IT 與資安會問的四件事。四條都是站上既有的既存主張，不是新的。
          🔴 i1 講「不連網」時**必須**同句講 MCP 的 127.0.0.1 本機 listener
             （BRD-03 §9 規則 5／6）—— 拆成兩條會讓第一條變成不完整的主張。
        -->
        <section class="flex flex-col gap-6">
          <div class="flex flex-col gap-3">
            <h2 class="font-sans font-black text-3xl max-md:text-2xl text-ink-900">{{ $t('enterprise.trust.title') }}</h2>
            <p class="text-ink-700 text-base leading-relaxed">{{ $t('enterprise.trust.lead') }}</p>
          </div>

          <ul class="flex flex-col gap-4">
            <li
              v-for="item in TRUST_ITEMS"
              :key="item.n"
              class="bg-surface-card border border-line-200 rounded-2xl p-7 max-md:p-6 flex items-start gap-5 max-sm:gap-4 shadow-sm"
            >
              <span class="shrink-0 w-12 h-12 rounded-xl bg-brand-surface text-brand flex items-center justify-center">
                <span :class="['icon', item.icon]" />
              </span>
              <div class="flex flex-col gap-2">
                <h3 class="font-sans font-bold text-xl max-md:text-lg text-ink-900">{{ $t(`enterprise.trust.i${item.n}.title`) }}</h3>
                <p class="text-ink-700 text-base leading-relaxed">{{ $t(`enterprise.trust.i${item.n}.body`) }}</p>
              </div>
            </li>
          </ul>
        </section>

        <!-- 4. 為什麼一個本地優先的工具需要企業付費 -->
        <section class="gradient-border-card bg-surface-card rounded-2xl p-8 max-md:p-6 flex flex-col gap-4">
          <h2 class="font-sans font-bold text-2xl max-md:text-xl text-ink-900">{{ $t('enterprise.why.title') }}</h2>
          <p class="text-ink-700 text-base leading-relaxed">{{ $t('enterprise.why.body') }}</p>
        </section>

        <!-- 5. 行動點：不是購買鈕（買不了），是諮詢管道 -->
        <section class="flex flex-col gap-6">
          <div class="flex flex-col items-center gap-3 text-center">
            <h2 class="font-sans font-black text-3xl max-md:text-2xl text-ink-900">{{ $t('enterprise.cta.title') }}</h2>
            <p class="text-ink-600 text-base leading-relaxed">{{ $t('enterprise.cta.body') }}</p>
          </div>

          <a
            v-if="hasEmail"
            class="self-center inline-flex items-center justify-center gap-3 px-8 py-5 rounded-pill bg-brand hover:bg-brand-hover text-white font-sans font-bold text-lg leading-snug transition duration-150 active:translate-y-px shadow-btn"
            :href="contactHref"
          >
            <span>{{ $t('enterprise.cta.contact') }}</span>
          </a>
          <SubscribeForm v-else kind="commercial" />

          <NuxtLink
            class="self-center text-ink-500 hover:text-brand underline underline-offset-4 text-base transition-colors duration-150"
            :to="localePath('/pricing')"
          >
            {{ $t('enterprise.cta.toPricing') }}
          </NuxtLink>
        </section>

      </div>
    </div>
  </main>

  <AppFooter />
</template>
