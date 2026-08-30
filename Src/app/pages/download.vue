<script setup lang="ts">
// FR-4：作業系統偵測（原 js/main.js 的 detectOS + CTA 文案替換 + 平台卡高亮）
const { os, ctaLabel, osNote } = useOsDetect()

const { t } = useI18n()
const localePath = useLocalePath()

/**
 * F10 / Q15 已解 —— 安裝檔由 Cloudflare R2 發佈（上線前置鏈 P1）。
 *
 * 為什麼不放 `public/`：兩顆檔案各自超過 100 MB，而 GitHub 硬擋單檔 >100 MiB、
 * Vercel Hobby 的來源檔上限同樣是 100 MB ⇒ 放進 repo 會讓整條部署路線不通。
 * R2 的 egress 免費，這是「發安裝檔」唯一重要的成本項。
 *
 * 🔴 這是 D16（所有下載一律需登入）的**暫時例外**，為了讓比賽曝光期有東西可下載。
 *    階段五 5a 的登入閘門上線時，只需把 `href` 換成閘門路由，本頁文案一個字都不用動。
 *
 * 🔴 `href` 與 `sha256` **必須成對更新** —— 校驗碼是印在頁面上的對外承諾
 *    （`download.checksum.*`），對不上比沒有更糟。
 *    目前這兩組已用 R2 的 ETag（單段上傳 ⇒ 等於物件 MD5）驗證過與本機建置產物位元組相同。
 *
 * 🔴 `pub-*.r2.dev` 是 Cloudflare 的公用開發網址，官方不建議正式環境長期依賴。
 *    網域到位後（前置鏈 P6）改綁自訂網域，一樣只動這幾行。
 */
const R2 = 'https://pub-c877572083874aada08b285a742dce71.r2.dev'

const WIN_EXE = {
  href: `${R2}/PromptBox-Setup-3.7.1.exe`,
  size: '111 MB',
  sha256: '0b61dc4ece4e0a3e62ed294c3528d70c8d3ef6c53b89780e03cb1b09e3cdadf3',
}
const WIN_ZIP = {
  href: `${R2}/promptbox-v3.7.1.zip`,
  size: '153 MB',
  sha256: '58829bbeaf57afca7c0b08b67677de1986e82f185a9c4c2ae18456bca6fa8e2b',
}

/**
 * macOS build 還不存在。在它存在之前，mac 訪客導到訂閱表單 ——
 * 給一個下載不到東西的按鈕，比誠實說「即將推出」傷害大。
 */
const MAC_READY: boolean = false

const macSoon = computed(() => !MAC_READY && os.value === 'mac')
const heroHref = computed(() => (macSoon.value ? '#subscribe' : WIN_EXE.href))
const heroLabel = computed(() => {
  if (macSoon.value) return t('download.platforms.mac.ctaSoon')
  // 'other'（Linux 等）點下去拿到的也是 Windows 檔，標籤要說實話
  if (os.value === 'other') return t('common.os.ctaWin')
  return ctaLabel.value
})
const heroNote = computed(() =>
  macSoon.value ? t('download.platforms.mac.soonNote') : osNote.value,
)

useHead({
  title: () => t('download.meta.title'),
  meta: [{ name: 'description', content: () => t('download.meta.description') }],
})
</script>

