<script setup lang="ts">
/**
 * 模擬試用頁（`/demo`，2026-09-05）。決策正本：[webplan/模擬試用頁.md]。
 *
 * 形態：**靜態原檔 + 同源 iframe**（D2）。demo 本體是
 * `public/demo-app/index.html`，一份 1857 行、零外部依賴的單檔互動示範。
 * 本頁只是它的外殼：負責 SEO 文字、誠實聲明、主題同步、手機 fallback、CTA。
 *
 * 🔴 **靜態檔放 `public/demo-app/`，不是 `public/demo/`**（D3）。
 *    後者會被服成 `/demo/index.html`，與本頁的路由 `/demo` 共用前綴，
 *    誰贏取決於 Nitro 的目錄索引行為。換個資料夾名，衝突就不存在。
 *
 * 🔴 **`?v=` 不是裝飾**：`public/` 底下的檔案沒有內容 hash，
 *    改了 demo 內容卻不換這個參數，回訪者會拿到瀏覽器快取的舊版。
 *    改 `demo-app/index.html` ⇒ 一起改 DEMO_VERSION。
 *
 * 🔴 **iframe 內容 Google 不會算進這一頁**，所以外殼必須有真的文字（hero、
 *    聲明、CTA）。把它們拿掉，這頁對搜尋引擎就是一個空殼。
 */
const { t } = useI18n()
const localePath = useLocalePath()

useHead({
  title: () => t('demo.meta.title'),
  meta: [{ name: 'description', content: () => t('demo.meta.description') }],
})

/** 改 `public/demo-app/index.html` 時**一起改這個**，否則回訪者吃到快取的舊版 */
const DEMO_VERSION = '20260905'

/**
 * 手機不下載 iframe（D6）—— demo 零個 `@media`、`body{overflow:hidden}`、
 * 兩欄寬度寫死，在窄螢幕上會被裁掉一半。
 *
 * 🔴 **版面由 CSS 決定（`lg:` 斷點），不是由 JS**。用 JS 判斷會讓預繪出來的
 *    HTML 永遠是手機分支，桌機訪客先看到「這個示範需要桌機寬度」再閃成 iframe。
 * 🔴 **要不要下載那 80K 才由 JS 決定**：`demoSrc` 初值是空字串，SSR 與 hydration
 *    首次渲染兩邊一致（iframe 不在 DOM 裡），窄螢幕永遠不會被設值。
 *    不要改成 `v-show` 或只靠 CSS 藏 —— 那樣手機還是會把整份 demo 抓下來。
 */
const demoSrc = ref('')
const frame = ref<HTMLIFrameElement | null>(null)

/**
 * 主題同步。demo 本來就吃 `html.dark`，同源 ⇒ 父頁直接改它的 class 即可，
 * **`demo-app/index.html` 一行都不用改**。
 *
 * 🔴 不用 `useTheme()` 的 `isDark` 來 watch：那支 composable 每次呼叫都回一個
 *    獨立的 ref（沒有共享狀態），AppHeader 按下切換時本頁的 ref 不會動。
 *    改盯 documentElement 的 class，誰切換都攔得到。
 */
function syncTheme() {
  const doc = frame.value?.contentDocument
  if (!doc) return                       // 尚未載入完成；@load 會再呼叫一次
  doc.documentElement.classList.toggle('dark', document.documentElement.classList.contains('dark'))
}

let observer: MutationObserver | null = null
let mq: MediaQueryList | null = null

function onWidthChange() {
  // 一旦寬到足夠就載入；載過之後不再卸載（重新載入會把使用者的操作進度清掉）
  if (mq?.matches && !demoSrc.value) demoSrc.value = `/demo-app/index.html?v=${DEMO_VERSION}`
}

onMounted(() => {
  mq = window.matchMedia('(min-width: 1024px)')
  mq.addEventListener('change', onWidthChange)
  onWidthChange()
  observer = new MutationObserver(syncTheme)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  mq?.removeEventListener('change', onWidthChange)
})
</script>

