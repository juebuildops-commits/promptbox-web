> 🗂️ **本文提及的 `L2/` 已於 2026-08-28 移除。**
> 它是遷移前的靜態原稿，依 D-8 保留作為逐頁對照組；AC-1 / AC-10 / AC-27 的目視 parity
> 已於 2026-08-28 確認完畢，任務結束後整份移出專案。
>
> 本文**刻意不改寫** —— 它記錄的是遷移當時的依據與驗收方式，改掉等於竄改決策紀錄。
> 文中所有 `../../L2/...` 連結因此失效，這是預期內的。原稿若需回溯，在 App 專案的歷史版本中。

---

# PRD — 階段一：官網 Nuxt 4 遷移

> **目標**：把現有 5 支手寫 HTML 搬到 Nuxt 4，**視覺與行為零變化**，為後續的 Content 化、i18n、會員區鋪路。
> **狀態**：待動工
> **建立日期**：2026-08-27
> **前置文件**：[待討論問題.md](./待討論問題.md)

---

## 1. 背景

現況是 5 支手寫 HTML（共約 174KB）+ Tailwind v4 CLI + 一支 114 行的 `L2/js/main.js`（L2 已依 D5 移出專案）。導覽列、頁尾、主題切換在 5 個檔案裡各複製一份，改一次要改五次。

本階段**不解決任何產品問題**，只換地基。它的價值在於讓後面三件已決定要做的事變成可能：Markdown 化的 changelog / docs、三語系、會員區。

**這一版的成功定義是「看不出差別」。** 任何視覺變化都算缺陷，除非本文件明列為例外（只有一項，見 §3 D-6）。

---

## 2. 範圍

### 2.1 範圍內

- 5 個頁面遷移：`index` / `download` / `pricing` / `docs` / `changelog`
- 共用外框（Header / Footer / 主題切換 / 行動選單）元件化
- `main.js` 五項行為移植
- 設計 token 與資產搬遷
- Vercel 部署上線
- 現況缺陷 F1 / F2 / F3 / F6 修正（見 §9）

### 2.2 範圍外（明確不做）

| 項目 | 歸屬階段 |
|---|---|
| i18n 三語系 | 階段三 |
| GA4 / 隱私頁 / email 訂閱表單 | 階段三 |
| changelog / docs 改 Markdown（`@nuxt/content`） | 階段二 |
| 圖片最佳化（`@nuxt/image`） | 階段二 |
| 字型自架 | 階段三（見 §7 R-6） |
| 會員區 / 登入 / 金流 / 授權簽發 | 階段五、六 |

---

## 3. 技術決策

| # | 決策 | 理由 |
|---|---|---|
| D-1 | **Nuxt 專案根 = `src/`**（自己的 `package.json`、`nuxt.config.ts`） | 不用 `srcDir` 硬凹。Nuxt 4 才剛把預設改成 `app/`，再改一次會讓所有官方文件與社群範例的路徑都要自行翻譯 |
| D-2 | 沿用 Nuxt 4 預設目錄結構（`app/` / `public/` / `server/`） | 同上 |
| D-3 | Tailwind v4 走 **`@tailwindcss/vite`**，不用 `@nuxtjs/tailwindcss` | 後者是 v3 時代的產物 |
| D-4 | 全站 **prerender**（`routeRules`），產物為純靜態 | 100% 流量在行銷頁，無 SSR 需求；會員區到階段五才以 `ssr: false` 加入 |
| D-5 | 部署 **Vercel** | 已拍板；Nitro 有一級 preset |
| D-6 | ⚠️ **唯一的刻意改變**：移除 `style.css` 第 1 行的 `@import url(google fonts)` | 字型目前**被載入兩次**（CSS `@import` + HTML `<link>`）。CSS 內的 `@import` 會阻塞渲染，保留 `<link>` 那份 |
| D-7 | 資產全部放 `public/assets/`，CSS 的 `url()` 改**絕對路徑** `/assets/...` | 現行 `.icon--*` 用 `../assets/*.svg` 相對路徑，搬家後相對基準會變。改絕對路徑一次解決，不再有歧義 |
| D-8 | `L2/` 原封不動保留 | 逐頁對照用。parity 確認後再改名 `_legacy/` |

