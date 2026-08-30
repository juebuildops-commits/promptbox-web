# PromptBox 官方網站（`promptbox-web`）

> PromptBox 的**官方網站**原始碼 —— Nuxt 4 靜態預繪站，負責產品說明、安裝檔發佈、操作手冊、版本紀錄與名單收集。
>
> **狀態**：階段一～四已完成（遷移 → 內容化 → i18n／訂閱 → 正式文件）；階段五、六（金流、登入、下載閘門）**已規劃但刻意暫緩**。
> **最後更新**：2026-08-29

---

## 一、這是什麼、不是什麼

| | |
| --- | --- |
| **是** | 官網前端。6 個頁面、2 個語系、1 個 API 端點（email 訂閱），其餘全部是建置時預繪好的靜態 HTML |
| **是** | PromptBox 安裝檔的**唯一**發佈管道 —— 沒有 GitHub Releases（決策 D19），App 本體的 repo 目前未公開 |
| **不是** | 商店。目前**收不到錢**：金流（Polar）、帳號（Supabase Auth）、下載閘門都還沒接，定價頁的購買行為一律導向 email 訂閱表單 |
| **不是** | App 本身。Electron 桌面程式在另一個 repo；App 的 README 快照在 `Docs/refer/APP快照.md`，那是**那個產品**的說明書，不是這個網站的 |

這個網站在賣的立場是「**你的 context 存在你自己的電腦，任何廠商都拿不走**」。
下面幾乎所有看起來奇怪的技術決定（手動載入 GA4、只有一支 serverless function、對缺陷主動揭露的文案），都是為了讓這句話在程式碼層面站得住腳。

---

## 二、技術棧與外部服務

### 框架與套件（`Src/package.json`）

| 用途 | 選型 | 備註 |
| --- | --- | --- |
| 框架 | **Nuxt 4** | 專案根在 `Src/`，不在 repo 根 |
| 樣式 | **Tailwind v4**（`@tailwindcss/vite`） | 走 Vite plugin，**不用** `@nuxtjs/tailwindcss`。設計 token 全部寫在 `app/assets/css/style.css` 的 `@theme` |
| 內容 | **`@nuxt/content` v3** | changelog／docs 由 Markdown 生成；`better-sqlite3` 是它的本機 SQLite 後端（產物在 `Src/.data/`） |
| 多語系 | **`@nuxtjs/i18n` v10** | `prefix_except_default`，預設 `zh-TW` |
| 分析 | **`nuxt-gtag`** | `initMode: 'manual'`，退出分析者身上完全不下載 gtag.js |
| CJK 粗體 | `remark-cjk-friendly` | CommonMark 的強調規則對全形標點不友善，收尾 `**` 前是全形標點時會靜默不變粗體 |

### 外部服務

| 服務 | 角色 | 狀態 | 設定位置 |
| --- | --- | --- | --- |
| **Vercel** | 網站部署（D8） | 決策已定 | `NUXT_*` 環境變數；`NUXT_BUTTONDOWN_API_KEY` 須標 Sensitive 且**只設 Production** |
| **Cloudflare R2** | 安裝檔託管（上線前置鏈 P1） | ✅ 已上線 | `Src/app/pages/download.vue` 頂端的 `R2` 常數。目前用 `pub-*.r2.dev` 公用網址，待網域到位後改綁自訂網域 |
| **Buttondown** | Email 名單（D29） | 待開帳號 | `server/api/subscribe.post.ts`；key 未設時端點回 501，表單誠實顯示「尚未啟用」 |
| **Google Analytics 4** | 網站分析（D4） | 待建資源 | `NUXT_PUBLIC_GTAG_ID`；未設定時整個模組靜默不動作，隱私頁的開關會自動收起 |
| **Google Fonts** | Noto Sans TC／Inter／Big Shoulders | 使用中 | `nuxt.config.ts` 的 `app.head.link` |
| **Polar**（金流）／**Supabase**（帳號、DB） | 階段五、六 | 📦 未接 | 見 `Docs/webplan/PRD_階段五六_金流與授權發放.md` |

