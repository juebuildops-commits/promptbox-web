> 🗂️ **本文提及的 `L2/` 已於 2026-08-28 移除。**
> 它是遷移前的靜態原稿，依 D-8 保留作為逐頁對照組；AC-1 / AC-10 / AC-27 的目視 parity
> 已於 2026-08-28 確認完畢，任務結束後整份移出專案。
>
> 本文**刻意不改寫** —— 它記錄的是遷移當時的依據與驗收方式，改掉等於竄改決策紀錄。
> 文中所有 `../../L2/...` 連結因此失效，這是預期內的。原稿若需回溯，在 App 專案的歷史版本中。

---

# PRD — 階段三：i18n + GA4 + 隱私頁 + email 訂閱

> **目標**：讓官網（1）說兩種語言、（2）知道有沒有人在看、（3）**有辦法通知使用者新版發布了**。
> 第三項是本階段真正的重點 —— F4 標的問題是「每發一版都沒有人會知道」。
> **狀態**：✅ 已完成（2026-08-27），**AC-27 已於 2026-08-28 目視確認通過**
> **建立日期**：2026-08-27
> **前置**：[PRD_階段一_Nuxt遷移.md](./PRD_階段一_Nuxt遷移.md)、[PRD_階段二_Content化.md](./PRD_階段二_Content化.md)（皆已完成）、[待討論問題.md](./待討論問題.md)

---

## 1. 背景

階段一、二把網站搬進 Nuxt 並把內容抽成 Markdown，但三個結構性缺口原封不動：

| | 現況 | 後果 |
|---|---|---|
| **F4** | 全站**沒有任何 email 收集欄位** | v3.3.0 移除自動更新後，email 是使用者得知新版的**唯一管道**（README：「漏寄等於該版無人可得」）。現在每發一版都沒有人會知道 |
| F3 / F7 | 語言鈕是死的、全站 `lang="zh-Hant"` | App 端已有三語，官網單語 |
| — | 沒有分析、沒有隱私頁 | 不知道哪一頁有人看；也還沒對外說明我們收集什麼 |

F4 不是「少一個功能」，是**發佈管道斷了**。本階段以它為核心。

---

## 2. 範圍

### 2.1 範圍內

- i18n：5 個行銷頁 + header/footer 的 **zh-TW / en** 兩語（ja 留完整骨架）
- 語言切換器（解 F3）、`<html lang>` 與 hreflang / canonical（解 F7）
- GA4（D4）+ 可真正關掉的退出開關
- 新增 `/privacy` 隱私權政策頁
- **email 訂閱表單 + `/api/subscribe` 端點（解 F4）**
- 語系檔護欄 `scripts/check-i18n.mjs`
- 聯絡信箱佔位符收斂（解 F1 的**三處**，見 §7.3）

### 2.2 範圍外

| 項目 | 歸屬 |
|---|---|
| `content/`（changelog / docs）翻譯 | 見 D-17，**本階段不做** |
| 日文出貨 | 骨架已備妥，見 D-16 |
| 🔴 下載連結指向未公開 repo（F10 / Q15） | **待決**，見 §7.2 |
| 登入 / 金流 / 授權簽發 | 階段五、六 |

---

## 3. 技術決策