---

## 4. 目標結構

```
promptbox-web/
├── L2/                      ← 原封不動（對照組）
├── Docs/
└── src/                     ← Nuxt 專案根
    ├── nuxt.config.ts
    ├── package.json
    ├── docs/                ← 本文件所在
    ├── public/
    │   ├── assets/          ← 圖片、SVG、icon
    │   └── favicon.ico
    └── app/
        ├── app.vue
        ├── assets/css/
        │   └── style.css    ← 由 L2/css/style.css 搬入（含 @theme token）
        ├── components/
        │   ├── AppHeader.vue
        │   ├── AppFooter.vue
        │   ├── ThemeToggle.vue
        │   ├── MobileMenu.vue
        │   └── OsDownloadCta.vue
        ├── composables/
        │   └── useOsDetect.ts
        ├── layouts/
        │   └── default.vue
        └── pages/
            ├── index.vue
            ├── download.vue
            ├── pricing.vue
            ├── docs.vue
            └── changelog.vue
```

> `L2/css/output.css`（63KB）是 Tailwind CLI 的**產物，不搬**——Nuxt 會自己編譯。

---

## 5. 功能需求

### FR-1　頁面遷移（5 頁）

逐頁 1:1 搬運 HTML 內容，只做以下三種必要改寫：

1. 檔名連結 `href="pricing.html"` → `href="/pricing"`（`<NuxtLink>`）
2. 重複的外框（Header / Footer）抽成元件（FR-2）
3. **`{{ }}` 轉義（FR-1a）**

#### 🔴 FR-1a　`{{ }}` 轉義 — 本階段最高風險項

實測全站有 **15 處** `{{...}}`，且**全部是產品核心概念**：

| 檔案 | 出現內容 | 處數 |
|---|---|---|
| `docs.html` | `{{@prompt:12}}`、`{{@prompt:34}}`、`{{@prompt:N}}`、`{{主題}}`、`{{佔位符}}`、`{{字數}}`、`{{角色}}`、`{{語氣}}`、`{{變數}}` | 8 |
| `changelog.html` | `{{@prompt:N}}`×2、`{{name}}`、`{{變數}}` | 4 |
| `pricing.html` | `{{variable}}`×2 | 2 |
| `index.html` | `{{variable}}` | 1 |

Vue 會把這些當成**插值運算式**求值，結果是渲染成空白或直接編譯失敗。

**處理方式**：包含 `{{ }}` 的區塊一律加 `v-pre`，或改用 `<span v-text="'{{變數}}'">`。**優先用 `v-pre`**——它是宣告式的，日後有人再貼一段含 `{{ }}` 的示範文字進同一個區塊也自動安全。

**驗收**：5 個頁面上這 15 處必須逐字顯示，一字不差（AC-3）。

---

### FR-2　共用外框元件化

| 元件 | 取代什麼 | 備註 |
|---|---|---|
| `AppHeader` | 5 份重複的 `<header>` | 導覽 active 狀態改由當前路由推導，取代手寫的 `aria-current="page"` |
| `AppFooter` | 5 份重複的 `<footer>` | |
| `MobileMenu` | burger 開關 + 點連結自動關閉 | |
| `ThemeToggle` | 主題切換鈕 | |
| `GridOverlay` | `?grid=1` 疊圖層 | |
| `OsDownloadCta` | `data-os-cta` / `data-os-label` / `data-os-note` | |
| ~~`GridOverlay`~~ | — | FR-6 已移除，不做 |

**語言切換鈕**：本階段**保留但仍不接功能**（維持現況），階段三接上 i18n。**不要刪掉**，刪了階段三還要重排版面。

---

### FR-3　主題切換 + 防 FOUC

現行 `L2/index.html`（L2 已依 D5 移出專案） 的 `<head>` 裡有一段**同步 inline script**，在首次繪製前讀 `localStorage.pb-theme` 並掛上 `.dark`。

