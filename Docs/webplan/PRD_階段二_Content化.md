> 🗂️ **本文提及的 `L2/` 已於 2026-08-28 移除。**
> 它是遷移前的靜態原稿，依 D-8 保留作為逐頁對照組；AC-1 / AC-10 / AC-27 的目視 parity
> 已於 2026-08-28 確認完畢，任務結束後整份移出專案。
>
> 本文**刻意不改寫** —— 它記錄的是遷移當時的依據與驗收方式，改掉等於竄改決策紀錄。
> 文中所有 `../../L2/...` 連結因此失效，這是預期內的。原稿若需回溯，在 App 專案的歷史版本中。

---

# PRD — 階段二：changelog / docs 內容化 + 資產瘦身

> **目標**：把 changelog 與 docs 兩頁的內文從手刻 HTML 轉為 Markdown，讓「發一版」與「補一段教學」變成加一個檔案，而不是改 30KB 的 HTML。**視覺零變化**。
> **狀態**：✅ 已完成（2026-08-27），AC-18 人工目視待確認
> **建立日期**：2026-08-27
> **前置**：[PRD_階段一_Nuxt遷移.md](./PRD_階段一_Nuxt遷移.md)（已完成）、[待討論問題.md](./待討論問題.md)

---

## 1. 背景

階段一把兩頁原樣搬進 `.vue`，內文仍是手刻 HTML：`changelog.vue` 415 行、`docs.vue` 357 行。

實際痛點很具體：**每發一版 PromptBox，就要手寫一張 `<article>` 卡片**——13 層巢狀 div、精確的 Tailwind class、emoji 與 `<strong>` 的排列。這件事一年會發生十幾次，而且每次都可能打錯一個 class 而不自知。

本階段之後，發一版 = 新增一個 `content/changelog/v3.7.2.md`。

**成功定義仍然是「看不出差別」**——與階段一相同，任何視覺變化都算缺陷。

---

## 2. 範圍

### 2.1 範圍內

- `changelog` 13 張版本卡 → `content/changelog/*.md`（一版一檔）
- `docs` 8 個章節 → `content/docs/*.md`（一節一檔）
- 側邊欄由內容自動生成（取代手寫的 8 條連結）
- `notice` callout → MDC 元件
- 資產瘦身（F5）

### 2.2 範圍外

| 項目 | 歸屬 |
|---|---|
| i18n / GA4 / 隱私頁 / 訂閱表單 | 階段三 |
| 其餘三頁（index / download / pricing）內容化 | **永不**——它們是行銷版面，不是文件，Markdown 幫不上忙 |
| 會員區 / 金流 | 階段五、六 |

---

## 3. 技術決策

| # | 決策 | 理由 |
|---|---|---|
| D-9 | **內容與版面分離**：卡片／章節的外框留在 Vue，**只有內文進 Markdown** | 外框是設計（漸層邊框、徽章、圖示底板），內文才是會變的東西。全部塞進 Markdown 只會逼我們發明一堆 MDC 元件去還原設計 |
| D-10 | changelog **一版一檔**，版號／日期／標語／是否最新 走 frontmatter | 發版時只加檔案不改既有檔。`latest` 由**日期排序推導**，不手動標記——手動標記一定會忘記把上一版的拿掉 |
| D-11 | docs **一節一檔**，`title` / `icon` / `order` 走 frontmatter；**側邊欄由 query 生成** | 現在側欄 8 條連結是手寫的，加一節要改兩個地方。生成之後只剩一個真相來源 |
| D-12 | `.notice` → MDC 元件 `::notice` | 3 種變體、5 個使用點，已有現成 CSS |
| D-13 | 🔴 **不用 `@nuxt/image`** | 見 §3.1 |
| D-14 | 圖片最佳化改為**刪除未引用資產** | 見 §3.1 |
| D-15 | 內文樣式以 `.docs-prose` / `.changelog-prose` 的 CSS 還原，不用 `@tailwindcss/typography` | 原稿的 class 字彙很小（見 §5 FR-11），逐條還原比引入一套 prose 預設值再全部覆寫更可控 |