🔴 **四個環境變數全部可留空**，留空時對應功能會**安全地停用**（不壞版、不噴錯、文案自動改口）。這是刻意設計，見 `Src/.env.example`。

---

## 三、什麼東西放在哪裡

```
promptbox-web/
├── README.md                  ← 你正在讀的這份：網站的架構說明
├── CLAUDE.md                  ← 給 AI 的禁令與路由層：五條紅線 ＋ 指到這裡。刻意不複製架構
├── Docs/                      ← 產品層文件（管「為什麼」，不是網站程式碼）
│   ├── README.md              ← 🔴 文件索引 ＋「要動 X 先看 Y、動完回寫 Z」對照表。從這裡查起
│   ├── 文件規則.md            ← 什麼時候該開檔、檔頭格式、狀態詞彙、副本規則
│   ├── webplan/               ← 要做什麼：待討論問題（D1–D31）、上線前置鏈、階段一～五六 PRD
│   ├── webspec/               ← 現在是什麼：PageDescription／主張與依據／systemV2。🔴 改完要回寫
│   ├── appsync/               ← 跟 App 對得上的：App事實依據、身分字串凍結清單、ADR-008、金流接縫
│   └── refer/                 ← 唯讀參考：BRD（商業依據）、App README 快照、FP04/05、備用截圖
│
└── Src/                       ← 🔴 Nuxt 專案根。npm 指令都在這裡跑
    ├── nuxt.config.ts         ← i18n／GA4／預繪／防 FOUC inline script 的總開關
    ├── content.config.ts      ← changelog 與 docs 兩個 collection 的 frontmatter schema
    ├── .env.example           ← 四個環境變數與「留空會怎樣」
    │
    ├── app/
    │   ├── app.vue            ← 只做一件事：由 useLocaleHead() 輸出 <html lang>／hreflang／canonical
    │   ├── pages/             ← 6 個頁面（見第四節）
    │   ├── components/        ← AppHeader／AppFooter／LanguageSwitcher／SubscribeForm
    │   │                        ／ContentLocaleNotice／content/Notice.vue（MDC callout）
    │   ├── composables/       ← useTheme／useOsDetect／useAnalyticsConsent／useContact
    │   │                        ／useDocsScrollSpy
    │   ├── plugins/           ← analytics.client.ts：沒退出才載入 GA4
    │   ├── utils/pricing.ts   ← 🔴 所有價格與 Free 配額的唯一來源
    │   └── assets/css/style.css ← @theme token、.icon（CSS mask）、.notice、深色模式
    │
    ├── content/               ← 🔴 手冊與版本紀錄的單一真相來源（僅 zh-TW）
    │   ├── changelog/*.md     ← 一版一檔，順序由 date 反向排序推導
    │   └── docs/*.md          ← 一節一檔，側欄由 frontmatter 生成
    │
    ├── i18n/
    │   ├── i18n.config.ts     ← fallbackLocale: 'zh-TW'
    │   └── locales/{zh-TW,en,ja}/*.json  ← 每頁一個檔；ja 是留白骨架，尚未出貨
    │
    ├── public/assets/         ← icon-*.svg（走 CSS mask 上色）、logo-*.svg、ExImg/ 產品截圖
    │
    ├── scripts/               ← 三支建置護欄（見第六節）
    └── server/api/subscribe.post.ts  ← 🔴 全站唯一的 serverless function
```

**刻意不在 repo 裡的東西**：安裝檔（`*.exe`／`*.zip`，各自超過 100 MB，GitHub 硬擋單檔 >100 MiB、Vercel Hobby 的來源檔上限同樣是 100 MB）→ 放 Cloudflare R2；`.env`；`.nuxt`／`.output`／`.data` 等建置產物。

---

## 四、每一頁分別要表達什麼

