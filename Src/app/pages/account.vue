<script setup lang="ts">
/**
 * 會員與個人帳號專區（階段五 5a+，2026-09-14 上線）
 *
 * 規範依據：Docs/webplan/PRD_階段五_會員與帳號中心.md
 *
 * 架構特點：
 * 1. 純 SPA 客戶端渲染（routeRules: { '/account': { ssr: false } }），
 *    消除 SSG 預繪與 Auth 的 Hydration 衝突。
 * 2. 支援安全降級：當 SUPABASE_URL 未設定時，介面以「展示模式」安全呈現，
 *    不噴錯、不壞版，並提供所有卡片之 UI 互動預覽。
 * 3. 整合 Q12 方案 A：Pro 授權碼直接以 compact JWS 文字框展示，支援一鍵複製。
 * 4. 快速下載端點改走 /dl/[platform] 語意化轉址路由。
 */
import { ref, computed } from 'vue'

const { t } = useI18n()
const localePath = useLocalePath()

useHead({
  title: () => t('account.meta.title'),
  meta: [{ name: 'description', content: () => t('account.meta.description') }],
})

// ── Supabase Auth 狀態 ──────────────────────────────────────────────
const user = useSupabaseUser()
const supabase = useSupabaseClient()

// 偵測是否已綁定真實 Supabase 專案（若使用預設 placeholder 則判定為展示模式）
const isConfigured = computed(() => {
  try {
    const url = (supabase as any)?.supabaseUrl || ''
    return url && !url.includes('placeholder.supabase.co')
  } catch {
    return false
  }
})

// 登入中與登出狀態
const isLoggingIn = ref(false)
const loginError = ref('')

