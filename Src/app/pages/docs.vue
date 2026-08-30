<script setup lang="ts">
// FR-11：8 個章節與側邊欄同時由 content/docs/*.md 生成，單一真相來源。
const { data: sections } = await useAsyncData('docs', () =>
  queryCollection('docs').order('stem', 'ASC').all())

// FR-5：側欄 Scroll-Spy（原 js/main.js）
useDocsScrollSpy()

const { t } = useI18n()

useHead({
  title: () => t('docs.meta.title'),
  meta: [{ name: 'description', content: () => t('docs.meta.description') }],
})
</script>

<template>
  <!-- ========== Nav ========== -->
  <div class="relative overflow-hidden bg-[radial-gradient(ellipse_1300px_900px_at_30%_0%,rgba(0,159,183,0.22)_0%,rgba(0,159,183,0.06)_50%,transparent_75%)]">

    <AppHeader header-class="pb-6" />

  </div>

  <!-- ========== 主手冊佈局 (雙欄 Sticky 導覽) ========== -->
  <main class="py-12 bg-surface-page min-h-screen">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="flex flex-col lg:flex-row gap-12 items-start">

        <!-- 側欄目錄導覽 (Sticky) -->
        <aside class="docs-sidebar w-full lg:w-72 shrink-0 lg:sticky lg:top-8 bg-surface-card border border-line-200 rounded-2xl p-6 shadow-sm">
          <div class="text-xs font-bold uppercase tracking-wider text-ink-500 mb-4 px-2">
            {{ $t('docs.sidebarHeading') }}
          </div>
          <nav class="flex flex-col gap-1 text-sm font-sans" :aria-label="$t('docs.sidebarAria')">
            <a
              v-for="(sec, i) in sections"
              :key="sec.id"
              :class="[
                'px-3.5 py-2.5 rounded-lg transition flex items-center gap-2.5',
                i === 0
                  ? 'text-brand bg-brand-surface font-bold active'
                  : 'text-ink-700 hover:bg-brand-surface hover:text-brand',
              ]"
              :href="`#${sec.anchor}`"
            >
              <span :class="['icon', `icon--${sec.icon}`, 'w-4 h-4', i === 0 ? 'text-brand' : '']" />
              <span>{{ sec.navLabel }}</span>
            </a>
          </nav>
        </aside>

        <!-- 文章主內容區 -->
        <div class="docs-content flex-1 bg-surface-card border border-line-200 rounded-2xl p-8 md:p-12 shadow-sm min-w-0 max-w-4xl space-y-16">

          <!-- 首頁標題引言 -->
          <div>
            <h1 class="font-sans font-black text-4xl max-md:text-3xl text-ink-900 mb-4">{{ $t('docs.title') }}</h1>
            <p class="text-ink-600 text-lg leading-relaxed">
              {{ $t('docs.lead') }}
            </p>
            <ContentLocaleNotice />
          </div>

        <section
          v-for="(sec, i) in sections"
          :id="sec.anchor"
          :key="sec.id"
          :class="['scroll-mt-10 space-y-6 border-t border-line-200', i === 0 ? 'pt-4' : 'pt-10']"
        >
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-lg bg-brand-surface flex items-center justify-center text-brand">
              <span :class="['icon', `icon--${sec.icon}`]" />
            </span>
            <div v-if="sec.beta" class="flex items-center gap-2">
              <h2 class="font-sans font-bold text-2xl text-ink-900">
                {{ sec.title }}
              </h2>
              <span class="px-2 py-0.5 rounded-pill bg-surface-muted text-ink-600 text-xs font-bold font-sans">Beta</span>
            </div>
            <h2 v-else class="font-sans font-bold text-2xl text-ink-900">
              {{ sec.title }}
            </h2>
          </div>

          <ContentRenderer
            :value="sec"
            class="docs-prose space-y-4 text-ink-700 text-base leading-relaxed"
          />
        </section>
      </div>

      </div>
    </div>
  </main>

  <!-- ========== Footer ========== -->
  <AppFooter />
</template>
