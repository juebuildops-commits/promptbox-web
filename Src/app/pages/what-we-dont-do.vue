<script setup lang="ts">
/**
 * 「我們不做什麼」頁（D5，2026-08-30）。
 *
 * 依據：[BRD-01 §4] 的主動放棄清單、[BRD-05 §5]「首發即上」、[BRD-05 §8] 的行銷資產清單。
 * BRD-05 §5 的原話是「這頁在信任型產品裡的行銷價值，等同於一篇好的比較頁」——
 * 所以它不是免責聲明，是**行銷素材**，語氣要能被引用。
 *
 * 兩節的分工，動之前先讀懂：
 *   §features —— 管**產品**：BRD-01 §4 的六條放棄清單，一條都不能少、也不要自己加。
 *   §words    —— 管**文案**：把 [BRD-03 §9] 的措辭硬規則翻成對外語言。
 *                這一節是本頁唯一「自我約束」的內容，也是它跟一般功能頁最不同的地方。
 *
 * 🔴 words.i1 是最容易寫錯的一條：**現在沒有公開的 repo**
 *    （open-core 啟動點在第一筆營收之後，見 BRD-02 §7.3）。
 *    在 repo 真的公開之前，這一格只能寫「還不能說」，不能改成「核心已開源」——
 *    BRD-03 §9 規則 4 與 BRD-05 §4.2「不要開出兌現不了的支票」同時管這一句。
 */
const { t } = useI18n()
const localePath = useLocalePath()

useHead({
  title: () => t('notDoing.meta.title'),
  meta: [{ name: 'description', content: () => t('notDoing.meta.description') }],
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
            <span>{{ $t('notDoing.hero.badge') }}</span>
          </div>
          <h1 class="font-sans font-black text-[48px] max-md:text-[36px] max-sm:text-[28px] leading-[1.2] text-brand">
            <span class="text-ink-900">{{ $t('notDoing.hero.titleLead') }}</span> {{ $t('notDoing.hero.titleAccent') }}
          </h1>
          <p class="text-ink-700 text-base leading-relaxed">{{ $t('notDoing.hero.lead') }}</p>
        </div>
      </div>
    </section>

  </div>

  <main class="py-16 bg-surface-page">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="max-w-3xl mx-auto flex flex-col gap-16">

        <!-- 1. 產品層：BRD-01 §4 的放棄清單 -->
        <section class="flex flex-col gap-6">
          <div class="flex flex-col gap-3">
            <h2 class="font-sans font-black text-3xl max-md:text-2xl text-ink-900">{{ $t('notDoing.features.title') }}</h2>
            <p class="text-ink-700 text-base leading-relaxed">{{ $t('notDoing.features.lead') }}</p>
          </div>

          <ul class="flex flex-col gap-4">
            <li
              v-for="n in 6" :key="n"
              class="bg-surface-card border border-line-200 rounded-2xl p-7 max-md:p-6 flex flex-col gap-2.5 shadow-sm"
            >
              <h3 class="font-sans font-bold text-xl max-md:text-lg text-ink-900 flex items-start gap-2.5">
                <span class="text-ink-400 shrink-0" aria-hidden="true">✕</span>
                <span>{{ $t(`notDoing.features.i${n}.title`) }}</span>
              </h3>
              <p class="text-ink-700 text-base leading-relaxed">{{ $t(`notDoing.features.i${n}.body`) }}</p>
            </li>
          </ul>
        </section>

        <!-- 2. 文案層：BRD-03 §9 的措辭硬規則，翻成對外語言 -->
        <section class="flex flex-col gap-6">
          <div class="flex flex-col gap-3">
            <h2 class="font-sans font-black text-3xl max-md:text-2xl text-ink-900">{{ $t('notDoing.words.title') }}</h2>
            <p class="text-ink-700 text-base leading-relaxed">{{ $t('notDoing.words.lead') }}</p>
          </div>

          <ul class="flex flex-col gap-4">
            <li
              v-for="n in 5" :key="n"
              class="bg-surface-subtle border border-line-200 rounded-2xl p-7 max-md:p-6 flex flex-col gap-2.5"
            >
              <p class="font-sans font-bold text-lg text-ink-500 line-through decoration-ink-300">{{ $t(`notDoing.words.i${n}.claim`) }}</p>
              <p class="text-ink-800 text-base leading-relaxed">{{ $t(`notDoing.words.i${n}.body`) }}</p>
            </li>
          </ul>
        </section>

        <!-- 3. 為什麼把這些寫出來 -->
        <section class="gradient-border-card bg-surface-card rounded-2xl p-8 max-md:p-6 flex flex-col gap-4">
          <h2 class="font-sans font-bold text-2xl max-md:text-xl text-ink-900">{{ $t('notDoing.why.title') }}</h2>
          <p class="text-ink-700 text-base leading-relaxed">{{ $t('notDoing.why.body') }}</p>
        </section>

        <!-- 4. 收尾轉換 -->
        <section class="flex flex-col items-center gap-5 text-center">
          <h2 class="font-sans font-black text-3xl max-md:text-2xl text-ink-900">{{ $t('notDoing.cta.title') }}</h2>
          <p class="text-ink-600 text-base leading-relaxed">{{ $t('notDoing.cta.body') }}</p>
          <NuxtLink
            class="inline-flex items-center justify-center gap-3 px-8 py-5 rounded-pill bg-brand hover:bg-brand-hover text-white font-sans font-bold text-lg leading-snug transition duration-150 active:translate-y-px shadow-btn"
            :to="localePath('/download')"
          >
            <span>{{ $t('common.cta.downloadAndStart') }}</span>
          </NuxtLink>
        </section>

      </div>
    </div>
  </main>

  <AppFooter />
</template>
