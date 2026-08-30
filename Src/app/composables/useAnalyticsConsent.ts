/**
 * D4 / 隱私頁：GA4 的退出開關。
 *
 * 🔴 這裡的「關掉」比業界慣例強一級。
 *
 * 常見做法是讓 gtag 照常載入，再設 `window['ga-disable-<ID>'] = true` 請它
 * 別回報 —— 也就是說追蹤程式碼**還是被下載並執行了**。對一個賣點是
 * 「我們不追蹤你」的產品，這個姿態說不過去。
 *
 * 因此 `nuxt.config.ts` 設了 `gtag.initMode: 'manual'`，由 plugins/
 * analytics.client.ts 在載入前先讀這個開關：關著就**整支 script 都不載**。
 * `disableAnalytics()` 只用來處理「本次瀏覽中途才關掉」的情況（script
 * 已在記憶體裡，收不回來了）。
 */
const KEY = 'pb-analytics'

export function useAnalyticsConsent() {
  const { gtagId } = useRuntimeConfig().public

  /** 站台是否真的設了 GA4。未設定時整個開關是唯讀的說明文字 */
  const available = computed(() => Boolean(gtagId))

  // SSR / 預繪時沒有 localStorage。預設值必須與 plugin 的預設值一致
  // （兩邊都是「未表態＝允許」），否則 hydration 後開關會跳一下。
  const enabled = ref(true)

  onMounted(() => {
    enabled.value = readConsent()
  })

  function set(next: boolean) {
    enabled.value = next
    try {
      localStorage.setItem(KEY, next ? 'on' : 'off')
    }
    catch {
      // 無痕模式或封鎖站台資料時會丟例外。使用者的選擇無法保存，
      // 但當次瀏覽仍要生效，所以不中斷。
    }

    if (!gtagId) return
    const { initialize, disableAnalytics, enableAnalytics } = useGtag()
    if (next) {
      enableAnalytics()
      // 本次瀏覽一開始就關著的話，script 還沒載入過，這裡補載
      initialize()
    }
    else {
      disableAnalytics()
    }
  }

  return { available, enabled, set }
}

/**
 * 讀退出狀態。**未表態視為允許**（opt-out 模型）。
 * plugin 與本 composable 共用同一份判定，避免兩處各寫一次而漂移。
 */
export function readConsent(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off'
  }
  catch {
    return true
  }
}