網址規則：`zh-TW` 無前綴（`/pricing`），`en` 加前綴（`/en/pricing`）。**不做瀏覽器語言自動導向** —— 網址即語言，切語言一律由使用者按，分享出去的中文連結不會對外國讀者變成另一頁。

### `/` — 首頁（`app/pages/index.vue`）

**要表達**：為什麼需要這個東西。主張是「AI 時代的密碼管理器」。

Hero（含產品截圖）→ 信任列（本地儲存・SQLCipher 靜態加密・核心功能永久免費・Windows/macOS）→ **Privacy & Security**（三條說明 ＋ 一張「你的電腦 → 授權 → AI 工具」的流程圖）→ **Advanced**（三列圖文：機密卡片、MCP 整合、卡片串聯）→ 定價四卡概覽 → FAQ → CTA → Footer。

### `/download` — 下載（`app/pages/download.vue`）

**要表達**：把檔案交到手上，並且**對安裝過程完全誠實**。

- 進站即偵測作業系統（`useOsDetect`），CTA 文案與平台卡高亮跟著換。預繪時沒有 User-Agent，因此掛載前一律顯示通用文案。
- Windows 提供 `.exe` 安裝版與 `.zip` 免安裝版，**兩者都印出 SHA-256 校驗碼**。🔴 `href` 與 `sha256` 必須成對更新 —— 校驗碼是印在頁面上的對外承諾，對不上比沒有更糟。
- macOS build 尚不存在 ⇒ mac 訪客導向訂閱表單並顯示「即將推出」，而不是給一顆按了下載不到東西的按鈕。
- 「安裝小提示」四條：零連網保證與更新方式、本機資料加密、v2.x 升級路徑、以及**主動承認「Windows 會顯示無法辨識的應用程式」** —— 不請使用者忽略警告，而是請他用 SHA-256 核對檔案，並連到手冊第 9 節說明原因與它何時會消失。

### `/pricing` — 定價（`app/pages/pricing.vue`）

**要表達**：四種方案的邊界，以及「現在還不能買，但可以先卡位」。

四張方案卡（Free／Pro 早鳥焦點卡／永久更新權／商業授權）→ 促銷與續訂優惠說明 → **完整功能規格對照表** → FAQ → 底部 CTA。

金流未開通期間，購買行為一律換成 email 訂閱表單（早鳥名額以訂閱時間戳為準）；商業授權諮詢在未設定聯絡信箱時同樣導向表單，不留一個寄不到人的 `mailto`。所有數字來自 `app/utils/pricing.ts`，語系檔以 `{proEarly}` 這類具名參數引用，**改價只改一處**，中英文案自動同步。

### `/docs` — 操作手冊（`app/pages/docs.vue`）

**要表達**：完整功能怎麼用。

九個章節與左側 sticky 側欄**同時**由 `content/docs/*.md` 生成，側欄標籤／圖示／錨點取自 frontmatter，單一真相來源。捲動時側欄 scroll-spy 標示目前章節（`useDocsScrollSpy`）。第 9 節「安裝時的安全提示」壽命比直覺長 —— SmartScreen 的信譽是跟著憑證累積的，買了憑證警告也不會立刻消失，這是它值得認真寫的理由。

### `/changelog` — 版本紀錄（`app/pages/changelog.vue`）

**要表達**：這個產品一直在動，以及**訂閱是知道新版的唯一方法**。

時間軸由 `content/changelog/*.md` 生成，順序以 `date` 字串反向排序推導（「最新版本」徽章由順序推導、不寫進 frontmatter —— 手動標記一定會忘記把上一版的拿掉）；早期版本折疊成摘要卡。頁尾的訂閱表單不是裝飾：v3.3.0 移除 App 內所有更新檢查後，email 是使用者得知新版的唯一管道（D20）。

### `/privacy` — 隱私權政策（`app/pages/privacy.vue`）

**要表達**：這頁刻意不寫成給律師看的免責清單。

