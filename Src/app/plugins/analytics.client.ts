/**
 * D4：只有在訪客沒退出時，才去載入 GA4。
 *
 * 搭配 `gtag.initMode: 'manual'`（nuxt.config.ts）。退出的人身上，
 * gtag.js 這支 script 從頭到尾不會出現在網路請求裡 —— 這是隱私頁上
 * 「分析程式碼根本不會被下載」那句話的實作，不是修辭。
 *
 * GA4 ID 未設定時 nuxt-gtag 本來就不動作，這裡直接短路省一次判斷。
 */
export default defineNuxtPlugin(() => {
  const { gtagId } = useRuntimeConfig().public
  if (!gtagId) return

  const { initialize, disableAnalytics } = useGtag()

  if (!readConsent()) {
    // 保險：即使日後有人把 initMode 改回 'auto'，這個旗標仍會擋住回報
    disableAnalytics()
    return
  }

  initialize()
})