| # | 決策 | 理由 |
|---|---|---|
| **D-16** | **只出貨 zh-TW + en**，ja 留 417 個 key 的完整骨架 | 你的裁決。骨架不是註解掉的程式碼 —— `check-i18n.mjs` 每次建置都驗證它與 zh-TW 的 key 完全同步，所以它不會過期。出貨日文＝填值 + 兩行設定，見 `i18n/locales/ja/README.md` |
| **D-17** | **`content/` 維持 zh-TW**，en 顯示原文 + 一則明示的提示 | changelog 一年發十幾版，翻三語是**永久的稅**；而隱藏內容會讓英文讀者連改了什麼都看不到。顯示原文並說清楚，是三個選項裡唯一誠實的 |
| 🔴 **D-18** | **開一個 serverless function：`/api/subscribe`** | 階段二 AC-15 釘死「無 serverless function」。**這是刻意且唯一的破例**：Buttondown 的 API key 若不放伺服器端，就只能放前端＝公開，任何人都能拿它讀走整份訂閱名單。且階段五的 Polar webhook 與簽發端點本來就需要 serverless，這條線遲早要開 |
| **D-19** | GA4 走 `initMode: 'manual'`，退出者**整支 script 不載入** | 業界慣例是照常載入 gtag 再設 `ga-disable-*` 旗標請它別回報 —— 追蹤程式碼還是執行了。對一個賣點是「我們不追蹤你」的產品，這個姿態說不過去。隱私頁上那句「分析程式碼根本不會被下載」是實作，不是修辭 |
| **D-20** | 價格與配額收斂成 `app/utils/pricing.ts`，語系檔以 `{proEarly}` 具名參數引用 | 這些數字是[§六 對外已公開的承諾](./待討論問題.md)＝規格，散落在兩頁 20 餘處。收斂後**改價只改一個檔**，中英文案自動同步；`check-i18n.mjs` 驗證參數對稱，漏掉 `{...}` 會讓建置失敗而不是讓數字消失 |
| **D-21** | **關閉 `detectBrowserLanguage`** | 開著會讓預繪好的 `/` 在英文瀏覽器上被 302 到 `/en`，與「網址即語言」的心智模型打架，也會讓分享出去的中文連結對外國讀者變成另一頁 |
| **D-22** | 網域（Q10-a）／ GA4 ID ／ 聯絡信箱（Q14）全走環境變數，**空值時該功能安全停用** | 三者都還沒有。空值不是壞掉：GA4 ID 為空⇒完全不載入且隱私頁顯示「本站未設定分析工具」；信箱為空⇒mailto 改導到訂閱表單；網域為空⇒退回佔位值。買到／申請到之後改 Vercel 環境變數即可，不必動任何 `.vue` |
| D-23 | 建置指令由 `nuxt generate` 改為 `nuxt build` | `generate` 產出純靜態、**沒有 server**，`/api/subscribe` 會 404。`nuxt build` + `routeRules` 仍預繪全部 12 個頁面，只多一個 function（見 R-13） |

---

## 4. 目標結構

```
src/
├── i18n/
│   ├── i18n.config.ts                 ← vue-i18n 執行期設定
│   └── locales/
│       ├── zh-TW/ …… 8 個 .json       ← 參考語系（417 key）
│       ├── en/    …… 8 個 .json       ← 已出貨
│       └── ja/    …… 8 個 .json + README.md   ← 骨架，值全空
├── server/
│   └── api/subscribe.post.ts          ← D-18，全站唯一的 function
├── scripts/
│   ├── check-content.mjs              ← 階段二
│   └── check-i18n.mjs                 ← 本階段新增
├── .env.example
└── app/
    ├── utils/pricing.ts               ← D-20 價格單一真相來源
    ├── plugins/analytics.client.ts    ← D-19
    ├── composables/
    │   ├── useAnalyticsConsent.ts
    │   └── useContact.ts              ← F1 佔位符收斂
    ├── components/
    │   ├── LanguageSwitcher.vue       ← F3
    │   ├── SubscribeForm.vue          ← F4
    │   └── ContentLocaleNotice.vue    ← D-17
    └── pages/privacy.vue              ← 新增
```

---

## 5. 功能需求

### FR-17　語系抽取

5 頁 + header/footer 共 **417 個 key**，依頁面分 8 個檔（`common` / `home` / `download` / `pricing` / `changelog` / `docs` / `privacy` / `subscribe`）。

一檔一命名空間，`nuxt.config.ts` 以 `files: []` 陣列合併。分檔的理由是校對 —— 要看英文定價文案，只要打開 `en/pricing.json`。

策略 `prefix_except_default`：zh-TW 無前綴（`/pricing`），en 有（`/en/pricing`）。舊網址不變，**不需要任何 301**。

### FR-18　語言切換器（F3）

用 `switchLocalePath()` 產生**同一頁的另一語版本**，不是一律回首頁 —— 讀到定價頁一半才想換語言的人應該留在定價頁。

桌機為 45×45 圖示鈕 + 下拉；行動版選單裡改為攤平橫列（原本桌機那顆在 `max-md` 是被藏起來的，行動版使用者根本點不到）。只有一個語系時整顆不渲染。