結構是：① 先把 **App（完全不連網）** 與 **網站（有分析、有電子報）** 切乾淨 → ② 每一項收集都寫「為什麼」與「怎麼關」→ ③ **開關就放在文字旁邊**，不是叫使用者去別的地方找 → ④ 瀏覽器儲存、第三方處理者、你的權利、聯絡、政策變更。

GA4 未設定時，這頁會誠實顯示「本站目前未設定任何分析工具」，而不是描述一個不存在的東西。頁尾「聯絡我們」在沒有聯絡信箱時會導到這頁的聯絡區。

---

## 五、渲染與路由模型

- **全站預繪**：`routeRules` 設 `'/**': { prerender: true }`，產物是純靜態 HTML。
- 🔴 **唯一例外是 `/api/**`**。`server/api/subscribe.post.ts` 必須是真的 server route，否則 Buttondown 的 API key 只能放進前端（＝公開，任何人都能拿它讀取整份訂閱名單）。這是「純靜態」**唯一且刻意**的破例。
- 🔴 `routeRules` 的 glob **不會餵種子給預繪器** —— 它只回答「這條路徑如果被走到，要不要預繪」。因為改用 `nuxt build`（而非會自動塞 `/` 的 `nuxt generate`），必須在 `nitro.prerender.routes` 明確給 `['/', '/en']` 兩個入口，其餘由 `crawlLinks` 從連結爬出來。漏了的症狀很惡毒：建置照樣成功，只是 `.output/public` 裡一個 `.html` 都沒有。
- **深色模式**：初始判定是 `<head>` 內的**同步 inline script**（寫在 `nuxt.config.ts`），不是 plugin —— plugin 在 hydration 之後才跑，深色模式使用者每次載入都會閃一下白底。`useTheme()` 只負責點擊後的切換與持久化（`localStorage: pb-theme`）。
- **分析退出**：`initMode: 'manual'` ＋ `plugins/analytics.client.ts`。退出的訪客身上，gtag.js **從頭到尾不會出現在網路請求裡** —— 比業界慣用的 `ga-disable-*` 旗標（照樣下載執行、只是不回報）強一級。狀態存 `localStorage: pb-analytics`，未表態視為允許（opt-out 模型）。
- **訂閱端點**：前端只送 `kind`（updates／early-bird／commercial），**tag 由伺服器決定**，放任前端傳 tag ＝ 讓任何人污染名單分群。另含蜜罐欄位、保守的 email 檢查、以及「不回傳 Buttondown 原始錯誤」。
- **圖示**：`.icon--*` 走 CSS mask 上色，SVG 放 `public/assets/`，不引入圖示元件庫。

---

## 六、四個「單一真相來源」與三支護欄

| 真相來源 | 管什麼 | 誰在守 |
| --- | --- | --- |
| `Src/content/**.md` | changelog 與 docs 的文字、側欄結構、版本順序 | `scripts/check-content.mjs` |
| `Src/i18n/locales/**/*.json` | 所有版面文案（zh-TW／en，ja 骨架） | `scripts/check-i18n.mjs` |
| `Src/app/utils/pricing.ts` | 20 餘處價格、Free 配額、`{{variable}}` 字面值 | `scripts/check-i18n.mjs`（比對具名參數） |
| `Docs/**.md` 之間的相對連結 | 文件索引與交叉引用點不點得開 | `scripts/check-docs.mjs` |

三支腳本的共同目的是**把「靜默壞掉」變成「建置失敗」**，它們掛在 `npm run build`／`generate` 前面：

