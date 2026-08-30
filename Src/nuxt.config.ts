import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxtjs/i18n', 'nuxt-gtag'],

  // CommonMark 的強調規則對 CJK 標點不友善。像 `**「密碼保護」**與` 這種寫法，
  // 收尾的 `**` 前面是全形標點、後面接非空白字元，依規則不算 right-flanking，
  // 於是 `**` 會原樣顯示而不會變成粗體 —— 而且完全不報錯。
  // remark-cjk-friendly 放寬這條規則，讓中日韓文本的強調語法如預期運作。
  content: {
    build: {
      markdown: {
        remarkPlugins: {
          'remark-cjk-friendly': {},
        },
      },
    },
  },

  // ── D3 / F3 / F7：i18n ──────────────────────────────────────────────
  // 階段三決策 D-16：**只上 zh-TW + en**，ja 留完整骨架（見 i18n/locales/ja/）。
  // 要啟用日文＝把下面 locales 加一筆 ja + 把 ja/*.json 的空字串填滿，
  // `npm run check:i18n` 會逐 key 檢查兩者是否同步。
  i18n: {
    defaultLocale: 'zh-TW',
    strategy: 'prefix_except_default',
    locales: [
      {
        code: 'zh-TW',
        // hreflang / <html lang>。沿用階段一的 `zh-Hant`（以書寫系統標定，
        // 比 zh-TW 更能涵蓋所有繁體讀者），不是筆誤。
        language: 'zh-Hant',
        name: '繁體中文',
        files: [
          'zh-TW/common.json',
          'zh-TW/home.json',
          'zh-TW/download.json',
          'zh-TW/pricing.json',
          'zh-TW/changelog.json',
          'zh-TW/docs.json',
          'zh-TW/privacy.json',
          'zh-TW/subscribe.json',
          'zh-TW/what-we-dont-do.json',
        ],
      },
      {
        code: 'en',
        language: 'en',
        name: 'English',
        files: [
          'en/common.json',
          'en/home.json',
          'en/download.json',
          'en/pricing.json',
          'en/changelog.json',
          'en/docs.json',
          'en/privacy.json',
          'en/subscribe.json',
          'en/what-we-dont-do.json',
        ],
      },
    ],
    // 🔴 關閉瀏覽器語言自動導向。開著會讓預繪好的 `/` 在英文瀏覽器上
    //    被 302 到 `/en`，與「網址即語言」的心智模型打架，也會讓
    //    分享出去的中文連結對外國讀者變成另一頁。切語言一律由使用者按。
    detectBrowserLanguage: false,
    // canonical / hreflang 的絕對網址來源。Q10-a 網域未定 ⇒ 走環境變數。
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://promptbox.app',
  },

  // ── D4：GA4 ─────────────────────────────────────────────────────────
  // 🔴 `initMode: 'manual'` 不是效能考量，是產品立場：
  //    退出分析的訪客身上，gtag 這支 script **根本不會被下載**（見
  //    plugins/analytics.client.ts）。這比業界慣用的 `ga-disable-*` 旗標
  //    強，也才對得起「我們不追蹤你」這句賣點。
  //    ID 未設定時整個模組靜默不動作，不會噴錯、不會壞版。
  gtag: {
    id: process.env.NUXT_PUBLIC_GTAG_ID || '',
    initMode: 'manual',
    config: {
      anonymize_ip: true,
      // 不投放廣告、不做再行銷，因此一律拒絕廣告類儲存
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    },
  },

  runtimeConfig: {
    // 🔴 僅 server 端可讀，永不進前端 bundle（見 server/api/subscribe.post.ts）
    buttondownApiKey: '',
    public: {
      // Q10-a：網域未購買，先用佔位值。買到之後只需改 Vercel 環境變數。
      siteUrl: 'https://promptbox.app',
      // Q14 / F1：真實聯絡信箱未提供。空字串時所有 mailto 會自動改導到
      // 訂閱表單（見 composables/useContact.ts），不會留下死連結。
      contactEmail: '',
      gtagId: process.env.NUXT_PUBLIC_GTAG_ID || '',
    },
  },

  compatibilityDate: '2026-08-27',
  devtools: { enabled: true },

  css: ['~/assets/css/style.css'],

  // D-3：Tailwind v4 走 Vite plugin，不用 @nuxtjs/tailwindcss
  vite: {
    plugins: [tailwindcss()],
  },

  // D-4：頁面全部預繪為靜態。
  // 🔴 階段三起 `/api/**` 例外 —— F4 的訂閱端點必須是真的 server route，
  //    否則 Buttondown 的 API key 只能放進前端（= 公開）。這是 AC-15
  //    「無 serverless function」的**唯一且刻意**的破例，見 PRD 階段三 D-18。
  routeRules: {
    '/**': { prerender: true },
    '/api/**': { prerender: false },
  },

  // 🔴 `routeRules` 的 glob **不會**餵種子給預繪器 —— 它只回答「這條路徑
  //    如果被走到，要不要預繪」。階段二用的是 `nuxt generate`（自動塞 `/`），
  //    階段三為了 /api/subscribe 改用 `nuxt build`，那個自動行為就沒了。
  //    症狀很惡毒：建置照樣成功，只是 .output/public 裡一個 .html 都沒有。
  //    兩個語系各給一個入口，其餘由 crawlLinks 從連結爬出來。
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/en'],
    },
  },

  app: {
    head: {
      // 🔴 `htmlAttrs.lang` 已移除 —— 改由 app.vue 的 useLocaleHead() 依
      //    當前語言輸出，寫死在這裡會蓋掉它（F7）。
      bodyAttrs: {
        class:
          'bg-surface-page text-ink-800 font-sans antialiased m-0',
      },
      meta: [
        { charset: 'UTF-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/assets/icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Big+Shoulders:wght@600;700&family=Inter:wght@400;500;700&family=Noto+Sans+TC:wght@400;500;700;900&display=swap',
        },
      ],
      script: [
        {
          // FR-3：防 FOUC。必須是 <head> 內的同步 script。
          // 🔴 不可改寫成 Nuxt plugin —— plugin 在 hydration 後才執行，
          //    深色模式使用者每次載入都會閃一下白底。
          tagPosition: 'head',
          innerHTML:
            '(function(){try{var t=localStorage.getItem("pb-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();',
        },
      ],
    },
  },
})