🔴 **這段不能改寫成 Nuxt plugin。** plugin 在 hydration 之後才執行，深色模式使用者每次載入都會看到一閃的白底。

**做法**：透過 `nuxt.config.ts` 的 `app.head.script` 以 `innerHTML` 原樣注入，維持它在 `<head>` 中的同步執行位置。

切換行為（`localStorage` 寫入 + `aria-pressed`）移入 `ThemeToggle` 元件。

---

### FR-4　OS 偵測

移植 `detectOS()`，抽成 `useOsDetect()` composable。三個消費點：

1. CTA 按鈕文字（`免費下載 macOS 版` / `免費下載 Windows 版` / `前往下載頁面`）
2. CTA 下方說明文字
3. download 頁對應平台卡加上 `ring-2 ring-brand shadow-xl` 並顯示推薦徽章

⚠️ 靜態預繪時沒有 UA，必須在 client mount 後執行。預繪的預設文案沿用現行的通用版本——**這與現況行為相同**（現行 `main.js` 也是 parse 完才跑），不是新的退步。

---

### FR-5　Docs 側邊欄 Scroll-Spy

原樣移植 `IntersectionObserver` 邏輯（`rootMargin: "-20% 0px -70% 0px"`）。

**刻意不重構**：階段二會用 `@nuxt/content` 內建的 TOC 整段取代它。現在花力氣做漂亮是浪費。

---

### ~~FR-6　`?grid=1` 疊圖模式~~　❌ 不做

**2026-08-27 拍板移除。** 與 Figma 對稿的階段已結束，不移植。`style.css` 內的 `.show-grid` / `.grid-overlay` 樣式一併不搬。

---

### FR-7　設計 token 搬遷

`L2/css/style.css`（8KB，含 `@theme` 區塊與 `.icon--*` 定義）整份搬入 `app/assets/css/style.css`，除 D-6（移除第 1 行 `@import`）與 D-7（`url()` 改絕對路徑）外**逐字不動**。

自訂 token（`brand` / `ink-*` / `surface-*` / `line-*` / `rounded-nav` / `font-ui`）必須全部生效。

---

### FR-8　資產搬遷

`L2/assets/` → `src/public/assets/`，路徑保持 `/assets/...`。

**同時做檔名正規化**：`ExImg/` 底下有 8 個含中文字元的檔名（`index深色板.webp`、`機密授權拒絕.webp`、`卡片串聯示範.webp` 等）。中文檔名在 URL 與 CDN 上會被編碼，容易踩到雜訊。

**現在改是最便宜的時機**——遷移時本來就要重寫每一處引用，之後改就得額外處理外部連結。

---

### FR-9　現況缺陷修正

見 §9。

---

## 6. 元件化的界線

**docs 與 changelog 的內文不元件化。** 那兩頁共 62KB 的手刻 HTML，階段二會整段換成 Markdown。現在拆元件等於做兩次白工。

本階段對這兩頁只做：套上共用外框、`{{ }}` 轉義、連結改寫。內文原樣貼進 `<template>`。

---

## 7. 風險

| # | 風險 | 嚴重度 | 對策 |
|---|---|---|---|
| **R-1** | **`{{ }}` 被 Vue 當插值** — 已實測 15 處，全是產品核心概念 | 🔴 高 | FR-1a，`v-pre`；AC-3 逐字比對 |
| R-2 | 主題切換 FOUC | 🔴 高 | FR-3，inline head script 不可改成 plugin |
| R-3 | Tailwind v4 任意值語法（如 `bg-[radial-gradient(ellipse_1300px_900px_at_30%_0%,...)]`）未被掃描到 | 中 | Tailwind v4 自動偵測 `app/` 下的檔案；AC-1 視覺比對可攔截 |
| R-4 | CSS `mask` 的 `url()` 路徑失效 → 15 個圖示變空白 | 中 | D-7 改絕對路徑；AC-4 |
| R-5 | OS 偵測在靜態預繪下的文案閃動 | 低 | 與現況行為相同，非退步 |
| R-6 | 若貿然改用 `@nuxt/fonts` 自架字型，**Noto Sans TC 是 CJK 字型**，Google CDN 以 unicode-range 分片供應，自架若未妥善子集化體積會暴增 | 中 | **本階段不動字型**，延到階段三與隱私頁一併評估 |
| R-7 | `L2/` 與 `src/` 兩份並存造成混淆 | 低 | D-8；parity 確認後才改名 |