<template>
  <!-- ========== Nav + Hero ========== -->
  <div class="relative overflow-hidden bg-[radial-gradient(ellipse_1300px_900px_at_30%_0%,rgba(0,159,183,0.22)_0%,rgba(0,159,183,0.06)_50%,transparent_75%)]">

    <AppHeader header-class="pb-6" />

    <section class="relative z-1 pt-12 pb-10">
      <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
        <div class="flex flex-col items-center gap-6 text-center max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-brand-surface border border-brand-border text-brand font-sans font-bold text-sm">
            <span>{{ $t('demo.hero.badge') }}</span>
          </div>
          <h1 class="font-sans font-black text-[48px] max-md:text-[36px] max-sm:text-[28px] leading-[1.2] text-ink-900">
            {{ $t('demo.hero.title') }}
          </h1>
          <p class="text-ink-700 text-base leading-relaxed">{{ $t('demo.hero.lead') }}</p>
        </div>
      </div>
    </section>

  </div>

  <main class="pb-16 bg-surface-page">
    <div class="flex flex-col gap-10">

      <!--
        🔴 舞台**刻意不吃全站的 `xl:px-24 2xl:px-60` 大留白**。
           demo 是兩欄並排的桌面 App 畫面，最缺的就是寬度；套上全站留白，
           在 2xl 螢幕上只剩 ~1120px，卡片與 IDE 兩邊都被擠到換行。
           下面的聲明與 CTA 是純文字，維持全站的閱讀寬度。
      -->
      <div class="max-w-[1920px] w-full mx-auto px-6 md:px-12">

        <!--
          1. 舞台。
          🔴 桌機才掛 iframe（D6）。手機給截圖 + 說明，不下載那 80K。
        -->
        <section class="hidden lg:flex flex-col gap-4">
          <div class="rounded-2xl overflow-hidden border border-line-200 shadow-sm bg-surface-card">
            <iframe
              v-if="demoSrc"
              ref="frame"
              class="w-full block border-0"
              style="height: min(78vh, 900px); min-height: 780px"
              :src="demoSrc"
              :title="$t('demo.frameTitle')"
              @load="syncTheme"
            />
            <!-- 尚未決定要不要載入時的佔位，避免高度從 0 跳到 780 造成 CLS -->
            <div v-else style="min-height: 780px" aria-hidden="true" />
          </div>
        </section>

        <!-- 手機／窄螢幕 fallback：由 CSS 斷點決定，與 SSR 輸出一致 -->
        <section class="flex lg:hidden flex-col gap-5 max-w-3xl mx-auto">
          <div class="bg-surface-card border border-line-200 rounded-2xl p-7 max-md:p-6 flex flex-col gap-2.5 shadow-sm">
            <h2 class="font-sans font-bold text-xl text-ink-900">{{ $t('demo.mobile.title') }}</h2>
            <p class="text-ink-700 text-base leading-relaxed">{{ $t('demo.mobile.body') }}</p>
          </div>
          <img
            class="w-full h-auto object-contain rounded-2xl border border-line-200"
            src="/assets/ExImg/demo-preview.png"
            :alt="$t('demo.mobile.imageAlt')"
            width="1920"
            height="1040"
            loading="lazy"
          >
        </section>

      </div>

      <div class="max-w-[1920px] w-full mx-auto px-6 md:px-12 xl:px-24 2xl:px-60 flex flex-col gap-10">

        <!--
          2. 誠實聲明。
          🔴 這一段是 webplan/模擬試用頁.md D7 成立的**前提**：
             demo 內文刻意凍結、其中三處（工具名、port、variables 那行）與
             App 實情不符，靠這句話標成「示意」來守誠實紅線 C1。
             依據見 Docs/refer/APP快照.md，回寫列在 webspec/主張與依據.md。
             **這段拿掉，D7 就不成立** —— 要拿掉，得先去修 demo 本體。
        -->
        <section class="max-w-3xl mx-auto w-full">
          <div class="notice notice-warning">
            <span class="icon icon--lock text-amber-500 shrink-0 mt-1" />
            <div class="notice-body">
              <strong>{{ $t('demo.disclaimer.title') }}</strong>
              <p>{{ $t('demo.disclaimer.body') }}</p>
            </div>
          </div>
        </section>

        <!-- 3. 行動點：看完 demo 的下一步就是下載 -->
        <section class="flex flex-col gap-6 max-w-3xl mx-auto w-full">
          <div class="flex flex-col items-center gap-3 text-center">
            <h2 class="font-sans font-black text-3xl max-md:text-2xl text-ink-900">{{ $t('demo.cta.title') }}</h2>
            <p class="text-ink-600 text-base leading-relaxed">{{ $t('demo.cta.body') }}</p>
          </div>

          <NuxtLink
            class="self-center inline-flex items-center justify-center gap-3 px-8 py-5 rounded-pill bg-brand hover:bg-brand-hover text-white font-sans font-bold text-lg leading-snug transition duration-150 active:translate-y-px shadow-btn"
            :to="localePath('/download')"
          >
            <span>{{ $t('demo.cta.toDownload') }}</span>
          </NuxtLink>

          <NuxtLink
            class="self-center text-ink-500 hover:text-brand underline underline-offset-4 text-base transition-colors duration-150"
            :to="localePath('/pricing')"
          >
            {{ $t('demo.cta.toPricing') }}
          </NuxtLink>
        </section>

      </div>
    </div>
  </main>

  <AppFooter />
</template>
