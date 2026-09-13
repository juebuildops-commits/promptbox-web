// vue-i18n 執行期設定。@nuxtjs/i18n v10 預設讀取 `<i18nDir>/i18n.config.ts`。
export default defineI18nConfig(() => ({
  legacy: false,
  // 🔴 階段三效能優化 E5：
  //    正式環境關閉 fallbackLocale（設為 false），使 en/ja 客戶端語系包不再包含
  //    整份 zh-TW（每位外語訪客現省 ~11-12 KB gz，避免抓取永遠用不到的中文）。
  //    開發環境（dev）則保留 fallbackLocale: 'zh-TW' 作為安全網，方便邊開發邊加 key。
  //    正式上線前已由 `npm run check:i18n` 嚴格把關 3 語系全 key 齊全且非空。
  fallbackLocale: process.env.NODE_ENV === 'development' ? 'zh-TW' : false,
  // 缺 key 時不在 console 噴警告（建置期已由 check:i18n 擋掉，
  // 執行期再噴一次只是噪音）
  missingWarn: false,
  fallbackWarn: false,
}))