---

## 8. 驗收條件

| # | 條件 |
|---|---|
| AC-1 | 5 個頁面在 **1440 / 768 / 375** 三個斷點、**淺色與深色**兩種模式下，與 `L2/` 逐頁對照無可見差異 |
| AC-2 | 所有內部連結可通，導覽 active 狀態正確 |
| **AC-3** | 🔴 15 處 `{{...}}` **逐字顯示，一字不差** |
| AC-4 | 15 個 `.icon--*` 圖示全部正常顯示（非空白方塊） |
| AC-5 | 主題切換可用、重載後保持選擇、**深色模式下無白底閃動** |
| AC-6 | Windows 與 macOS 上 CTA 文案與 download 頁推薦卡高亮正確 |
| AC-7 | ~~`?grid=1` 疊圖層正常~~ — FR-6 已移除 |
| AC-8 | 行動版選單開關正常，點連結後自動收合 |
| AC-9 | 建置產物為**純靜態**，無任何 serverless function |
| AC-10 | Lighthouse 四項分數**不低於**現行 `L2/` |
| AC-11 | F1 / F2 / F3 / F6 已修正 |

---

## 9. 併同修正的現況缺陷

| # | 問題 | 處理 |
|---|---|---|
| **F1** | 商業授權聯絡信箱是佔位符 `mailto:test1234@google.com`，**目前掛在線上** | 換成真實信箱（**需提供**） |
| **F2** | 早鳥 CTA 是 `onclick="alert('線上金流（Paddle）即將開放！...')"`，**廠商寫錯**（實際用 Polar） | 暫改為不綁廠商的說法。階段三換成 email 訂閱表單 |
| **F3** | 導覽列「切換語言」鈕無任何行為 | 本階段**維持現狀不刪**，階段三接上 i18n |
| **F6** | 根目錄 `package.json` 的三行 script 指向不存在的 `./src/css/style.css` | 遷移完成後刪除根目錄 `package.json`（Nuxt 專案自帶一份） |

---

## 10. 不做什麼（含理由）

- **不重構 docs / changelog 內文** — 階段二整段換掉（§6）
- **不動字型** — CJK 自架有體積風險，延到階段三（R-6）
- **不最佳化圖片** — `@nuxt/image` 屬階段二；本階段動它會讓視覺比對出現無關雜訊
- **不刪語言切換鈕** — 刪了階段三要重排
- **不新增任何頁面或功能**
- **不動 `L2/`**

---

## 11. 交付物

1. `src/` 下可執行的 Nuxt 4 專案
2. Vercel 上的預覽部署（尚未綁正式網域——**網域未購買**，見 [待討論問題.md](./待討論問題.md) Q10）
3. AC-1 的逐頁對照結果記錄

---

## 12. 與後續階段的接點

| 接點 | 本階段留下什麼 |
|---|---|
| 階段二（Content） | `docs.vue` / `changelog.vue` 內文獨立成塊，可整段抽換 |
| 階段三（i18n） | 語言切換鈕保留在版面上；文案集中在頁面元件內，尚未抽 key |
| 階段三（GA4） | 無；`nuxt-gtag` 屆時直接加 |
| 階段五（會員區） | `routeRules` 已就位，屆時為 `/account` 等路由改設 `ssr: false` |

---

## 13. 實作紀錄（2026-08-27 完成）

### 13.1 與本 PRD 的三處偏離

