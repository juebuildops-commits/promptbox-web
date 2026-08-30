<script setup lang="ts">
/**
 * 階段三：隱私權政策頁。
 *
 * 這一頁的寫法刻意不像一般的隱私政策 —— 一般那種是寫給律師看的免責清單，
 * 而這個產品的核心賣點就是「我們不追蹤你」。所以這頁的結構是：
 *   1. 先把 App（完全不連網）與網站（有分析、有電子報）切乾淨
 *   2. 每一項收集都寫「為什麼」與「怎麼關」
 *   3. 開關**就放在文字旁邊**，不是叫使用者去別的地方找
 */
const { t } = useI18n()
const { available, enabled, set } = useAnalyticsConsent()
const { hasEmail, email } = useContact()

useHead({
  title: () => t('privacy.meta.title'),
  meta: [{ name: 'description', content: () => t('privacy.meta.description') }],
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
            <span>{{ $t('privacy.hero.badge') }}</span>
          </div>
          <h1 class="font-sans font-black text-[48px] max-md:text-[36px] max-sm:text-[28px] leading-[1.2] text-brand">
            <span class="text-ink-900">{{ $t('privacy.hero.titleLead') }}</span> {{ $t('privacy.hero.titleAccent') }}
          </h1>
          <p class="text-sm font-mono text-ink-500">{{ $t('privacy.hero.updated') }}</p>
        </div>
      </div>
    </section>

  </div>

  <!-- ========== 政策本文 ========== -->
  <main class="py-16 bg-surface-page min-h-screen">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="max-w-3xl mx-auto flex flex-col gap-12">

        <!-- 1. App vs 網站 -->
        <section class="gradient-border-card bg-surface-card rounded-2xl p-8 max-md:p-6 flex flex-col gap-4">
          <h2 class="font-sans font-bold text-2xl max-md:text-xl text-ink-900">{{ $t('privacy.appVsSite.title') }}</h2>
          <p class="text-ink-700 text-base leading-relaxed">
            {{ $t('privacy.appVsSite.bodyPre') }}<strong class="text-ink-900">{{ $t('privacy.appVsSite.bodyStrong') }}</strong>{{ $t('privacy.appVsSite.bodyPost') }}
          </p>
          <p class="text-ink-700 text-base leading-relaxed">
            {{ $t('privacy.appVsSite.notePre') }}<strong class="text-ink-900">{{ $t('privacy.appVsSite.noteStrong') }}</strong>{{ $t('privacy.appVsSite.notePost') }}
          </p>
        </section>

        <!-- 2. 收集什麼 -->
        <section class="flex flex-col gap-6">
          <h2 class="font-sans font-black text-3xl max-md:text-2xl text-ink-900">{{ $t('privacy.collect.title') }}</h2>

          <!-- 2a. 分析 + 退出開關 -->
          <div class="bg-surface-card border border-line-200 rounded-2xl p-7 max-md:p-6 flex flex-col gap-4 shadow-sm">
            <h3 class="font-sans font-bold text-xl text-ink-900">{{ $t('privacy.collect.analytics.title') }}</h3>

            <template v-if="available">
              <p class="text-ink-700 text-base leading-relaxed">{{ $t('privacy.collect.analytics.body') }}</p>
              <p class="text-ink-700 text-base leading-relaxed">{{ $t('privacy.collect.analytics.measures') }}</p>
              <p class="text-ink-700 text-base leading-relaxed">
                {{ $t('privacy.collect.analytics.optoutPre') }}<strong class="text-ink-900">{{ $t('privacy.collect.analytics.optoutStrong') }}</strong>{{ $t('privacy.collect.analytics.optoutPost') }}
              </p>

              <!--
                開關。`enabled` 在 SSR 期一律為 true（見 useAnalyticsConsent），
                掛載後才讀 localStorage —— 預繪 HTML 與 hydration 前的 client
                狀態一致，不會有 mismatch。
              -->
              <div class="flex items-center justify-between gap-4 flex-wrap mt-2 p-5 rounded-md bg-surface-subtle border border-line-200">
                <div class="flex flex-col gap-1 min-w-0">
                  <span class="font-sans font-bold text-base text-ink-900">{{ $t('privacy.toggle.label') }}</span>
                  <span class="text-sm text-ink-600">{{ enabled ? $t('privacy.toggle.on') : $t('privacy.toggle.off') }}</span>
                </div>
                <button
                  :class="[
                    'relative shrink-0 w-14 h-8 rounded-pill transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2',
                    enabled ? 'bg-brand' : 'bg-surface-muted border border-line-300',
                  ]"
                  type="button"
                  role="switch"
                  :aria-checked="enabled ? 'true' : 'false'"
                  :aria-label="$t('privacy.toggle.label')"
                  @click="set(!enabled)"
                >
                  <span
                    :class="[
                      'absolute top-1 w-6 h-6 rounded-pill bg-white shadow-sm transition-transform duration-150',
                      enabled ? 'translate-x-7' : 'translate-x-1',
                    ]"
                  />
                </button>
              </div>
            </template>

            <!-- GA4 ID 未設定：誠實說「現在什麼都沒載」，而不是描述一個不存在的東西 -->
            <p v-else class="text-ink-700 text-base leading-relaxed">
              {{ $t('privacy.collect.analytics.disabledNotice') }}
            </p>
          </div>

          <!-- 2b. 電子報 -->
          <div class="bg-surface-card border border-line-200 rounded-2xl p-7 max-md:p-6 flex flex-col gap-4 shadow-sm">
            <h3 class="font-sans font-bold text-xl text-ink-900">{{ $t('privacy.collect.email.title') }}</h3>
            <p class="text-ink-700 text-base leading-relaxed">{{ $t('privacy.collect.email.body') }}</p>
            <p class="text-ink-700 text-base leading-relaxed">
              {{ $t('privacy.collect.email.noTrackingPre') }}<strong class="text-ink-900">{{ $t('privacy.collect.email.noTrackingStrong') }}</strong>{{ $t('privacy.collect.email.noTrackingPost') }}
            </p>
            <p class="text-ink-700 text-base leading-relaxed">{{ $t('privacy.collect.email.unsubscribe') }}</p>
          </div>

          <!-- 2c. 我們沒有的東西 -->
          <div class="bg-surface-card border border-line-200 rounded-2xl p-7 max-md:p-6 flex flex-col gap-4 shadow-sm">
            <h3 class="font-sans font-bold text-xl text-ink-900">{{ $t('privacy.collect.none.title') }}</h3>
            <ul class="flex flex-col gap-3 text-base text-ink-700">
              <li v-for="n in 4" :key="n" class="flex items-start gap-2.5">
                <span class="icon icon--check text-brand w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{{ $t(`privacy.collect.none.i${n}`) }}</span>
              </li>
            </ul>
          </div>
        </section>

        <!-- 3. 瀏覽器儲存 -->
        <section class="flex flex-col gap-4">
          <h2 class="font-sans font-black text-3xl max-md:text-2xl text-ink-900">{{ $t('privacy.storage.title') }}</h2>
          <p class="text-ink-700 text-base leading-relaxed">{{ $t('privacy.storage.body') }}</p>
          <ul class="flex flex-col gap-3 text-base text-ink-700">
            <li class="flex items-start gap-2.5">
              <span class="icon icon--storage text-brand w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <span><code>pb-theme</code> — {{ $t('privacy.storage.themeKey') }}</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="icon icon--storage text-brand w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <span><code>pb-analytics</code> — {{ $t('privacy.storage.analyticsKey') }}</span>
            </li>
          </ul>
          <p class="text-ink-600 text-sm leading-relaxed">{{ $t('privacy.storage.clear') }}</p>
        </section>

        <!-- 4. 第三方處理者 -->
        <section class="flex flex-col gap-4">
          <h2 class="font-sans font-black text-3xl max-md:text-2xl text-ink-900">{{ $t('privacy.processors.title') }}</h2>
          <div class="overflow-x-auto rounded-xl border border-line-300 bg-surface-card shadow-sm">
            <table class="w-full text-left border-collapse text-sm">
              <thead>
                <tr class="bg-surface-subtle border-b border-line-300 text-ink-900 font-bold">
                  <th class="p-4 w-36">{{ $t('privacy.processors.colName') }}</th>
                  <th class="p-4 w-44">{{ $t('privacy.processors.colPurpose') }}</th>
                  <th class="p-4">{{ $t('privacy.processors.colData') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line-200 text-ink-800">
                <tr>
                  <td class="p-4 font-medium">Vercel</td>
                  <td class="p-4">{{ $t('privacy.processors.vercel') }}</td>
                  <td class="p-4 text-ink-700">{{ $t('privacy.processors.vercelData') }}</td>
                </tr>
                <tr v-if="available">
                  <td class="p-4 font-medium">Google Analytics</td>
                  <td class="p-4">{{ $t('privacy.processors.ga') }}</td>
                  <td class="p-4 text-ink-700">{{ $t('privacy.processors.gaData') }}</td>
                </tr>
                <tr>
                  <td class="p-4 font-medium">Buttondown</td>
                  <td class="p-4">{{ $t('privacy.processors.buttondown') }}</td>
                  <td class="p-4 text-ink-700">{{ $t('privacy.processors.buttondownData') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 5. 你的權利 -->
        <section class="flex flex-col gap-4">
          <h2 class="font-sans font-black text-3xl max-md:text-2xl text-ink-900">{{ $t('privacy.rights.title') }}</h2>
          <ul class="flex flex-col gap-3 text-base text-ink-700">
            <li v-for="n in 3" :key="n" class="flex items-start gap-2.5">
              <span class="icon icon--check text-brand w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{{ $t(`privacy.rights.i${n}`) }}</span>
            </li>
          </ul>
        </section>

        <!-- 6. 聯絡（F1 未提供信箱時，footer 的「聯絡我們」會導到這裡） -->
        <section id="contact" class="scroll-mt-24 flex flex-col gap-4">
          <h2 class="font-sans font-black text-3xl max-md:text-2xl text-ink-900">{{ $t('privacy.contact.title') }}</h2>
          <p class="text-ink-700 text-base leading-relaxed">{{ $t('privacy.contact.body') }}</p>
          <p v-if="hasEmail" class="text-base">
            <a class="text-brand underline font-medium" :href="`mailto:${email}`">{{ email }}</a>
          </p>
          <SubscribeForm v-else kind="commercial" />
        </section>

        <!-- 7. 政策變更 -->
        <section class="flex flex-col gap-4">
          <h2 class="font-sans font-black text-3xl max-md:text-2xl text-ink-900">{{ $t('privacy.changes.title') }}</h2>
          <p class="text-ink-700 text-base leading-relaxed">{{ $t('privacy.changes.body') }}</p>
        </section>

      </div>
    </div>
  </main>

  <AppFooter />
</template>