### FR-19　`<html lang>` / hreflang / canonical（F7）

`nuxt.config.ts` 的 `htmlAttrs.lang` **移除**（寫死會蓋掉 i18n 的輸出），改由 `app.vue` 的 `useLocaleHead()` 依語系輸出。

zh-TW 的 `language` 定為 **`zh-Hant`**（沿用階段一）而非 `zh-TW`：以書寫系統標定，涵蓋所有繁體讀者。

網址基準取自 `i18n.baseUrl` ＝ `NUXT_PUBLIC_SITE_URL`（D-22）。

### FR-20　GA4 + 退出開關

```
gtag: { id: env, initMode: 'manual', config: { anonymize_ip: true, allow_google_signals: false, … } }
```

`plugins/analytics.client.ts` 在載入前先讀 `localStorage.pb-analytics`：關著就 `return`，**gtag.js 完全不出現在網路請求裡**（D-19）。中途才關的情況用 `disableAnalytics()` 補（script 已在記憶體裡，收不回來）。

`useAnalyticsConsent()` 的預設值（未表態＝允許）在 SSR 與 client 兩端一致，因此**不會有 hydration mismatch**。

### FR-21　`/privacy`

結構刻意不像一般隱私政策：

1. **先把 App 與網站切乾淨** —— App 自 v3.3.1 起完全不連網，本政策**完全不適用於它**。這是全頁最重要的一句
2. 每一項收集都寫「為什麼收」與「怎麼關」
3. **開關就放在文字旁邊**，不是叫使用者去別的地方找
4. 第三方處理者表格（Vercel / GA4 / Buttondown）；GA4 未設定時該列不渲染
5. `#contact` 錨點 —— 頁尾「聯絡我們」在沒有真實信箱時導到這裡

### FR-22　訂閱表單 + 端點（F4）

**元件**（`SubscribeForm.vue`）三種 `kind`，決定文案與伺服器分類：

| kind | 位置 | 對應決策 |
|---|---|---|
| `updates` | changelog、download | D20 新版通知 |
| `early-bird` | pricing（取代 F2 的 `alert()`） | D25 預購不收錢、以訂閱時間戳為準 |
| `commercial` | pricing / privacy（僅在未設定聯絡信箱時） | Q14 備援管道 |

**端點**（`server/api/subscribe.post.ts`）：

- 🔴 **tag 由伺服器決定**。前端送的是 `kind`，對應表寫死在伺服器。放任前端傳 tag ＝ 讓任何人污染名單分群
- 蜜罐欄位 `company`：真人看不到也 tab 不到，填了就是機器人 —— **回 `ok` 而不是錯誤**，讓它以為成功了別再重試
- Buttondown 以 `type: 'unactivated'` 建立，走雙重確認信。這同時是「不是本人也能把別人加進名單」的防線
- **key 未設定回 501 而不是 500**：寄信服務還沒開通（D29），表單要能誠實說「還沒開放」，不是噴一個看起來像壞掉的錯誤
- 不回傳 Buttondown 的原始錯誤（可能夾帶帳號資訊）

### FR-23　`check-i18n.mjs`（護欄）

與階段二的 `check-content.mjs` 同一個用途：**把靜默壞掉變成建置失敗**。擋三件事：

| 擋什麼 | 不擋會怎樣 |
|---|---|
| 缺 key | `fallbackLocale` 讓它不報錯，只在英文頁面上冒出一句中文 |
| 參數不對稱 | 翻譯漏掉 `{proEarly}`，那個**數字整個消失**（不是顯示成字面文字） |
| 訊息語法（裸露的 `{{ }}` 與 `@`） | 見 R-14、R-15 |

`--sync` 會補上缺的 key（空字串）並**清掉改名後的殘留 key**，用於維持 ja 骨架。

### FR-24　聯絡信箱收斂（F1）

`useContact()`：有 `NUXT_PUBLIC_CONTACT_EMAIL` ⇒ 照舊發 mailto；沒有 ⇒ **不留死連結**，導到該頁的訂閱表單。換成真信箱＝設一個環境變數。

---

## 6. 風險與實測結果

