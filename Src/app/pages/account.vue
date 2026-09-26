<script setup lang="ts">
/**
 * 會員與個人帳號專區（階段五 5a+）
 *
 * 規範依據：Docs/webplan/PRD_階段五_會員與帳號中心.md
 *
 * 1. 純 SPA：nuxt.config.ts 的 routeRules 對三個語系各設 `ssr: false`。
 *    登入狀態只存在瀏覽器，預繪出來的 HTML 必然是「未登入」，SSR 只會製造水合落差。
 * 2. 安全降級：Supabase 未設定（`useMemberLogin().available` 為 false）時，
 *    頁面誠實說「會員登入尚未開放」、登入鈕停用，不噴錯、不壞版。
 * 3. 🔴 這頁上的每一句話都要在「現在」成立（誠實紅線 C1／C2，見主張與依據 §二之六）：
 *    - 早鳥徽章（FR-27B）要先比對 Buttondown 名單才能點亮。比對還沒做 ⇒ **不顯示任何資格**。
 *      不要改回「登入即顯示」—— 那等於對每一個登入者宣稱他在前 150 名裡。
 *    - 授權碼（Q12 方案 A）在金流開通前不存在 ⇒ 顯示空狀態，**不放範例字串**。
 *      範例 JWS 旁邊擺一顆複製鈕，等於請使用者拿一串假憑證去啟用 App。
 *    - 下載連結與公開下載頁是同一批檔案、沒有閘門 ⇒ 不稱「會員專屬」。
 * 4. 下載走 /dl/[platform]（FR-27C）；版號與大小取自 shared/downloads.ts，本檔不另寫。
 */
import { DOWNLOADS, DOWNLOAD_VERSION, downloadFilename } from '#shared/downloads'

const { t } = useI18n()
const localePath = useLocalePath()
const { available } = useMemberLogin()

useHead({
  title: () => t('account.meta.title'),
  meta: [{ name: 'description', content: () => t('account.meta.description') }],
})

// ── Supabase Auth 狀態 ──────────────────────────────────────────────
const user = useSupabaseUser()
const supabase = useSupabaseClient()

const isLoggingIn = ref(false)
const loginError = ref('')

const handleSignIn = async () => {
  loginError.value = ''
  if (!available.value) return

  isLoggingIn.value = true
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      // 回到「目前語系」的會員專區，不是一律回中文版
      options: { redirectTo: `${window.location.origin}${localePath('/account')}` },
    })
    if (error) throw error
  } catch (err) {
    console.error('Sign in error:', err)
    loginError.value = t('account.profile.signInError')
  } finally {
    isLoggingIn.value = false
  }
}

const handleSignOut = async () => {
  try {
    await supabase.auth.signOut()
  } catch (err) {
    console.error('Sign out error:', err)
  }
}

// ── 個人資料顯示 ───────────────────────────────────────────────────
const displayName = computed(() => {
  if (!user.value) return t('account.profile.guest')
  return (
    user.value.user_metadata?.full_name ||
    user.value.user_metadata?.name ||
    user.value.email?.split('@')[0] ||
    t('account.profile.name')
  )
})

const email = computed(() => user.value?.email || '—')
const avatarUrl = computed(() => user.value?.user_metadata?.avatar_url || null)

