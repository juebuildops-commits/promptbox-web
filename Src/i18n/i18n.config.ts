// vue-i18n 執行期設定。@nuxtjs/i18n v10 預設讀取 `<i18nDir>/i18n.config.ts`。
export default defineI18nConfig(() => ({
  legacy: false,
  // 🔴 en 缺 key 時退回 zh-TW，而不是顯示 key 本身。
  //    但這**不該發生** —— `npm run check:i18n` 會在建置前擋下缺 key。
  //    fallback 是安全網，不是工作流程的一部分。
  fallbackLocale: 'zh-TW',
  // 缺 key 時不在 console 噴警告（建置期已由 check:i18n 擋掉，
  // 執行期再噴一次只是噪音）
  missingWarn: false,
  fallbackWarn: false,
}))
