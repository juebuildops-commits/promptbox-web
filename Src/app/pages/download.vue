<script setup lang="ts">
import { DOWNLOADS, downloadFilename } from '#shared/downloads'

// FR-4：作業系統偵測（原 js/main.js 的 detectOS + CTA 文案替換 + 平台卡高亮）
const { os, ctaLabel, osNote } = useOsDetect()

const { t } = useI18n()
const localePath = useLocalePath()
const { available: memberLoginAvailable } = useMemberLogin()

/**
 * 安裝檔的 `href`／`size`／`sha256` 住在 `shared/downloads.ts`（唯一來源，與 `/dl` 端點、會員專區共用）。
 * 🔴 `href` 與 `sha256` 必須成對更新 —— 為什麼、以及為什麼不能用版號組字串，都寫在那個檔案的檔頭。
 */
const WIN_EXE = DOWNLOADS['win']
const WIN_ZIP = DOWNLOADS['win-zip']
const MAC_DMG = DOWNLOADS['mac']

/**
 * macOS（Apple Silicon）build 自 2026-09-14 起提供；2026-09-18～09-27 因 v3.10.0 沒有 mac build 而暫停（WL-006 §2-1）。
 * 🔴 **2026-09-27 重新上架**（WL-006 §2-3）：v3.10.0 的 `.dmg` 已發佈到 R2，`shared/downloads.ts` 加回了 `mac` 那一組。
 *    最低需求同時從 macOS 12 改成 **macOS 13 (Ventura)**：App 用 Electron 44，而 **Electron 44 起不支援 macOS 12**
 *    （App 側回覆 3 §二 W7）。⚠️ 這個數字沒有任何護欄在守，Electron 升大版時要自己重查。
 * 🔴 它**沒有 Apple 開發者簽章、沒有公證**（前置鏈 P4 未啟動）⇒ 第一次開啟會被 Gatekeeper 擋下，
 *    這件事由 `notes.n5` 與手冊第 9 節揭露；mac 上的資料延續（`app.setName` 對 Keychain 的保護）也還沒實機驗證過。
 * 設回 `false` ⇒ mac 訪客改導到訂閱表單並顯示「即將推出」（下載不到東西的按鈕，比誠實說做不到傷害大）。
 * ⚠️ 設回 false 時，首頁 CTA、`home.trust.platforms`／`faq.a3`／`faq.a4`、下載頁 meta 與 `notes.n5` 要一起改口。
 */
const MAC_READY: boolean = true

/**
 * 窄視窗不給下載鈕（2026-09-10 創辦人裁示）。
 *
 * 為什麼：PromptBox 是桌面程式（Windows／macOS），手機與平板裝不起來。給一個按下去
 * 拿到 100 MB 以上但永遠打不開的檔案，跟 `MAC_READY = false` 那裡的理由是同一條 ——
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
            <!-- 檔名加引號：v3.10.0 起安裝檔名含空白（`PromptBox Setup 3.10.0.exe`），不加引號 PowerShell 會拆成三個參數 -->
            <code class="select-all ml-2">Get-FileHash ".\{{ downloadFilename(WIN_EXE) }}" -Algorithm SHA256</code>
          </p>
          <p>
            <span class="font-sans font-bold text-ink-700">{{ $t('download.checksum.verifyUnix') }}</span>
            <code class="select-all ml-2">shasum -a 256 {{ downloadFilename(MAC_DMG) }}</code>
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

          <!--
            n5：macOS 版的同一種揭露（2026-09-15）。與 n4 同一個框架 —— 解釋警告在說什麼、先核對校驗碼，
            不教人繞過檢查（怎麼打開交給手冊引 Apple 官方說明）。
            後半句的資料延續但書不能拿掉：mac 上的覆蓋安裝還沒實機驗過（App事實依據、身分字串凍結清單 A-3）。
          -->
          <div v-if="MAC_READY" class="notice notice-warning">
            <span class="icon icon--apple text-amber-500 shrink-0 mt-1" aria-hidden="true" />
            <div>
              <strong class="text-ink-900 font-bold block mb-1">{{ $t('download.notes.n5.title') }}</strong>
              <p class="text-sm text-ink-700">
                {{ $t('download.notes.n5.bodyPre') }}<NuxtLink class="text-brand underline underline-offset-2 hover:text-brand-hover" :to="localePath('/docs') + '#install-safety'">{{ $t('download.notes.n5.linkLabel') }}</NuxtLink>{{ $t('download.notes.n5.bodyPost') }}
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
          5a+：會員中心引導卡片。
          🔴 只在會員登入真的接上 Supabase 時出現 —— 登入沒開放的期間，「已經登入過？」
          是一句對誰都不成立的話，而這張卡唯一的目的地是一個登不進去的頁（與 /enterprise 不進導覽同一個理由）。
        -->
        <div v-if="memberLoginAvailable" class="mt-8 p-6 rounded-2xl bg-surface-card border border-brand-border/60 hover:border-brand-border transition-colors shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
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