### 3.1 為什麼不用 `@nuxt/image`

清點後發現 F5 根本不是「圖片沒最佳化」的問題，是**死檔案**的問題：

| | 數量 | 體積 |
|---|---|---|
| `public/assets/` 全部 | 36 | 2.4 MB |
| **未被任何頁面引用** | **16** | **1.8 MB** |

其中 `hero-screenshot.png` 641KB、`icon.ico` 279KB、`feature-2-mcp.png` 182KB 三個檔案就佔了 1.1MB，而且**一個都沒被引用**。

而 `@nuxt/image` 在這個專案會是負分：

- 預設的 IPX provider **需要 runtime server**，直接違反 AC-9（純靜態、無 serverless function）
- 靜態方案 `ipxStatic` 需要 `sharp`（原生模組），在 Windows 本機與 Vercel 各一套建置風險
- 真正需要處理的**內容圖片只有 3 張**（都在 index 頁）

用一套原生相依的圖片管線去處理 3 張圖，不如直接刪掉 1.8MB 的死檔。**`@nuxt/image` 已安裝，本階段將移除。**

---

## 4. 目標結構

```
src/
├── content/
│   ├── changelog/
│   │   ├── v3.7.1.md          ← frontmatter: version, date, summary
│   │   ├── v3.7.0.md
│   │   └── … 共 13 檔
│   └── docs/
│       ├── 1.getting-started.md   ← frontmatter: title, icon, anchor
│       ├── 2.basics.md
│       └── … 共 8 檔
├── content.config.ts          ← 兩個 collection 的 schema
└── app/
    ├── components/content/
    │   ├── Notice.vue         ← MDC ::notice
    │   └── ProseLi.vue        ← FR-13
    └── pages/
        ├── changelog.vue      ← 只剩外框 + query
        └── docs.vue           ← 只剩外框 + 側欄 + query
```

---

## 5. 功能需求

### FR-10　changelog 內容化

13 張卡片轉為 13 個 `.md`。每檔 frontmatter：

| 欄位 | 說明 |
|---|---|
| `version` | `v3.7.1` |
| `date` | `2026-08-26` |
| `summary` | 卡片標題下方那句標語 |

**`latest` 不進 frontmatter**——由日期最大者推導。最新版套 `gradient-border-card shadow-lg` 並顯示「最新版本」徽章，其餘套 `border border-line-200 shadow-sm`。

內文為 Markdown 清單：

```markdown
- 📜 **設定視窗加捲軸**：設定頁加入最大高度與捲軸，確保…
- 🐛 **修復清單開機凍結根因**：修正 Modal 渲染生命週期（`watch(isOpen)`），讓…
```

### FR-11　docs 內容化 + 側邊欄生成

8 個 `<section>` 轉為 8 個 `.md`。frontmatter：`title`、`icon`（對應 `.icon--*`）、`anchor`（section id，即側欄錨點）。

側邊欄由同一份 query 生成，**手寫的 8 條連結刪除**。

內文樣式需 1:1 還原的 class 字彙（全部就這些）：

| 元素 | 原稿 class |
|---|---|
| `h2` | `font-sans font-bold text-2xl text-ink-900` |
| `h3` | `font-bold text-lg text-ink-900`（非首個加 `mt-6`） |
| 內文容器 | `space-y-4 text-ink-700 text-base leading-relaxed` |
| `ul` | `list-disc list-inside space-y-2 pl-2` |
| `ol` | `list-decimal list-inside space-y-2 pl-2` |
| `a` | `text-brand underline font-medium` |
| `pre` / `code` | 已由 `style.css` 定義，不動 |

### FR-12　`::notice` MDC 元件

```markdown
::notice{type="info" icon="lock"}
**100% 完全不連網保證（Zero Outbound）**

自 v3.3.1 起，PromptBox 完全移除更新檢查…
::
```