| # | 風險 | 結果 |
|---|---|---|
| 🔴 **R-13** | **`routeRules` 的 glob 不會餵種子給預繪器** | **真的發生了**。`'/**': { prerender: true }` 只回答「這條路徑如果被走到要不要預繪」。階段二用 `nuxt generate`（自動塞 `/`），改用 `nuxt build` 後那個行為消失 —— 症狀極惡毒：**建置照樣成功，只是 `.output/public` 裡一個 `.html` 都沒有**。⇒ `nitro.prerender.routes: ['/', '/en']` + `crawlLinks` |
| 🔴 **R-14** | **`@` 是 vue-i18n 的 linked message 運算子** | **真的發生了**。`you@example.com` 這個 placeholder 讓 4 個頁面預繪 500，錯誤訊息是 `Invalid linked format`，**完全沒提到 `@`**。⇒ 寫成 `you{'@'}example.com`，並加進 FR-23 護欄（附可讀的錯誤說明） |
| R-15 | `{{variable}}` 被 vue-i18n 當插值吃掉 | 事前避開：改走 `{varToken}` 具名參數（`app/utils/pricing.ts`）。與階段二 FR-14 的 MDC 綁定是**完全同一種坑** |
| R-16 | 語系切換造成 hydration mismatch | 未發生。`isActive` 一律以 `localePath()` 比對（`route.path` 在 en 是 `/en/pricing`，直接比 `/pricing` 會全部不中） |
| R-17 | 分析開關的 SSR 預設值與 client 不一致 | 未發生。兩端都用同一份 `readConsent()`，未表態一律為「允許」 |

---

## 7. 實作紀錄（2026-08-27 完成）

### 7.1 成果

| | 之前 | 之後 |
|---|---|---|
| 語言 | 1（寫死 `zh-Hant`） | **2 出貨 + 1 骨架**，417 key × 3 |
| 預繪頁面 | 5 | **12**（6 頁 × 2 語） |
| email 收集欄位 | **0** | **6 個**（跨 4 頁 × 2 語） |
| serverless function | 0 | **1**（D-18） |
| 隱私頁 | 無 | 有，含可真正關掉的分析開關 |
| 價格數字散落 | 20 餘處硬編碼 | **1 個常數檔** |
| 護欄腳本 | 1 | 2 |

### 7.2 🔴 兩件**沒有動**的事（超出本階段範圍，需要你的決策）

**① F10 / Q15：下載連結指向未公開的 repo**

4 條下載按鈕仍指向 `github.com/tsa206531/PromptBox/releases`，而 D19 已確認該 repo 未公開 —— **點下去是壞的**。本階段只把它收斂成 `download.vue` 的一個 `RELEASES_URL` 常數，決策做完只需改一行。

**② 更嚴重：文案裡把「開源發布於 GitHub Releases」當事實在講**

首頁 FAQ、下載頁 hero 與安裝提示都寫著「安裝檔開源發布於 GitHub Releases，來源公開透明」。D19 之後這是**對外的不實陳述**，比壞連結嚴重。

本階段依 1:1 原則原樣保留，**但這代表這句話現在也有英文版了** —— 曝險面從一種語言變成兩種。zh-TW 與 en 各 3 處，共 6 處，全部在語系檔裡，改一次即可：

- `home.faq.a3`、`download.hero.lead`、`download.notes.n1.body`

### 7.3 三個轉換期才浮現的缺陷（皆已修）

**① F1 的第三處佔位信箱**

[待討論問題.md](./待討論問題.md) F1 記錄了兩處（頁尾、定價頁），實際上 **`content/docs/8.settings.md` 還有第三處**，一樣是掛在線上的 `mailto:test1234@google.com`。它在 Markdown 裡，用不到 `useContact()`，因此直接改為指向站內的「聯絡我們」。

**② 四個頁面各有一個 404 的 `<script src="js/main.js">`**

階段一 1:1 搬遷的殘留物 —— `public/` 底下根本沒有 `js/` 目錄，也就是每次載入這四頁都會多打一個 404 請求。已移除。

**③ 英文文案裡的全形中點**

zh-TW 用 `・`（U+30FB 片假名中點）當分隔符，直接沿用到英文會撐出全形寬度、看起來像排版錯誤。en 的 15 處改為 `·`（U+00B7），視覺節奏一樣、字寬正常。

