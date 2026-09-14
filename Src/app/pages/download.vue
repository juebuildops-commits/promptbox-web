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
 *    2026-09-10（v3.9.2）起，每一組都是**整顆下載回來實算 SHA-256** 與下面的常數比對過的；
 *    現行這組是 2026-09-12（v3.9.4），由創辦人實算比對。
 *    ⚠️ 不要退回只比 ETag：ETag 是 MD5，與頁面上印的 SHA-256 是**兩種雜湊**，
 *    ETag 相符證明得了「線上檔案 = 本機產物」，證明不了「印出去的校驗碼是對的」。
 *
 * 🔴 檔名與路徑**推導不出來，只能照建置產物逐字抄**：
 *    R2 路徑自 v3.9.2 起多一層版本資料夾（`/V3.9.2/`），而兩顆檔案的命名規則還不一致
 *    （`PromptBox-Setup-3.9.2.exe` 對 `PromptBox-3.9.2-win.zip`；v3.7.1 時的 zip 又叫 `promptbox-v3.7.1.zip`）。
 *    ⇒ ⛔ 不要為了「乾淨」把版號抽成常數再組字串 —— 那會讓下一個人只改版號、而 `sha256` 停在舊值，
 *    正是這條紅線要擋的事。
 *
 * 🔴 `pub-*.r2.dev` 是 Cloudflare 的公用開發網址，官方不建議正式環境長期依賴。
 *    網域到位後（前置鏈 P6）改綁自訂網域，一樣只動這幾行。
 */
const R2 = 'https://pub-c877572083874aada08b285a742dce71.r2.dev'

const WIN_EXE = {
  href: `${R2}/V3.9.4/PromptBox-Setup-3.9.4.exe`,
  size: '116.6 MB',
  sha256: 'beaf83fd32b8520c8ea5f5017730d23e5f34f6453d473d22355a6f99c096b2b1',
}
const WIN_ZIP = {
  href: `${R2}/V3.9.4/PromptBox-3.9.4-win.zip`,
  size: '160.7 MB',
  sha256: 'a12ba94ff8499672c42671bfcde2aaa5b0dac87113bf8849a1dfd86fe2d23ede',
}

const MAC_DMG = {
  href: `${R2}/V3.9.4/PromptBox-3.9.4-arm64.dmg`,
  size: '126.8 MB',
  sha256: '04a44b63095d05c1052c1934089f83b5e04feba04f97875fcb554c62d7aa1a86',
}

/**
 * macOS build 還不存在。在它存在之前，mac 訪客導到訂閱表單 ——
 * 給一個下載不到東西的按鈕，比誠實說「即將推出」傷害大。
 */
const MAC_READY: boolean = true

/**
 * 窄視窗不給下載鈕（2026-09-10 創辦人裁示）。
 *
 * 為什麼：PromptBox 是 Windows 桌面程式，手機與平板裝不起來。給一個按下去
 * 拿到 111 MB 但永遠打不開的檔案，跟 `MAC_READY = false` 那裡的理由是同一條 ——
 * 「下載不到東西的按鈕，比誠實說做不到傷害大」。
 *
 * 🔴 **判定走 CSS 斷點（`lg:` = 1024px），不是 JS 偵測 UA。**
 *    這是創辦人在兩個方案之間挑的，兩者誤判方向相反，取捨已知並接受：
 *      · 桌機把視窗拉窄 ⇒ **會被誤擋**（代價：由 `desktopOnly.note` 的第二句
 *        「拉寬視窗就會出現」承擔 —— 那句話不是客套，是這個誤判唯一的出路）
 *      · iPad 桌面版網站（寬度 ≥1024）⇒ **擋不到**
 *    要改成看裝置就得回頭走 UA + `maxTouchPoints`，那是另一個決定，別順手改。
 *    門檻沿用 `demo.vue` 已經寫死的 `(min-width: 1024px)`，全站只有一個「需要桌機寬度」的定義。
 *
 * 🔴 **實作是「換掉元素」，不是「把連結藏起來」。**
 *    窄視窗下 DOM 裡根本沒有那三個 `href`，換上的是 `<button disabled>` 與純文字。
 *    不要改成 `pointer-events: none` —— 那只擋滑鼠，Tab + Enter 照樣按得下去，
 *    而且螢幕閱讀器還是會把它報成一個可用的連結。
 *    副作用（已知）：Googlebot 以手機視埠算繪，索引到的是灰鈕文案而不是下載連結。
 *    R2 的檔案位址本來就不是要被索引的頁面節點，`meta` 與其餘內容一個字都沒變。
 */