三種 `type`：`info` / `warning` / `danger`，CSS 已存在於 `style.css`。

### FR-13　`ProseLi`：保留 emoji 的 flex 版面

changelog 每個項目原稿是：

```html
<li class="flex items-start gap-3">
  <span class="text-lg">📜</span>
  <span><strong>標題</strong>：內文</span>
</li>
```

Markdown 的 `- 📜 **標題**：內文` 會渲染成 emoji **內聯**，換行時不會對齊——而這些項目全都是多行的。

`ProseLi` 偵測開頭的 emoji 並拆成獨立 `<span>`，還原 hanging indent。**偵測不到時退回內聯**（安全降級，不報錯）。

### 🔴 FR-14　`{{ }}` 在 Content 渲染路徑的行為 — 本階段最高風險

階段一的 `{{ }}` 問題**沒有消失，只是換了一條路徑**。

Nuxt Content 的 MDC 支援 `{{ $doc.field }}` 這種**資料綁定語法**。docs 與 changelog 內文共有 **13 個** `{{...}}`（`{{@prompt:N}}`、`{{變數}}`、`{{角色}}` 等），全部是產品核心概念。

**必須實測**綁定語法會不會吃掉它們，並依結果決定：關閉 MDC binding、或在 Markdown 端轉義。

**驗收沿用階段一的方式**：產出 HTML 中的 token 分布必須與 `L2/` 原始檔逐字相同。

### FR-15　資產瘦身

刪除 16 個未引用資產中**明確已死**的 4 個：

| 檔案 | 體積 | 判定 |
|---|---|---|
| `hero-screenshot.png` | 641K | 被 `ExImg/index-dark.png` 取代 |
| `icon.ico` | 279K | favicon 走 `icon.png`，且 279K 的 ico 本身不合理 |
| `feature-2-mcp.png` | 182K | 被 `ExImg/MCP.webp` 取代 |
| `01–04.jpg` | 104K | 早期草稿 |

**`ExImg/` 底下 12 個未引用的產品截圖一律保留**——`card-editor` / `consent-approve` / `release-audit` / `lock` / `tray-status` 等，正是本階段 docs 內容化最可能要用到的素材。刪掉它們是把素材當垃圾。

> 所有檔案在 `L2/assets/` 都有原件（D-8），刪除完全可逆。

### FR-16　內容圖片 lazy loading

index 頁 3 張內容圖補 `loading="lazy"` + `decoding="async"`（首屏的 hero 圖除外）。

---

## 6. 風險

| # | 風險 | 嚴重度 | 對策 |
|---|---|---|---|
| **R-8** | **MDC 綁定語法吃掉 `{{ }}`**（13 處） | 🔴 高 | FR-14，先實測再決定；AC-13 逐字比對 |
| **R-9** | **prose 樣式與手刻 class 的落差** — 本階段最可能產生視覺退步的地方 | 🔴 高 | FR-11 / D-15 逐條還原；AC-12 文字比對抓不到樣式問題，**必須人工目視** |
| R-10 | HTML → Markdown 轉換漏內容 | 中 | 沿用階段一的逐行文字比對腳本（AC-12） |
| R-11 | Content v3 的 collection schema 與 query API 與 v2 差異大 | 中 | 以實際安裝的 3.15.2 為準，不照舊文件寫 |
| R-12 | 側欄改為生成後，scroll-spy 的 DOM 查詢失效 | 中 | `.docs-sidebar nav a[href^="#"]` 選擇器不變即可；AC-14 |

---

## 7. 驗收條件

| # | 條件 |
|---|---|
| AC-12 | changelog / docs 兩頁**可見文字逐行比對與 `L2/` 一致**（沿用階段一腳本） |
| **AC-13** | 🔴 13 處 `{{ }}` **逐字顯示**，token 分布與 `L2/` 相同 |
| AC-14 | 側欄 8 項齊全、錨點可跳、scroll-spy 正常 |
| AC-15 | 產物仍為**純靜態**，無 serverless function |
| AC-16 | `public/assets/` 體積下降 ≥ 1MB |
| AC-17 | 新增一個 `content/changelog/*.md` 即出現一張新卡片，**不需改任何 `.vue`** |
| AC-18 | 人工目視：兩頁在 1440 / 768 / 375 三斷點、淺色與深色下與 `L2/` 無可見差異 |

