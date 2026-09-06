<script setup lang="ts">
/**
 * 「關於 PromptBox」頁（WL-003，2026-09-07 上線）。
 *
 * 為什麼它長這樣，動之前先讀懂三件事：
 *
 * 1. 🔴 **正文在 `content/about/*.md`，不在語系檔。**
 *    這一頁 95% 是長篇第一人稱敘事。放語系檔＝`check:i18n` 會要求 en 逐句翻譯
 *    （en 不是骨架語系，空字串直接擋建置），等於用一頁翻譯債換一頁文案。
 *    走 content 則沿用 D-16 已經訂好的分界：**版面三語、content 只有 zh-TW**，
 *    英文讀者看到 <ContentLocaleNotice />，與 /docs、/changelog 完全一致。
 *
 * 2. 🔴 **本頁不對外連任何站內頁面。** 這是刻意的：它接手的是被撤下的
 *    /what-we-dont-do 留下的位置，如果又把內容分散出去，就會退回「四份副本」
 *    那個問題（見 Docs/Wishlist/003.WL_關於我頁.md §1）。
 *    提到定價時寫「在定價頁」但不給連結，也是同一個決定。
 *    ⚠️ 要加連結之前先想清楚：這頁的說服力來自「一口氣讀完」。
 *
 * 3. **主導覽刻意沒有入口，只掛頁尾。** 桌機 nav 在 lg（1024–1279px）已經滿了，
 *    第 7 項會擠出容器（`AppHeader.vue` 的 NAV 沒有 flex-wrap）。
 *    要放進主導覽＝先處理那個斷點，不是直接加一行。
 */
const { data: sections } = await useAsyncData('about', () =>
  queryCollection('about').order('stem', 'ASC').all())

const { t } = useI18n()

useHead({
  title: () => t('about.meta.title'),
  meta: [{ name: 'description', content: () => t('about.meta.description') }],
})
</script>

<template>
  <!-- ========== Nav + Hero ========== -->
  <div class="relative overflow-hidden bg-[radial-gradient(ellipse_1300px_900px_at_30%_0%,rgba(0,159,183,0.22)_0%,rgba(0,159,183,0.06)_50%,transparent_75%)]">

    <AppHeader header-class="pb-6" />

    <section class="relative z-1 pt-12 pb-16">
      <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
        <div class="flex flex-col items-center gap-6 text-center max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-brand-surface border border-brand-border text-brand font-sans font-bold text-sm">
            <span>{{ $t('about.hero.badge') }}</span>
          </div>
          <h1 class="font-sans font-black text-[48px] max-md:text-[36px] max-sm:text-[28px] leading-[1.2] text-brand">
            <span class="text-ink-900">{{ $t('about.hero.titleLead') }}</span>{{ $t('about.hero.titleAccent') }}
          </h1>
          <p class="font-sans font-normal text-lg text-ink-700 leading-relaxed">
            {{ $t('about.hero.lead') }}
          </p>
        </div>
      </div>
    </section>

  </div>

  <!-- ========== 正文 ========== -->
  <main class="py-16 max-md:py-10 bg-surface-page">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="max-w-5xl mx-auto flex flex-col gap-10">

        <!-- 頁內目錄。純錨點，不是站外連結 -->
        <nav
          class="bg-surface-card border border-line-200 rounded-2xl p-6 max-md:p-5 shadow-sm"
          :aria-label="$t('about.tocHeading')"
        >
          <div class="text-xs font-bold uppercase tracking-wider text-ink-500 mb-4">
            {{ $t('about.tocHeading') }}
          </div>
          <ol class="flex flex-col gap-2">
            <li v-for="(sec, i) in sections" :key="sec.id">
              <a
                class="group flex items-center gap-3 text-ink-700 hover:text-brand transition-colors duration-150"
                :href="`#${sec.anchor}`"
              >
                <span class="shrink-0 w-6 h-6 rounded-md bg-brand-surface text-brand font-sans font-bold text-xs flex items-center justify-center">
                  {{ i + 1 }}
                </span>
                <span class="font-sans font-medium text-base group-hover:underline">{{ sec.title }}</span>
              </a>
            </li>
          </ol>
        </nav>

        <ContentLocaleNotice />

        <!-- 四個章節 -->
        <section
          v-for="(sec, i) in sections"
          :id="sec.anchor"
          :key="sec.id"
          class="scroll-mt-8 bg-surface-card border border-line-200 rounded-2xl p-8 md:p-10 max-md:p-6 shadow-sm"
        >
          <div class="flex items-start gap-4 mb-7 pb-6 border-b border-line-200">
            <span
              class="shrink-0 w-11 h-11 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center"
              aria-hidden="true"
            >
              <span :class="['icon', `icon--${sec.icon}`, 'w-5 h-5 text-brand']" />
            </span>
            <div class="flex flex-col gap-1 min-w-0">
              <span class="font-sans font-bold text-xs uppercase tracking-wider text-ink-400">
                {{ String(i + 1).padStart(2, '0') }}
              </span>
              <h2 class="font-sans font-black text-3xl max-md:text-2xl text-ink-900 leading-tight">
                {{ sec.title }}
              </h2>
            </div>
          </div>

          <ContentRenderer
            :value="sec"
            class="about-prose flex flex-col gap-5 text-ink-700 text-base leading-[1.85]"
          />
        </section>

        <p class="text-center text-ink-500 font-sans text-base pt-2">
          {{ $t('about.signoff') }}
        </p>

      </div>
    </div>
  </main>

  <!-- ========== Footer ========== -->
  <AppFooter />
</template>