| 偏離 | 原因 |
|---|---|
| **無 `layouts/default.vue`** | 頁尾在首頁沒有上邊框、其餘四頁有，而 layout 收不到頁面傳來的 prop。改為五個頁面各自明確放置 `<AppHeader>` / `<AppFooter>`，比為了一個布林值去繞 layout 更直白 |
| **無 `MobileMenu.vue`** | 行動選單在結構上就巢狀在 header 內層 div，抽出來只會把開關狀態變成 prop drilling。留在 `AppHeader.vue` 內，開關狀態為區域 `ref` |
| **無 `ThemeToggle.vue`** | 主題鈕在桌機列與行動選單各出現一次，兩處 markup 完全不同。抽成 `useTheme()` composable 供兩處共用，比做一個帶 variant 的元件乾淨 |

### 13.2 環境地雷：npm 10.8.2 無法安裝

本機 npm `10.8.2` 的 arborist 在解析 `@vitejs/devtools` 的 peer set 時崩潰：

```
TypeError: Cannot read properties of null (reading 'edgesOut')
    at #loadPeerSet (build-ideal-tree.js:1286)
```

這是 npm 的已知缺陷，與本專案的相依設定無關。**繞法：`npm install --legacy-peer-deps`**（已產生 `package-lock.json`，CI / Vercel 走 `npm ci` 讀鎖檔即可，不受影響）。

⚠️ 若日後要在本機新增套件，同樣需要帶 `--legacy-peer-deps`，或升級全域 npm。

### 13.3 驗收狀態

| # | 條件 | 狀態 |
|---|---|---|
| AC-1 | 五頁三斷點雙主題視覺對照 | ⏳ **需人工目視**（見 13.4） |
| AC-2 | 內部連結與導覽 active | ✅ 產出中 0 條殘留 `.html` 連結；active 由路由推導 |
| **AC-3** | **15 處 `{{ }}` 逐字顯示** | ✅ **16 個 token 與 L2 原始檔分布完全一致** |
| AC-4 | 15 個 `.icon--*` 圖示 | ✅ 15 條規則齊全，12 個 SVG 到位，路徑解析驗證通過 |
| AC-5 | 主題切換無 FOUC | ✅ inline script 在 `<head>` 內、早於 stylesheet |
| AC-6 | OS 偵測 | ⏳ 需在 Windows / macOS 實機各開一次 |
| ~~AC-7~~ | ~~`?grid=1`~~ | — FR-6 已移除 |
| AC-8 | 行動選單 | ⏳ 需人工目視 |
| AC-9 | **產物為純靜態** | ✅ `.output/` 只有 `public/`，**無 server function** |
| AC-10 | Lighthouse 不低於現況 | ⏳ 待部署後量測 |
| AC-11 | F1 / F2 / F3 / F6 | 🟡 F2 ✅、F3 ✅（保留無行為）、**F1 依指示先留著**、**F6 未執行**（見 13.5） |

**額外自動化檢查（非 AC，但比 AC-1 更嚴格的內容保證）**：五頁的可見文字逐行比對，行數完全相同（135 / 79 / 199 / 175 / 196），唯一差異是 F2 那句刻意改寫的文案。

### 13.4 AC-1 需要人工做的事

自動化能證明「文字沒掉、連結沒斷、圖示路徑對」，**證明不了排版**。請在 `npm run dev` 後於 1440 / 768 / 375 三個寬度、淺色與深色兩種模式下，把五頁與 `L2/` 的對應檔案並排比對。

### 13.5 刻意未執行的項目

- **F1**（佔位符信箱）：2026-08-27 指示「先留著」。已集中到 `AppFooter.vue` 的 `CONTACT_EMAIL` 常數，換的時候只改一行
- **F6**（刪除根目錄 `package.json`）：**AC-1 尚未通過前不刪**。它還帶著 `L2/` 的 Tailwind CLI，對照期間可能還要重新產生 `L2/css/output.css`
- **F10 / Q15**（5 條指向未公開 repo 的 Releases 連結）：依 1:1 原則原樣保留，需產品決策，見 [待討論問題.md](./待討論問題.md) Q15