---

## 8. 不做什麼

- **不動 index / download / pricing** —— 它們是行銷版面，不是文件
- **不引入 `@tailwindcss/typography`** —— 見 D-15
- **不用 `@nuxt/image`** —— 見 D-13、§3.1
- **不刪 `ExImg/` 的產品截圖** —— 見 FR-15
- **不動 `L2/`**

---

## 9. 實作紀錄（2026-08-27 完成）

### 9.1 成果

| | 之前 | 之後 |
|---|---|---|
| `changelog.vue` | 415 行手刻 HTML | **134 行**（外框 + query） |
| `docs.vue` | 357 行手刻 HTML | **98 行**（外框 + 側欄 + query） |
| 內容 | 埋在 `.vue` 裡 | `content/` **21 個 `.md`**（13 changelog + 8 docs） |
| `public/assets/` | 2179 KB | **963 KB**（−1216 KB） |

發一版現在是「新增一個 `content/changelog/vX.Y.Z.md`」，不必碰任何 `.vue`。

### 9.2 🔴 FR-14 實測結果：MDC 的確會吃掉 `{{ }}`

用 spike 頁實測四種情境，結果**分歧**：

| 情境 | 結果 |
|---|---|
| 段落純文字 `{{變數}}` | ❌ **靜默消失**（渲染成空字串，不報錯） |
| 行內程式碼 `` `{{變數}}` `` | ✅ 完好 |
| ``` 圍籬區塊 | ✅ 完好 |

`@nuxtjs/mdc` 沒有提供關閉綁定的設定（`renderBinding` 寫死在 `MDCRenderer.vue`）。

**所幸 13 處全部本來就在 `<code>` / `<pre>` 內**，轉換後天然安全。但「未來有人在段落裡打 `{{變數}}` 就會靜默掉字」是必須擋掉的坑 —— 而 `{{變數}}`／`{{@prompt:N}}` 正是這個產品的核心概念，一定會有人這樣寫。

⇒ 新增護欄 **`scripts/check-content.mjs`**，掃描 `content/**/*.md`，把圍籬與行內程式碼塗白後若還有 `{{ }}` 就讓建置失敗。已接進 `npm run generate`，並做過變異測試（塞一個裸露的 `{{變數}}` → 離開碼 1、指出檔名與行號）。

### 9.3 三個轉換期才浮現的缺陷（皆已修）

**① CJK 與 Markdown 強調語法不相容**

`**「密碼保護」**與` 這種寫法：收尾的 `**` 前面是全形標點、後面接非空白字元，依 CommonMark 的 right-flanking 規則**不算結束標記**，於是 `**` 原樣顯示、粗體消失 —— 一樣是靜默的。

⇒ 加入 **`remark-cjk-friendly`**，設在 **`content.build.markdown.remarkPlugins`**（不是 `mdc.remarkPlugins`，後者 Content v3 不讀）。

**② `[ADR-007]` 被當成連結參照**

原稿是純文字，Markdown 會解析成 link reference。⇒ 轉換器一律跳脫 `\[...\]`（後面沒接 `(` 的才跳脫）。

**③ 兩張卡片的徽章漏抓**

v3.3.x 的「零連網里程碑」與 v3.0.0 的「重大版本」在初版轉換中掉了。⇒ frontmatter 加 `badge` 欄位。

> 這三項**都是逐行文字比對抓到的**，不是目視。沒有 AC-12 的話會全部漏掉。

### 9.4 與 PRD 的一處偏離：不做 `ProseLi`

FR-13 原訂寫一個 `ProseLi` 元件，在 render 期偵測開頭的 emoji 並拆成獨立 `<span>`。實作時放棄，改為**在 Markdown 內直接寫內聯 HTML**：

```markdown
- <span class="text-lg">📜</span><span>**設定視窗加捲軸**：設定頁加入…</span>
```

理由：render 期的 emoji 偵測要在 vnode 樹裡找「第一個文字節點」，而 MDC 會用 `MDCSlot` 包住 children，偵測不到就**靜默退回內聯**——那正是最糟的失敗模式（看起來沒壞，但版面錯了）。內聯 HTML 在 CommonMark 中原樣輸出，標籤之間的文字仍照常做 Markdown 解析，因此 `**粗體**` 與 `` `程式碼` `` 都還在，而 DOM 與原稿逐節點相同。

**驗證**：產出的 emoji span 數 **37**，與 `L2/changelog.html` 的 37 完全相同。

### 9.5 一處刻意保留的原始 HTML

`5.secrets.md` 裡的三欄表格**原樣保留 HTML**。原稿的 `<td class="p-3.5 font-bold text-amber-600">` 帶欄位顏色，Markdown 表格語法表達不了。整份文件只有這一張表。

### 9.6 環境發現：Nuxt Content 的相依

- 需要 **`better-sqlite3`**（原生模組），否則 dev/build 直接失敗
- 建置產物含 **845 KB 的 `sqlite3.wasm`（且放了兩份）+ 209 KB worker**，供客戶端查詢用
  - 已確認**不會影響訪客**：它不在 preload 清單、也不在進入點的 chunk 圖中，只有真的在客戶端跑 `queryCollection` 才會抓。本站所有查詢都在建置期完成、結果走 `_payload.json`
  - 代價只是部署目錄多 1.7 MB 的死檔

### 9.7 驗收狀態

| # | 條件 | 狀態 |
|---|---|---|
| **AC-12** | 兩頁可見文字逐行比對 | ✅ **docs 175→175、changelog 196→196，零差異** |
| **AC-13** | 13 處 `{{ }}` 逐字 | ✅ **token 分布與 `L2/` 完全相同** |
| AC-14 | 側欄 8 項 + 錨點 + scroll-spy | ✅ 8 錨點對 8 個 `section[id]`；scroll-spy 選擇器未變 |
| AC-15 | 仍為純靜態 | ✅ 無 serverless function |
| AC-16 | 資產 −1 MB 以上 | ✅ **−1216 KB** |
| **AC-17** | 加一個 `.md` 就多一張卡 | ✅ **實測：加入 `v9.9.9.md` → 卡片出現且自動取得「最新版本」徽章，零 `.vue` 改動**（驗畢已刪） |
| AC-18 | 人工目視兩頁三斷點雙主題 | ⏳ **待你確認** |

**額外的結構性驗證**（AC-12 抓不到樣式，這些抓得到 DOM）：

| 項目 | 產出 | L2 原稿 |
|---|---|---|
| emoji span | 37 | 37 |
| notice 區塊 | 5（3 info / 1 warning / 1 danger） | 5 |
| notice 圖示顏色 | check×2+lock 為 brand、lock 為 red-500、theme 為 amber-500 | 相同 |
| 表格 | 1 | 1 |
| Beta 徽章 | 2 | 2 |
| 版本卡 | 11 + 2 早期摘要 | 11 + 2 |

### 9.8 AC-18 需要人工做的事

自動化能證明「文字沒掉、DOM 節點數對、token 沒被吃」，**證明不了 prose CSS 還原得夠不夠準**——這是本階段最可能出現視覺退步的地方（R-9）。

請 `npm run dev` 後，把 `/docs` 與 `/changelog` 與 `L2/docs.html`、`L2/changelog.html` 並排比對，重點看：

1. `h3` 的上緣間距（原稿首個 h3 無 `mt-6`、其後有）
2. 清單的項目符號位置與行距（`list-inside` + `pl-2`）
3. changelog 項目**換行時**內文是否對齊在 emoji 右側
4. notice 的內距、圖示對齊與三種顏色
5. `5.secrets` 那張表格