- **`check:content`** —— 擋 `content/` 裡沒包在程式碼中的 `{{ }}`。MDC 會把 `{{變數}}`、`{{@prompt:N}}` 當資料綁定求值，解不出來就**渲染成空字串**：不報錯、不警告，文字就這樣消失。而這兩個 token 正好是 PromptBox 的核心概念，幾乎一定會有人寫進段落裡。
- **`check:i18n`** —— 擋三件事：①缺 key（設了 fallbackLocale ⇒ 英文頁會靜靜冒出一句中文，不會報錯）；②具名參數不對稱（翻譯漏掉一個 `{proEarly}`，那個數字整段消失）；③訊息語法（裸露的 `{{variable}}` 被 vue-i18n 靜默吃掉、裸露的 `@` 會炸在一句完全沒提到 `@` 的 "Invalid linked format" 上）。`npm run i18n:sync` 可自動補缺 key 並清掉改名後的殘留 key。
- **`check:docs`** —— 擋文件斷鏈。文件搬家不會噴任何錯，連結只是點下去 404，而**最先爛掉的通常是索引本身**：2026-08-29 的 `Docs/` 重組一次產生 107 條斷鏈，其中 `Docs/README.md` 的 19 條全斷 —— 那正是 AI 進來第一個讀的檔案。刻意豁免 `Docs/refer/`（App repo 的副本，內部連結本來就指向正本 repo，修它反而會讓副本對不上正本）。

---

## 七、環境變數（`Src/.env.example`）

| 變數 | 留空會怎樣 | 目前卡在 |
| --- | --- | --- |
| `NUXT_PUBLIC_SITE_URL` | canonical／hreflang／og:url 指向佔位網域 `promptbox.app` | 網域未購買（前置鏈 P6） |
| `NUXT_PUBLIC_GTAG_ID` | 完全不載入分析，頁面一切正常 | 需建立 GA4 資源。**不要為了「先接起來」而填假 ID** |
| `NUXT_PUBLIC_CONTACT_EMAIL` | 頁尾「聯絡我們」與商業授權 CTA 自動改導訂閱表單 | 真實信箱未提供 |
| `NUXT_BUTTONDOWN_API_KEY` | `/api/subscribe` 回 501，表單顯示「訂閱功能尚未啟用」 | 需開 Buttondown 帳號 |

🔴 前三個是 `runtimeConfig.public`（會進前端 bundle）；`NUXT_BUTTONDOWN_API_KEY` 在非 public 區，**僅 server 端可讀，永不進前端 bundle**。在 Vercel 要標 **Sensitive** 且**只設 Production** —— preview 部署預設任何人拿到網址就能存取。

---

## 八、開發

```bash
cd Src
npm install          # postinstall 會跑 nuxt prepare
npm run dev          # 開發伺服器
npm run build        # check:content → check:i18n → check:docs → nuxt build（產物含 /api）
npm run generate     # 同上，但純靜態（不含 API 端點）
npm run preview      # 預覽建置結果

npm run check:content   # 單獨跑內容護欄
npm run check:i18n      # 單獨跑語系護欄
npm run check:docs      # 單獨跑文件斷鏈護欄
npm run i18n:sync       # 補齊缺的 key（空字串）並清掉殘留 key
```

需要 Node 20 以上（Nuxt 4 的需求）。

**要啟用日文**需要三步，缺一 `check:i18n` 就會擋下來：①填滿 `i18n/locales/ja/*.json` 的空字串 ②把 `'ja'` 從 `scripts/check-i18n.mjs` 的 `SKELETON` 集合移除 ③在 `nuxt.config.ts` 的 `i18n.locales` 加一筆 `ja`。

---

## 九、目前狀態與已知邊界

| 邊界 | 現況 | 頁面上怎麼處理 |
| --- | --- | --- |
| **網域未購買** | 用佔位值 `promptbox.app` | 買到後只改 Vercel 環境變數，不動任何 `.vue` |
| **產品即將改名**（商標問題） | 進行中 | 網域與簽章憑證都綁名稱 ⇒ 前置鏈 P2–P7 一律等改名定案、且開始有實際銷售後才啟動 |
| **macOS build 不存在** | 未開發 | 下載頁對 mac 訪客顯示「即將推出」並導向訂閱 |
| **沒有程式碼簽章憑證** | 未購買 | 下載頁 `notes.n4` ＋ 手冊第 9 節主動說明，並提供 SHA-256 供自行核對 |
| **`content/` 只有 zh-TW** | 版面兩語、內容單語 | `ContentLocaleNotice` 在非中文語系顯示「以下為中文原文」—— 不隱藏、也不機翻 |
| **收不到錢** | 階段五六暫緩 | 所有購買 CTA 改為 email 名單（不收錢、只保證早鳥資格，150 名以訂閱時間戳為準） |
| **R2 用公用開發網址** | `pub-*.r2.dev` | Cloudflare 不建議正式環境長期依賴，待網域到位後改綁自訂網域 |
| **下載未設登入閘門** | D16 的暫時例外 | 為比賽曝光期保留。閘門上線時只需把下載頁的 `href` 換成閘門路由，文案一個字都不用改 |