### 7.4 驗收狀態

| # | 條件 | 狀態 |
|---|---|---|
| AC-19 | 12 個頁面全部預繪成功 | ✅ 6 頁 × 2 語 |
| AC-20 | `<html lang>` 依語系（zh-Hant / en） | ✅ |
| AC-21 | hreflang 互指 + canonical + og:locale | ✅ `x-default` / `zh` / `zh-Hant` / `en` + canonical + `og:url` + `og:locale:alternate` |
| **AC-22** | 🔴 `{{variable}}` 字面值存活 | ✅ pricing 2 處、index 1 處，中英皆同 |
| AC-23 | `/en/*` 無殘留中文 | ✅ 四個行銷頁只剩語言選單的「繁體中文」（正確）；changelog / docs 為 D-17 的預期行為，且有 `ContentLocaleNotice` 明示 |
| AC-24 | 價格由單一常數驅動，中英一致 | ✅ 參數對稱由 `check-i18n` 逐 key 驗證 |
| **AC-25** | `/api/subscribe` 四種行為 | ✅ 實測：無 key ⇒ 501 `disabled`／格式錯 ⇒ 422 `invalid`／未知 kind（含 `__proto__` 探測）⇒ 422／蜜罐 ⇒ 200 `ok` |
| AC-26 | GA4 未設定時不注入任何 script，隱私頁誠實說明 | ✅ 開關不渲染，改顯示「本站目前未設定任何分析工具」 |
| AC-27 | 人工目視：兩語 × 三斷點 × 雙主題 | ✅ 2026-08-28 確認通過。parity 確認後 `L2/` 已依 D-8 移出專案 |
| AC-28 | 護欄可擋 | ✅ 變異測試：塞一個裸露 `@` ⇒ 離開碼 1 並指出檔名、key 與修法 |

> **未實測**：Buttondown 真實 API 的成功／重複訂閱路徑。需要真的 API key，且會對第三方發出請求。程式路徑直白，但**上線前應以測試 key 走一次**。

### 7.5 AC-27 需要人工做的事

自動化能證明 key 齊全、參數對稱、DOM 正確，**證明不了英文排版**。請 `npm run dev` 後重點看：

1. **英文比中文長 20–40%** —— 定價卡的功能清單、信任列四格、比較表欄寬，在 1440 / 768 / 375 是否有斷字或溢出
2. 語言切換下拉在**行動版選單**裡的位置與觸控目標
3. 隱私頁的分析開關（需先設 `NUXT_PUBLIC_GTAG_ID` 才看得到）在深色模式下的對比
4. 訂閱表單在窄斷點是否正確堆疊（`max-sm:flex-col`）

---

## 8. 不做什麼

- **不翻 `content/`** —— D-17
- **不出貨日文** —— D-16，骨架已備妥且由護欄保持同步
- **不做 cookie 同意橫幅** —— 本站不用 cookie 做任何追蹤或個人化（只有兩個 localStorage 值），橫幅會是名實不符的儀式
- **不動下載連結與「開源發布」文案** —— §7.2，屬產品決策
- **不動 `L2/`**

---

## 9. 交接：上線前要設的環境變數

見 [.env.example](../../Src/.env.example)。四個全部可留空，留空時對應功能安全停用。

| 變數 | 缺了會怎樣 | 卡在哪 |
|---|---|---|
| `NUXT_PUBLIC_SITE_URL` | canonical / hreflang 指向佔位網域 | **Q10-a 網域未購買** |
| `NUXT_PUBLIC_GTAG_ID` | 完全沒有分析（頁面正常） | 需建立 GA4 資源 |
| `NUXT_PUBLIC_CONTACT_EMAIL` | 聯絡連結導到訂閱表單 | **Q14 未提供** |
| `NUXT_BUTTONDOWN_API_KEY` | 表單顯示「訂閱功能尚未啟用」 | 需開 Buttondown 帳號（D29） |

> 🔴 `NUXT_BUTTONDOWN_API_KEY` 在 Vercel 要標記 **Sensitive**，並**只設 Production**。
> 與 [D21](./待討論問題.md) 對私鑰的論證同一條：Vercel 的 preview 部署預設任何人拿到網址就能存取。
