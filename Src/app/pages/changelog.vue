<script setup lang="ts">
// FR-10：13 張版本卡改由 content/changelog/*.md 生成。
// 順序以 date 字串反向排序推導 —— 涵蓋 "2026-08-11" 與 "2026-08-07 ~ 2026-08-11"
// 兩種寫法，字典序剛好等同時序，因此 latest 不需要手動標記。
const { data: entries } = await useAsyncData('changelog', () => queryCollection('changelog').all())

const sorted = computed(() => [...(entries.value ?? [])].sort((x, y) => y.date.localeCompare(x.date)))
const versions = computed(() => sorted.value.filter(e => !e.legacy))
const legacy = computed(() => sorted.value.filter(e => e.legacy))

const { t } = useI18n()
const localePath = useLocalePath()

useHead({
  title: () => t('changelog.meta.title'),
  meta: [{ name: 'description', content: () => t('changelog.meta.description') }],
})
</script>

<template>
  <!-- ========== Nav + Hero ========== -->
  <div class="relative overflow-hidden bg-[radial-gradient(ellipse_1300px_900px_at_30%_0%,rgba(0,159,183,0.22)_0%,rgba(0,159,183,0.06)_50%,transparent_75%)]">

    <!-- ---------- Nav ---------- -->
    <AppHeader header-class="pb-6" />

    <!-- ---------- Hero ---------- -->
    <section class="relative z-1 pt-12 pb-16">
      <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
        <div class="flex flex-col items-center gap-6 text-center max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-brand-surface border border-brand-border text-brand font-sans font-bold text-sm">
            <span>{{ $t('changelog.hero.badge') }}</span>
          </div>
          <h1 class="font-sans font-black text-[48px] max-md:text-[36px] max-sm:text-[28px] leading-[1.2] text-brand">
            <span class="text-ink-900">{{ $t('changelog.hero.titleLead') }}</span> {{ $t('changelog.hero.titleAccent') }}
          </h1>
          <!--
            F4 / F10：原本這裡指向 github.com/tsa206531/PromptBox/releases，
            但 D19 已確認該 repo 未公開 ⇒ 連結是壞的，而且它問的正是
            「怎麼知道有新版」—— 也就是 F4 本身。改指向本頁的訂閱表單。
          -->
          <p class="font-sans font-normal text-lg text-ink-700 leading-relaxed">
            {{ $t('changelog.hero.lead') }}<a class="text-brand underline font-medium" href="#subscribe">{{ $t('changelog.hero.leadLink') }}</a>{{ $t('changelog.hero.leadTail') }}
          </p>
        </div>
      </div>
    </section>

  </div>

  <!-- ========== 時間軸 Timeline 主區塊 ========== -->
  <main class="py-16 bg-surface-page min-h-screen">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="max-w-4xl mx-auto space-y-12">

        <ContentLocaleNotice />

        <article
          v-for="(e, i) in versions"
          :key="e.id"
          :class="[
            'rounded-2xl p-8 md:p-10',
            i === 0
              ? 'gradient-border-card bg-surface-card shadow-lg relative'
              : `bg-surface-card border border-line-200 ${e.major ? 'shadow-md' : 'shadow-sm'}`,
          ]"
        >
          <div class="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div class="flex items-center gap-3">
              <h2
                :class="i === 0
                  ? 'font-sans font-black text-3xl text-brand'
                  : `font-sans ${e.major ? 'font-black' : 'font-bold'} text-2xl text-ink-900`"
              >
                {{ e.version }}
              </h2>
              <span class="text-sm font-mono text-ink-500">{{ e.date }}</span>
            </div>
            <span
              v-if="i === 0"
              class="px-3.5 py-1 rounded-pill bg-brand text-white text-xs font-bold font-sans shadow-sm"
            >
              {{ $t('changelog.latestBadge') }}
            </span>
            <span
              v-else-if="e.badge"
              class="px-3.5 py-1 rounded-pill bg-brand-surface text-brand text-xs font-bold font-sans border border-brand-border"
            >
              {{ e.badge }}
            </span>
          </div>
          <p class="text-ink-700 font-medium text-base mb-6">
            {{ e.summary }}
          </p>
          <ContentRenderer :value="e" class="changelog-body" />
        </article>

        <!-- 早期版本折疊/摘要 -->
        <div class="space-y-6 pt-6">
          <h3 class="font-sans font-bold text-xl text-ink-600">
            {{ $t('changelog.legacyHeading') }}
          </h3>
          <article
            v-for="e in legacy"
            :key="e.id"
            class="bg-surface-subtle border border-line-200 rounded-xl p-6"
          >
            <div class="flex items-center justify-between flex-wrap gap-2 mb-2">
              <h4 class="font-sans font-bold text-lg text-ink-900">
                {{ e.version }}
              </h4>
              <span class="text-xs font-mono text-ink-500">{{ e.date }}</span>
            </div>
            <p class="text-ink-600 text-sm leading-relaxed">
              {{ e.summary }}
            </p>
          </article>
        </div>

        <!-- F4：新版通知的唯一管道（D20） -->
        <SubscribeForm kind="updates" class="mt-4" />
      </div>
    </div>
  </main>

  <!-- ========== 底部 CTA ========== -->
  <section class="py-20 max-md:py-12 bg-surface-card border-t border-line-200">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="flex flex-col items-center gap-6 text-center max-w-3xl mx-auto">
        <h2 class="font-sans font-black text-4xl max-md:text-3xl text-ink-900">
          {{ $t('changelog.cta.title') }}
        </h2>
        <p class="text-ink-600 text-base">
          {{ $t('changelog.cta.body') }}
        </p>
        <NuxtLink class="inline-flex items-center justify-center gap-3 px-8 py-5 rounded-pill bg-brand hover:bg-brand-hover text-white font-sans font-bold text-lg leading-snug transition duration-150 active:translate-y-px shadow-btn" :to="localePath('/download')">
          <span class="icon icon--apple" aria-hidden="true" />
          <span>{{ $t('common.cta.goDownloadLatest') }}</span>
        </NuxtLink>
      </div>
    </div>
  </section>

  <!-- ========== Footer ========== -->
  <AppFooter />
</template>