---

## 十、延伸閱讀

| 文件 | 回答的問題 |
| --- | --- |
| [`Docs/webplan/待討論問題.md`](Docs/webplan/待討論問題.md) | **先讀這份**。所有已拍板決策（D1–D31）、待決問題、已知邊界、階段規劃、改名時序 |
| [`Docs/webplan/PRD_階段一_Nuxt遷移.md`](Docs/webplan/PRD_階段一_Nuxt遷移.md) | 從靜態 HTML 搬到 Nuxt 4 的範圍與驗收條件 |
| [`Docs/webplan/PRD_階段二_Content化.md`](Docs/webplan/PRD_階段二_Content化.md) | changelog／docs 為什麼變成 Markdown、資產怎麼瘦身 |
| [`Docs/webplan/PRD_階段三_i18n與訂閱.md`](Docs/webplan/PRD_階段三_i18n與訂閱.md) | i18n、GA4、隱私頁、訂閱表單；含上線前的環境變數交接表 |
| [`Docs/webplan/PRD_階段五六_金流與授權發放.md`](Docs/webplan/PRD_階段五六_金流與授權發放.md) | 金流／登入／下載閘門為什麼暫緩、依賴順序長什麼樣 |
| [`Docs/webplan/上線前置鏈.md`](Docs/webplan/上線前置鏈.md) | 一行程式都不用寫、但交期以週計算的事（公司登記 → D-U-N-S → Apple；網域 → DKIM） |
| [`Docs/appsync/身分字串凍結清單.md`](Docs/appsync/身分字串凍結清單.md) | 發出任何安裝檔之前必須一次定死的字串 |
| [`Docs/appsync/ADR-008_授權憑證格式與離線驗證契約.md`](Docs/appsync/ADR-008_授權憑證格式與離線驗證契約.md) | 授權憑證長什麼樣、App 怎麼離線驗簽、哪些欄位**刻意不存在** |
| [`Docs/appsync/官網金流與授權發放接縫.md`](Docs/appsync/官網金流與授權發放接縫.md) | 錢進來之後，授權字串怎麼被生出來、送到誰手上、出錯時怎麼救 |
| [`Docs/webspec/systemV2.md`](Docs/webspec/systemV2.md) | 色票、字體、間距、圓角、陰影等 design token 的出處 |
| [`Docs/README.md`](Docs/README.md) | 🔴 **文件總索引**：四個資料夾各裝什麼、要動 X 先看 Y 動完回寫 Z |
| [`Docs/文件規則.md`](Docs/文件規則.md) | 什麼時候該開一份新文件、什麼時候不該；檔頭格式與狀態詞彙 |
| [`Docs/appsync/App事實依據.md`](Docs/appsync/App事實依據.md) | 官網文案依賴的 App 紅線（零外連、資料連續性、誠實紅線）與查核方式 |
| [`Docs/webspec/主張與依據.md`](Docs/webspec/主張與依據.md) | 網站上每句對外主張的依據與狀態。**改文案前先讀** |
| [`Docs/refer/APP快照.md`](Docs/refer/APP快照.md) | PromptBox **App 本體**的功能說明（不是這個網站） |

> 兩份時序文件的分工：**上線前置鏈**擋的是「想做的時候才發現要等」，**身分字串凍結清單**擋的是「做了就回不去」。兩份都不是待辦事項，是時序約束。