// ── 下載卡片（FR-27C） ─────────────────────────────────────────────
// 🔴 這裡每一列的 `platform` 都必須是 `shared/downloads.ts` 的鍵 —— 下方模板直接讀 `DOWNLOADS[card.platform].size`，
//    多一列不存在的平台，整頁會在執行期壞掉（mac 2026-09-18 暫停時就是這樣收的，2026-09-27 加回，WL-006 §2-3）。
//    增減平台時 grid 的欄數要跟著改。
const DOWNLOAD_CARDS = [
  { platform: 'win', labelKey: 'account.downloads.winExe', icon: 'icon--computer' },
  { platform: 'win-zip', labelKey: 'account.downloads.winZip', icon: 'icon--computer' },
  { platform: 'mac', labelKey: 'account.downloads.macDmg', icon: 'icon--apple' },
] as const
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface-page text-ink-800">
    <!-- Header 頂部導覽列 -->
    <div class="relative overflow-hidden bg-[radial-gradient(ellipse_1300px_700px_at_50%_0%,rgba(0,159,183,0.18)_0%,rgba(0,159,183,0.04)_50%,transparent_75%)]">
      <AppHeader header-class="pb-6" />

      <!-- Hero 橫幅 -->
      <section class="relative z-1 pt-8 pb-12">
        <div class="max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 2xl:px-60">
          <div class="flex flex-col items-center gap-4 text-center max-w-2xl mx-auto">
            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-pill bg-brand-surface border border-brand-border text-brand font-sans font-bold text-xs">
              <span>{{ $t('account.hero.badge') }}</span>
            </div>
            <h1 class="font-sans font-black text-3xl md:text-4xl text-ink-900 tracking-tight">
              {{ $t('account.hero.title') }}
            </h1>
            <p class="font-sans text-base text-ink-700">
              {{ $t('account.hero.subtitle') }}
            </p>
          </div>
        </div>
      </section>
    </div>

    <!-- 主體內容 -->
    <main class="flex-1 py-12">
      <div class="max-w-5xl mx-auto px-6 md:px-12 space-y-8">

        <!-- 會員登入尚未接上 Supabase：誠實說還沒開放，而不是描述一個登不進去的功能 -->
        <div v-if="!available" class="notice notice-warning my-0!">
          <span class="icon icon--lock text-amber-500 shrink-0 mt-1" aria-hidden="true" />
          <div>
            <strong class="text-ink-900 font-bold block mb-1">{{ $t('account.offlineNotice.title') }}</strong>
            <p class="text-sm text-ink-700">{{ $t('account.offlineNotice.desc') }}</p>
          </div>
        </div>

        <!-- 錯誤提示 -->
        <div v-if="loginError" class="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm">
          {{ loginError }}
        </div>

        <!-- 第一區塊：個人基本資料與登入狀態 -->
        <section class="p-6 md:p-8 rounded-xl bg-[var(--glass-nav)] border border-line-400 backdrop-blur-md shadow-sm">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div class="flex items-center gap-5">
              <!-- 頭像 -->
              <div class="w-16 h-16 rounded-full overflow-hidden bg-brand-surface border-2 border-brand-border flex items-center justify-center shrink-0">
                <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" class="w-full h-full object-cover">
                <svg v-else class="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <!-- 帳號資訊 -->
              <div>
                <h2 class="text-xl font-bold font-sans text-ink-900 flex items-center gap-3">
                  {{ displayName }}
                  <span
                    v-if="user"
                    class="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  >
                    {{ $t('account.profile.googleLinked') }}
                  </span>
                </h2>
                <p class="text-sm text-ink-500 mt-1 font-mono">{{ email }}</p>
              </div>
            </div>

            <!-- 操作按鈕 -->
            <div class="flex items-center gap-3 w-full md:w-auto">
              <button
                v-if="!user"
                type="button"
                :disabled="!available || isLoggingIn"
                class="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-sm font-sans font-medium text-base shadow-btn transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                @click="handleSignIn"
              >
                {{ isLoggingIn ? $t('account.profile.signingIn') : $t('account.profile.signInWithGoogle') }}
              </button>
              <button
                v-else
                type="button"
                class="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-sm border border-line-400 hover:bg-brand-surface text-ink-700 font-sans font-medium text-sm transition cursor-pointer"
                @click="handleSignOut"
              >
                <span>{{ $t('account.profile.signOut') }}</span>
              </button>
            </div>
          </div>
        </section>

        <!-- 第二區塊：方案與授權憑證（Q12 方案 A 的字串框位置；金流開通前只有空狀態） -->
        <section class="p-6 md:p-8 rounded-xl bg-[var(--glass-nav)] border border-line-400 backdrop-blur-md shadow-sm space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold font-sans text-ink-900">{{ $t('account.license.title') }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-sm text-ink-500">{{ $t('account.license.currentPlan') }}:</span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-surface text-brand border border-brand-border">
                  {{ $t('account.license.freePlan') }}
                </span>
              </div>
            </div>
            <NuxtLink
              :to="localePath('/pricing')"
              class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-surface hover:bg-brand/10 text-brand border border-brand-border rounded-sm font-sans font-semibold text-sm transition"
            >
              {{ $t('account.license.viewPlans') }}
            </NuxtLink>
          </div>

          <div class="p-4 rounded-lg bg-surface-card border border-dashed border-line-400">
            <p class="text-sm font-bold font-sans text-ink-700">{{ $t('account.license.empty') }}</p>
            <p class="text-xs text-ink-500 leading-relaxed mt-1">{{ $t('account.license.emptyNote') }}</p>
          </div>
        </section>

        <!-- 第三區塊：下載（FR-27C /dl 轉址，與公開下載頁同一批檔案） -->
        <section class="p-6 md:p-8 rounded-xl bg-[var(--glass-nav)] border border-line-400 backdrop-blur-md shadow-sm space-y-6">
          <div>
            <h3 class="text-lg font-bold font-sans text-ink-900">{{ $t('account.downloads.title') }}</h3>
            <p class="text-sm text-ink-600 mt-1">
              {{ $t('account.downloads.desc') }}
              <NuxtLink :to="localePath('/download') + '#platforms'" class="text-brand underline underline-offset-2 hover:text-brand-hover">{{ $t('account.downloads.checksumLink') }}</NuxtLink>
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              v-for="card in DOWNLOAD_CARDS"
              :key="card.platform"
              :href="`/dl/${card.platform}`"
              class="group p-5 rounded-lg border border-line-400 bg-surface-card hover:border-brand hover:shadow-md transition duration-150 flex flex-col justify-between gap-4"
            >
              <div class="flex items-start justify-between">
                <span :class="['icon', card.icon, 'text-brand']" aria-hidden="true" />
                <span class="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-line-300 text-ink-600">
                  v{{ DOWNLOAD_VERSION }} · {{ DOWNLOADS[card.platform].size }}
                </span>
              </div>
              <div>
                <p class="font-sans font-bold text-sm text-ink-900 group-hover:text-brand transition-colors">
                  {{ $t(card.labelKey) }}
                </p>
                <p class="font-mono text-xs text-ink-400 mt-1 break-all">
                  {{ downloadFilename(DOWNLOADS[card.platform]) }}
                </p>
              </div>
            </a>
          </div>
        </section>

      </div>
    </main>

    <!-- 頁尾 -->
    <AppFooter />
  </div>
</template>