const macSoon = computed(() => !MAC_READY && os.value === 'mac')
const heroHref = computed(() => {
  if (macSoon.value) return '#subscribe'
  if (os.value === 'mac') return MAC_DMG.href
  return WIN_EXE.href
})
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
            <!-- ≥1024px：真的行動點 -->
            <a
              class="hidden lg:inline-flex items-center justify-center gap-3 px-10 py-5 rounded-pill bg-brand hover:bg-brand-hover text-white font-sans font-bold text-xl leading-snug transition duration-150 active:translate-y-px shadow-btn w-full sm:w-auto"
              data-os-cta
              :href="heroHref"
            >
              <span :class="['icon', os === 'mac' ? 'icon--apple' : 'icon--computer']" aria-hidden="true" />
              <span data-os-label>{{ heroLabel }}</span>
            </a>
            <!-- <1024px：不是被停用的連結，是一顆真的停用鈕（見 script 的說明） -->
            <button
              type="button"
              disabled
              class="inline-flex lg:hidden items-center justify-center gap-3 px-10 py-5 rounded-pill bg-surface-muted border border-line-300 text-ink-500 font-sans font-bold text-xl leading-snug cursor-not-allowed w-full sm:w-auto"
            >
              <span class="icon icon--computer" aria-hidden="true" />
              <span>{{ $t('download.desktopOnly.cta') }}</span>
            </button>
            <span class="hidden lg:inline text-sm text-ink-500 font-sans" data-os-note>{{ heroNote }}</span>
            <span class="lg:hidden text-sm text-ink-500 font-sans text-center">{{ $t('download.desktopOnly.note') }}</span>
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
            <!-- ≥1024px：兩個真的下載連結 -->
            <a
              class="hidden lg:inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-md bg-brand hover:bg-brand-hover text-white font-sans font-bold text-base transition shadow-btn"
              :href="WIN_EXE.href"
            >
              <span class="icon icon--computer" />
              <span>{{ $t('download.platforms.win.cta') }}</span>
              <span class="font-normal text-white/75">({{ WIN_EXE.size }})</span>
            </a>
            <a
              class="hidden lg:inline text-sm text-ink-500 hover:text-brand underline underline-offset-4 transition-colors"
              :href="WIN_ZIP.href"
            >{{ $t('download.platforms.win.ctaPortable') }} ({{ WIN_ZIP.size }})</a>

            <!--
              <1024px：換成停用鈕 + 灰掉的便攜版字樣 + 一句為什麼。
              體積照舊印出來 —— 使用者要知道自己等一下回到電腦前要抓多大的東西。
            -->
            <button
              type="button"
              disabled
              class="inline-flex lg:hidden items-center justify-center gap-2 w-full py-4 px-6 rounded-md bg-surface-muted border border-line-300 text-ink-500 font-sans font-bold text-base cursor-not-allowed"
            >
              <span class="icon icon--computer" aria-hidden="true" />
              <span>{{ $t('download.desktopOnly.cta') }}</span>
              <span class="font-normal">({{ WIN_EXE.size }})</span>
            </button>
            <span class="lg:hidden text-sm text-ink-400">{{ $t('download.platforms.win.ctaPortable') }} ({{ WIN_ZIP.size }})</span>
            <span class="lg:hidden text-sm text-ink-500 text-center">{{ $t('download.desktopOnly.cardNote') }}</span>
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
              <span data-recommended-badge :class="[os === 'mac' ? '' : 'hidden', 'px-3 py-1 bg-brand text-white rounded-pill text-xs font-bold font-sans']">
                {{ $t('download.platforms.recommendedBadge') }}
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
            <!-- ≥1024px：macOS 下載連結 -->
            <a
              class="hidden lg:inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-md bg-brand hover:bg-brand-hover text-white font-sans font-bold text-base transition shadow-btn"
              :href="MAC_DMG.href"
            >
              <span class="icon icon--apple" />
              <span>{{ $t('download.platforms.mac.cta') }}</span>
              <span class="font-normal text-white/75">({{ MAC_DMG.size }})</span>
            </a>

            <!--
              <1024px：換成停用鈕 + 一句為什麼。
            -->
            <button
              type="button"
              disabled
              class="inline-flex lg:hidden items-center justify-center gap-2 w-full py-4 px-6 rounded-md bg-surface-muted border border-line-300 text-ink-500 font-sans font-bold text-base cursor-not-allowed"
            >
              <span class="icon icon--apple" aria-hidden="true" />
              <span>{{ $t('download.desktopOnly.cta') }}</span>
              <span class="font-normal">({{ MAC_DMG.size }})</span>
            </button>
            <span class="lg:hidden text-sm text-ink-500 text-center">{{ $t('download.desktopOnly.cardNote') }}</span>
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
              { label: $t('download.checksum.dmgLabel'), hash: MAC_DMG.sha256 },
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
            <code class="select-all ml-2">Get-FileHash .\PromptBox-Setup-3.9.4.exe -Algorithm SHA256</code>
          </p>
          <p>
            <span class="font-sans font-bold text-ink-700">{{ $t('download.checksum.verifyUnix') }}</span>
            <code class="select-all ml-2">shasum -a 256 PromptBox-3.9.4-arm64.dmg</code>
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

          <!--
            2026-08-31：移除「從 v2.x 升級」那一則（原 n3）。
            產品尚未發布、沒有任何既有使用者，**沒有人是從 v2.x 升上來的** ——
            對全部都是新安裝的讀者說明舊庫備份，只會讓人以為自己漏了一個步驟。
            App 的備份行為本身不變（見 appsync/身分字串凍結清單 的 `vault.db.plain.bak`，
            v3.7.2 起由 `promptbox.db.plain.bak` 改名），
            首發後若真的出現 v2 使用者，再把這一則加回來。
          -->
        </div>

        <!--
          5a+：會員中心引導卡片（增加註冊動機、提供已登入會員快速通道）
        -->
        <div class="mt-8 p-6 rounded-2xl bg-surface-card border border-brand-border/60 hover:border-brand-border transition-colors shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-brand-surface text-brand flex items-center justify-center shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <strong class="text-ink-900 font-bold font-sans text-base block">{{ $t('download.accountLead.title') }}</strong>
              <p class="text-sm text-ink-600 mt-0.5">{{ $t('download.accountLead.body') }}</p>
            </div>
          </div>
          <NuxtLink
            :to="localePath('/account')"
            class="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-brand hover:bg-brand-hover text-white font-sans font-medium text-sm transition shadow-btn"
          >
            <span>{{ $t('download.accountLead.cta') }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
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