<template>
  <!-- ========== Nav + Hero + 信任列 ========== -->
  <div class="relative overflow-hidden bg-[radial-gradient(ellipse_1300px_900px_at_30%_0%,rgba(0,159,183,0.22)_0%,rgba(0,159,183,0.06)_50%,transparent_75%)]">

    <!-- ---------- Nav ---------- -->
    <AppHeader cta-href="#platforms" />

    <!-- ---------- Hero ---------- -->
    <section class="relative z-1 pt-16 pb-16">
      <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
        <div class="flex flex-col items-center gap-8 text-center max-w-4xl mx-auto">

          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-brand-surface border border-brand-border text-brand font-sans font-bold text-sm">
            <span>{{ $t('download.hero.badge') }}</span>
          </div>

          <h1 class="font-sans font-black text-[48px] max-md:text-[36px] max-sm:text-[28px] leading-[1.2] text-brand">
            <span class="text-ink-900">{{ $t('download.hero.titleLead') }}</span> PromptBox
          </h1>

          <p class="font-sans font-normal text-xl max-md:text-lg text-ink-800 leading-relaxed">
            {{ $t('download.hero.lead') }}
          </p>

          <div class="flex flex-col items-center gap-3 w-full sm:w-auto">
            <a
              class="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-pill bg-brand hover:bg-brand-hover text-white font-sans font-bold text-xl leading-snug transition duration-150 active:translate-y-px shadow-btn w-full sm:w-auto"
              data-os-cta
              :href="heroHref"
            >
              <span :class="['icon', macSoon ? 'icon--apple' : 'icon--computer']" aria-hidden="true" />
              <span data-os-label>{{ heroLabel }}</span>
            </a>
            <span class="text-sm text-ink-500 font-sans" data-os-note>{{ heroNote }}</span>
          </div>

        </div>
      </div>
    </section>

  </div>

  <!-- ========== 信任指標列 ========== -->
  <section class="py-6 bg-surface-card border-y border-line-200" :aria-label="$t('download.trust.aria')">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="flex justify-between items-center gap-6 flex-wrap max-lg:justify-center max-lg:gap-8">
        <div class="flex items-center gap-3 shrink-0">
          <span class="icon icon--check text-brand" aria-hidden="true" />
          <span class="font-sans font-medium text-base text-ink-800">{{ $t('download.trust.t1') }}</span>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span class="icon icon--lock text-brand" aria-hidden="true" />
          <span class="font-sans font-medium text-base text-ink-800">{{ $t('download.trust.t2') }}</span>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span class="icon icon--gift text-brand" aria-hidden="true" />
          <span class="font-sans font-medium text-base text-ink-800">{{ $t('download.trust.t3') }}</span>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span class="icon icon--devices text-brand" aria-hidden="true" />
          <span class="font-sans font-medium text-base text-ink-800">{{ $t('download.trust.t4') }}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== 平台下載卡片區 ========== -->
  <section id="platforms" class="scroll-mt-24 py-20 max-md:py-12 bg-surface-page">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">

      <div class="text-center max-w-2xl mx-auto mb-14">
        <h2 class="font-sans font-bold text-3xl max-md:text-2xl text-ink-900 mb-3">{{ $t('download.platforms.title') }}</h2>
        <p class="text-ink-500 text-base">{{ $t('download.platforms.lead') }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

        <!-- Windows 平台卡片 -->
        <div :class="['gradient-border-card bg-surface-card rounded-2xl p-8 max-md:p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl', os === 'win' ? 'ring-2 ring-brand shadow-xl' : '']" data-platform="win">
          <div class="flex flex-col gap-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="w-12 h-12 rounded-xl bg-brand-surface flex items-center justify-center text-brand">
                  <span class="icon icon--computer" />
                </span>
                <div>
                  <h3 class="font-sans font-bold text-2xl text-ink-900">Windows</h3>
                  <span class="text-xs font-mono text-ink-500">{{ $t('download.platforms.win.requirement') }}</span>
                </div>
              </div>
              <span data-recommended-badge :class="[os === 'win' ? '' : 'hidden', 'px-3 py-1 bg-brand text-white rounded-pill text-xs font-bold font-sans']">
                {{ $t('download.platforms.recommendedBadge') }}
              </span>
            </div>

            <p class="text-ink-700 text-sm leading-relaxed">
              {{ $t('download.platforms.win.body') }}
            </p>

            <ul class="flex flex-col gap-2.5 text-sm text-ink-600 border-t border-line-200 pt-4">
              <li class="flex items-center gap-2">
                <span class="icon icon--check text-brand w-4 h-4" />
                <span>{{ $t('download.platforms.win.f1pre') }}<code>.exe</code>{{ $t('download.platforms.win.f1post') }}</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="icon icon--check text-brand w-4 h-4" />
                <span>{{ $t('download.platforms.win.f2pre') }}<code>.zip</code>{{ $t('download.platforms.win.f2post') }}</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="icon icon--check text-brand w-4 h-4" />
                <span>{{ $t('download.platforms.win.f3') }}</span>
              </li>
            </ul>
          </div>

          <div class="pt-8 flex flex-col items-center gap-3">
            <a
              class="inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-md bg-brand hover:bg-brand-hover text-white font-sans font-bold text-base transition shadow-btn"
              :href="WIN_EXE.href"
            >
              <span class="icon icon--computer" />
              <span>{{ $t('download.platforms.win.cta') }}</span>
              <span class="font-normal text-white/75">({{ WIN_EXE.size }})</span>
            </a>
            <a
              class="text-sm text-ink-500 hover:text-brand underline underline-offset-4 transition-colors"
              :href="WIN_ZIP.href"
            >{{ $t('download.platforms.win.ctaPortable') }} ({{ WIN_ZIP.size }})</a>
          </div>
        </div>

        <!-- macOS 平台卡片 -->
        <div :class="['gradient-border-card bg-surface-card rounded-2xl p-8 max-md:p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl', os === 'mac' ? 'ring-2 ring-brand shadow-xl' : '']" data-platform="mac">
          <div class="flex flex-col gap-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="w-12 h-12 rounded-xl bg-brand-surface flex items-center justify-center text-brand">
                  <span class="icon icon--apple" />
                </span>
                <div>
                  <h3 class="font-sans font-bold text-2xl text-ink-900">macOS</h3>
                  <span class="text-xs font-mono text-ink-500">{{ $t('download.platforms.mac.requirement') }}</span>
                </div>
              </div>
              <span class="px-3 py-1 bg-surface-subtle border border-line-300 text-ink-600 rounded-pill text-xs font-bold font-sans">
                {{ $t('download.platforms.mac.soonBadge') }}
              </span>
            </div>

            <p class="text-ink-700 text-sm leading-relaxed">
              {{ $t('download.platforms.mac.body') }}
            </p>

            <ul class="flex flex-col gap-2.5 text-sm text-ink-600 border-t border-line-200 pt-4">
              <li class="flex items-center gap-2">
                <span class="icon icon--check text-brand w-4 h-4" />
                <span>{{ $t('download.platforms.mac.f1pre') }}<code>.dmg</code>{{ $t('download.platforms.mac.f1post') }}</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="icon icon--check text-brand w-4 h-4" />
                <span>{{ $t('download.platforms.mac.f2') }}</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="icon icon--check text-brand w-4 h-4" />
                <span>{{ $t('download.platforms.mac.f3') }}</span>
              </li>
            </ul>
          </div>

          <div class="pt-8 flex flex-col items-center gap-3">
            <!--
              沒有 macOS 檔案就不給下載鈕。導向本頁的訂閱表單 ——
              它正好是「東西好了怎麼通知你」的答案（F4）。
            -->
            <a
              class="inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-md bg-surface-subtle border border-line-300 hover:border-brand hover:text-brand text-ink-800 font-sans font-bold text-base transition"
              href="#subscribe"
            >
              <span class="icon icon--apple" />
              <span>{{ $t('download.platforms.mac.ctaSoon') }}</span>
            </a>
            <span class="text-sm text-ink-500 text-center">{{ $t('download.platforms.mac.soonNote') }}</span>
          </div>
        </div>

      </div>

      <!--
        F11：文案不再說「開源發布於 GitHub Releases」，改說「官網直接發布 + 附校驗碼」。
        這一區就是那句話的兌現處 —— 沒有它，新文案只是把一句假話換成另一句。
      -->
      <div class="max-w-4xl mx-auto mt-10 p-6 max-md:p-5 rounded-2xl bg-surface-card border border-line-200">
        <h3 class="font-sans font-bold text-base text-ink-900 mb-1">{{ $t('download.checksum.title') }}</h3>
        <p class="text-sm text-ink-600 mb-4">{{ $t('download.checksum.lead') }}</p>

        <dl class="flex flex-col gap-3 mb-4">
          <div
            v-for="f in [
              { label: $t('download.checksum.exeLabel'), hash: WIN_EXE.sha256 },
              { label: $t('download.checksum.zipLabel'), hash: WIN_ZIP.sha256 },
            ]"
            :key="f.hash"
            class="flex flex-col gap-1"
          >
            <dt class="text-xs font-sans font-bold text-ink-700">{{ f.label }}</dt>
            <dd class="font-mono text-xs text-ink-600 break-all select-all">{{ f.hash }}</dd>
          </div>
        </dl>

        <div class="flex flex-col gap-2 text-xs text-ink-500 border-t border-line-200 pt-4">
          <p>
            <span class="font-sans font-bold text-ink-700">{{ $t('download.checksum.verifyWin') }}</span>
            <code class="select-all ml-2">Get-FileHash .\PromptBox-Setup-3.7.1.exe -Algorithm SHA256</code>
          </p>
          <p>
            <span class="font-sans font-bold text-ink-700">{{ $t('download.checksum.verifyUnix') }}</span>
            <code class="select-all ml-2">shasum -a 256 PromptBox-Setup-3.7.1.exe</code>
          </p>
        </div>
      </div>

    </div>
  </section>

  <!-- ========== 3 步驟 1 分鐘快速開始 ========== -->
  <section class="py-20 max-md:py-12 bg-surface-card">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">

      <div class="text-center max-w-2xl mx-auto mb-16">
        <span class="text-brand font-bold text-sm tracking-wider uppercase">{{ $t('download.quickstart.eyebrow') }}</span>
        <h2 class="font-sans font-black text-4xl max-md:text-3xl text-ink-900 mt-2">{{ $t('download.quickstart.title') }}</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

        <!-- Step 1 -->
        <div class="p-8 rounded-2xl bg-surface-subtle border border-line-200 flex flex-col gap-4 relative">
          <div class="w-12 h-12 rounded-xl bg-brand text-white font-accent font-bold text-2xl flex items-center justify-center shadow-md">
            1
          </div>
          <h3 class="font-sans font-bold text-xl text-ink-900">{{ $t('download.quickstart.s1.title') }}</h3>
          <p class="text-ink-600 text-sm leading-relaxed">
            {{ $t('download.quickstart.s1.body') }}
          </p>
        </div>

        <!-- Step 2 -->
        <div class="p-8 rounded-2xl bg-surface-subtle border border-line-200 flex flex-col gap-4 relative">
          <div class="w-12 h-12 rounded-xl bg-brand text-white font-accent font-bold text-2xl flex items-center justify-center shadow-md">
            2
          </div>
          <h3 class="font-sans font-bold text-xl text-ink-900">{{ $t('download.quickstart.s2.title') }}</h3>
          <p class="text-ink-600 text-sm leading-relaxed">
            {{ $t('download.quickstart.s2.body') }}
          </p>
        </div>

        <!-- Step 3 -->
        <div class="p-8 rounded-2xl bg-surface-subtle border border-line-200 flex flex-col gap-4 relative">
          <div class="w-12 h-12 rounded-xl bg-brand text-white font-accent font-bold text-2xl flex items-center justify-center shadow-md">
            3
          </div>
          <h3 class="font-sans font-bold text-xl text-ink-900">{{ $t('download.quickstart.s3.title') }}</h3>
          <p class="text-ink-600 text-sm leading-relaxed">
            {{ $t('download.quickstart.s3.body') }}
          </p>
        </div>

      </div>

    </div>
  </section>

  <!-- ========== 安裝與升級注意事項 ========== -->
  <section class="py-20 max-md:py-12 bg-surface-page">
    <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
      <div class="max-w-3xl mx-auto">

        <div class="text-center mb-10">
          <span class="text-brand font-bold text-sm tracking-wider uppercase">{{ $t('download.notes.eyebrow') }}</span>
          <h2 class="font-sans font-bold text-3xl text-ink-900 mt-2">{{ $t('download.notes.title') }}</h2>
        </div>

        <div class="space-y-4">
          <!--
            這一則不是要使用者「忽略警告」—— 那是惡意軟體散布頁的句型。
            它解釋的是那句警告【實際上在說什麼】：Windows 無法把檔案對應到
            已驗證的發行者，而這完全屬實（我們還沒買憑證）。
            長版在 content/docs/9.install-safety.md。
          -->
          <div class="notice notice-warning">
            <span class="icon icon--lock text-amber-500 shrink-0 mt-1" aria-hidden="true" />
            <div>
              <strong class="text-ink-900 font-bold block mb-1">{{ $t('download.notes.n4.title') }}</strong>
              <p class="text-sm text-ink-700">
                {{ $t('download.notes.n4.bodyPre') }}<NuxtLink class="text-brand underline underline-offset-2 hover:text-brand-hover" :to="localePath('/docs') + '#install-safety'">{{ $t('download.notes.n4.linkLabel') }}</NuxtLink>{{ $t('download.notes.n4.bodyPost') }}
              </p>
            </div>
          </div>

          <div class="notice notice-info">
            <span class="icon icon--check text-brand shrink-0 mt-1" aria-hidden="true" />
            <div>
              <strong class="text-ink-900 font-bold block mb-1">{{ $t('download.notes.n1.title') }}</strong>
              <p class="text-sm text-ink-700">{{ $t('download.notes.n1.body') }}</p>
            </div>
          </div>

          <div class="notice notice-info">
            <span class="icon icon--lock text-brand shrink-0 mt-1" aria-hidden="true" />
            <div>
              <strong class="text-ink-900 font-bold block mb-1">{{ $t('download.notes.n2.title') }}</strong>
              <p class="text-sm text-ink-700">{{ $t('download.notes.n2.body') }}</p>
            </div>
          </div>

          <div class="notice notice-warning">
            <span class="icon icon--gift text-amber-500 shrink-0 mt-1" aria-hidden="true" />
            <div>
              <strong class="text-ink-900 font-bold block mb-1">{{ $t('download.notes.n3.title') }}</strong>
              <p class="text-sm text-ink-700">{{ $t('download.notes.n3.bodyPre') }}<code>promptbox.db.plain.bak</code>{{ $t('download.notes.n3.bodyPost') }}</p>
            </div>
          </div>
        </div>

        <!--
          F4：下載頁是「拿到 App 的那一刻」，也是最該告訴使用者
          「我們不會自動更新，新版只會用 email 通知」的位置。
        -->
        <div class="mt-10">
          <SubscribeForm kind="updates" />
        </div>

      </div>
    </div>
  </section>

  <!-- ========== Footer ========== -->
  <AppFooter />
</template>