const handleSignIn = async () => {
  loginError.value = ''
  if (!isConfigured.value) return

  isLoggingIn.value = true
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/account` : undefined,
      },
    })
    if (error) throw error
  } catch (err: any) {
    loginError.value = err.message || '登入失敗，請稍後再試'
  } finally {
    isLoggingIn.value = false
  }
}

const handleSignOut = async () => {
  try {
    await supabase.auth.signOut()
  } catch (err: any) {
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

// ── 早鳥席次資格 ───────────────────────────────────────────────────
// 5a+：登入使用者即享有早鳥資格標識
const hasEarlyBird = computed(() => !!user.value)

// ── 授權憑證（Q12 方案 A UI 骨架） ──────────────────────────────────
const copied = ref(false)
const sampleLicenseKey = ref('eyJhbGciOiJFZERTQSIsInR5cCI6InBiZW50K2p3cyIsImtpZCI6IksyMDI2QSJ9.eyJ2IjoxLCJpc3MiOiJwcm9tcHRib3guYXBwIiwic3ViIjoidXNlckBleGFtcGxlLmNvbSIsInBsYW4iOiJwcm8iLCJzZWF0IjoxLCJqdGkiOiJwYl90ZXN0XzIwMjZhIn0.sample_signature_preview')

const copyLicenseKey = async () => {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(sampleLicenseKey.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

// ── 快速下載連結（對齊最新 v3.9.4） ───────────────────────────────
const DOWNLOADS = [
  {
    key: 'winExe',
    labelKey: 'account.downloads.winExe',
    href: '/dl/win',
    icon: 'icon--win',
    badge: 'v3.9.4 · 116.6 MB',
  },
  {
    key: 'winZip',
    labelKey: 'account.downloads.winZip',
    href: '/dl/win-zip',
    icon: 'icon--win',
    badge: 'v3.9.4 · 160.7 MB',
  },
  {
    key: 'macDmg',
    labelKey: 'account.downloads.macDmg',
    href: '/dl/mac',
    icon: 'icon--apple',
    badge: 'v3.9.4 · 126.8 MB',
  },
]
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

        <!-- 尚未設定 Supabase 環境變數時的展示模式提醒 -->
        <div
          v-if="!isConfigured"
          class="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3"
        >
          <span class="icon icon--warning shrink-0 mt-0.5" aria-hidden="true" />
          <div class="text-sm leading-relaxed">
            <p class="font-bold">{{ $t('account.offlineNotice.title') }}</p>
            <p class="text-xs opacity-90 mt-1">{{ $t('account.offlineNotice.desc') }}</p>
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
                <span v-else class="icon icon--user text-brand text-2xl" aria-hidden="true" />
              </div>
              <!-- 帳號資訊 -->
              <div>
                <h2 class="text-xl font-bold font-sans text-ink-900 flex items-center gap-3">
                  {{ displayName }}
                  <span
                    v-if="user"
                    class="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  >
                    Google 已連結
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
                :disabled="!isConfigured || isLoggingIn"
                class="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-sm font-sans font-medium text-base shadow-btn transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                @click="handleSignIn"
              >
                <span class="icon icon--google" aria-hidden="true" />
                <span>{{ isLoggingIn ? '連線中...' : $t('account.profile.signInWithGoogle') }}</span>
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

          <!-- 早鳥資格標記徽章（FR-27B） -->
          <div
            v-if="hasEarlyBird"
            class="mt-6 pt-6 border-t border-line-300 flex items-center gap-3.5 bg-brand-surface/40 p-4 rounded-lg border border-brand-border/40"
          >
            <span class="icon icon--award text-brand shrink-0" aria-hidden="true" />
            <div class="text-sm">
              <span class="font-bold text-brand">{{ $t('account.earlyBird.badge') }}</span>
              <p class="text-ink-600 text-xs mt-0.5">{{ $t('account.earlyBird.desc') }}</p>
            </div>
          </div>
        </section>

        <!-- 第二區塊：授權憑證展示槽（FR-27A Q12 方案 A） -->
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
              <span>{{ $t('account.license.upgradeBtn') }}</span>
              <span class="icon icon--arrow-right text-xs" aria-hidden="true" />
            </NuxtLink>
          </div>

          <!-- 授權碼卡片（Q12 A 方案可複製文字框） -->
          <div class="p-4 rounded-lg bg-surface-card border border-line-400 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-medium text-ink-500 uppercase tracking-wider">Ed25519 Compact JWS License Key</span>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand/10 hover:bg-brand/20 text-brand text-xs font-semibold transition cursor-pointer"
                @click="copyLicenseKey"
              >
                <span class="icon icon--copy" aria-hidden="true" />
                <span>{{ copied ? $t('account.license.copied') : $t('account.license.copyKey') }}</span>
              </button>
            </div>
            <div class="p-3 rounded bg-surface-page border border-line-300 font-mono text-xs text-ink-600 break-all select-all leading-relaxed">
              {{ sampleLicenseKey }}
            </div>
            <p class="text-xs text-ink-500 leading-relaxed">
              💡 {{ $t('account.license.q12Note') }}
            </p>
          </div>
        </section>

        <!-- 第三區塊：快速下載專區（FR-27C 語意化 /dl/ 轉址） -->
        <section class="p-6 md:p-8 rounded-xl bg-[var(--glass-nav)] border border-line-400 backdrop-blur-md shadow-sm space-y-6">
          <div>
            <h3 class="text-lg font-bold font-sans text-ink-900">{{ $t('account.downloads.title') }}</h3>
            <p class="text-sm text-ink-600 mt-1">{{ $t('account.downloads.desc') }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              v-for="dl in DOWNLOADS"
              :key="dl.key"
              :href="dl.href"
              class="group p-5 rounded-lg border border-line-400 bg-surface-card hover:border-brand hover:shadow-md transition duration-150 flex flex-col justify-between gap-4"
            >
              <div class="flex items-start justify-between">
                <span :class="['icon', dl.icon, 'text-2xl text-brand']" aria-hidden="true" />
                <span class="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-line-300 text-ink-600">
                  {{ dl.badge }}
                </span>
              </div>
              <div>
                <p class="font-sans font-bold text-sm text-ink-900 group-hover:text-brand transition-colors">
                  {{ $t(dl.labelKey) }}
                </p>
                <p class="font-mono text-xs text-ink-400 mt-1 flex items-center gap-1">
                  <span>{{ dl.href }}</span>
                  <span class="icon icon--arrow-up-right text-[10px]" aria-hidden="true" />
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
