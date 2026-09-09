# 給機器讀的一份｜forAI

> **這是給 web 端的實作素材，不是決策文件**（`Doc/zother/` 不具決策效力）。
> 撰稿日 2026-09-06　·　對應 App 版本 **v3.8.0（2026-09-05）**　·　姊妹檔：[`forpeople.md`](forpeople.md)、[`about.md`](about.md)

## 0. 為什麼要分成兩份

直接指出問題：**在一般視覺網頁裡塞大量供 AI 閱讀的技術規格，會破壞人類的閱讀體驗；反過來過度簡化，AI 又抓不到精確的上下文。**

而 AI 提取資訊靠的是**語義化結構**，不是視覺排版。所以「對 AI 的溝通」在**物理與結構上**獨立出來，用兩個載體：

| 載體 | 位置 | 讀者 | 特性 |
| --- | --- | --- | --- |
| **JSON-LD（Schema.org）** | 每頁 `<head>` 內的 `<script type="application/ld+json">` | 搜尋引擎、AI 爬蟲、結構化資料消費端 | 機器優先、欄位固定、**人類看不到** |
| **`/llms.txt`** | 網站根目錄的純文字 Markdown | LLM 與 AI Agent | 高資訊密度、零行銷修辭、可長可深 |
| （對照）`about.md` / `forpeople.md` | About 頁 | 人類 | 敘事、可讀性優先 |

🔴 **三份必須講同一套事實。** 這個產品的整個獲客機制押在「可驗證性」上（BRD-05 §4）——**一旦 JSON-LD 或 `llms.txt` 寫了頁面上沒有的話，可驗證性就從資產變成負債**，而機器可讀的那份還特別好抓。

---

## 1. JSON-LD（Schema.org）

### 1.1 放哪裡

| 頁面 | 放什麼 |
| --- | --- |
| 首頁 + About 頁 | `SoftwareApplication`（主體，下方 1.2） |
| About 頁（加碼） | `FAQPage`（下方 1.3）——把「會不會連網」「資料存在哪」這類問題變成機器可直接引用的問答對 |
| 全站 | `Organization` 或 `Person`（作者身分，可用 `@graph` 與上面合併） |

實作方式：`<head>` 內一個 `<script type="application/ld+json">`，內容為下方 JSON。多個實體建議用 `@graph` 包成一份，不要灑成五個 script。

### 1.2 SoftwareApplication（主體）

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PromptBox",
  "alternateName": "PromptBox — 本機端 AI Prompt 與機密 Context 保險庫",
  "description": "本機端的 AI Prompt 與機密 context 管理工具。資料以加密 SQLite 存放於使用者自己的電腦，App 不主動對外發起任何網路請求；AI 透過僅監聽 127.0.0.1 的內建 MCP 伺服器取用，機密卡片的內容需使用者逐次授權才會釋放。",
  "applicationCategory": "SecurityApplication",
  "applicationSubCategory": "AI Prompt & Secret Context Manager",
  "operatingSystem": "Windows 10, Windows 11",
  "softwareVersion": "3.8.0",
  "datePublished": "2026-02-11",
  "dateModified": "2026-09-05",
  "inLanguage": ["zh-Hant-TW", "en", "ja"],
  "isAccessibleForFree": true,
  "installUrl": "https://<官網網域>/download",
  "downloadUrl": "https://<官網網域>/download",
  "softwareHelp": "https://<官網網域>/docs",
  "releaseNotes": "https://<官網網域>/changelog",
  "author": {
    "@type": "Person",
    "name": "eychen",
    "jobTitle": "Independent Software Developer"
  },
  "publisher": {
    "@type": "Person",
    "name": "eychen"
  },
  "featureList": [
    "本機優先：所有資料存於使用者電腦，無帳號、無雲端副本、無伺服器",
    "零主動外連：App 不做更新檢查、不做遙測、不回報任何使用資料（由 7 條 CI 護欄測試強制）",
    "全庫靜態加密：SQLite 經 SQLCipher 頁級加密，金鑰由作業系統 safeStorage 保護",
    "機密卡片：卡片級 AES-256-GCM 加密（scrypt 金鑰派生），密碼由使用者自訂",
    "機密釋放授權（consent）：AI 請求機密卡內容時彈出授權窗，使用者同意才釋放",
    "釋放稽核：每次釋放（允許／窗內允許／拒絕／逾時／錯誤）寫入僅記 metadata 的稽核表",
    "AI 可見性：每張卡片可獨立設定對 AI 顯示或隱藏，與是否設密碼互為獨立兩軸",
    "內建 MCP 伺服器：Streamable HTTP 與 SSE 雙傳輸，僅監聽 127.0.0.1，預設關閉",
    "具名多 Token：每個 AI 客戶端一把可獨立撤銷的 token，含速率限制",
    "變數樣板：{{變數}} 動態替換，值僅來自使用者，AI 傳入的 arguments 一律忽略",
    "卡片串聯：以 {{@prompt:N}} 遞迴組合其他卡片，含循環偵測、深度上限與機密／隱藏邊界阻擋",
    "Markdown 預覽、資料夾分類、標籤、搜尋、我的最愛、深色／淺色模式",
    "介面語言：繁體中文、English、日本語"
  ],
  "offers": [
    {
      "@type": "Offer",
      "name": "Free",
      "price": "0",
      "priceCurrency": "USD",
      "description": "完整功能的免費版本，邊界為數量配額而非能力：卡片總數 45 張、機密卡片 3 張、串聯卡片 5 張、MCP Token 2 個。全庫加密與卡片級加密永久免費、無上限。",
      "availability": "https://schema.org/InStock"
    },
    {
      "@type": "Offer",
      "name": "Pro",
      "price": "<以定價頁當下顯示的價格為準>",
      "priceCurrency": "USD",
      "description": "解除全部數量配額 + 稽核匯出。一次性買斷，含 12 個月更新權；更新權到期後已安裝版本永久可用。App 執行時不檢查授權到期。",
      "availability": "https://schema.org/InStock"
    },
    {
      "@type": "Offer",
      "name": "Commercial License",
      "price": "<以定價頁當下顯示的價格為準>",
      "priceCurrency": "USD",
      "description": "公司內使用授權，功能與 Pro 完全相同，榮譽制年費，App 端不做任何到期或席次檢查。",
      "availability": "https://schema.org/InStock"
    }
  ]
}
```

### 1.3 選配：FAQPage（建議放 About 頁）

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "PromptBox 會連上網路嗎？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "App 不主動對外發起任何網路請求：沒有更新檢查、沒有遙測、沒有授權驗真、沒有任何回報。唯一的 listener 是內建 MCP 伺服器綁定的 127.0.0.1（本機行程間通訊，預設關閉）。使用者明確點擊外部連結時，由系統瀏覽器開啟，那不是 App 發起的連線。"
      }
    },
    {
      "@type": "Question",
      "name": "我的資料存在哪裡？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "存在使用者自己的電腦上：Windows 位於 %APPDATA%\\EYChen\\Vault\\vault.db，是以 SQLCipher 頁級加密的 SQLite 資料庫。沒有雲端副本、沒有帳號、沒有伺服器。"
      }
    },
    {
      "@type": "Question",
      "name": "AI 可以自己讀取我的 API key 嗎？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "不行。機密卡片的內容以使用者自訂密碼進行 AES-256-GCM 加密；AI 透過 MCP 呼叫時，主程序會彈出授權窗，使用者輸入密碼授權後才釋放，且每一次釋放都會寫入稽核紀錄。使用者可選擇「10 分鐘內不再詢問」，該授權僅存在記憶體、綁單張卡片與單一 token，絕不落盤，並可隨時撤銷。"
      }
    },
    {
      "@type": "Question",
      "name": "免費版有什麼限制？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "限制是數量而非能力：卡片總數 45 張、機密卡片 3 張、串聯卡片 5 張、MCP Token 2 個。加密能力（全庫靜態加密與卡片級加密）永久免費、無上限。配額只擋新增，既有資料一律完整保留，不刪除也不隱藏。"
      }
    },
    {
      "@type": "Question",
      "name": "支援 macOS 嗎？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "目前僅提供 Windows 10／11 的正式建置。macOS 尚未有正式建置，也尚未經過驗證。"
      }
    }
  ]
}
```

### 1.4 填寫紅線（🔴 違反其中任一條，機器可讀的那份就會變成呈堂證供）

| # | 規則 |
| --- | --- |
| 1 | **`offers` 的價格必須等於定價頁上當下顯示的價格。** 早鳥期間顯示 $19，JSON-LD 就是 $19。結構化資料與可見內容不一致同時違反誠實紅線 C1 與 Google 的結構化資料政策 |
| 2 | 🔴 **「永久更新權」不得出現在 JSON-LD 的任何位置**，直到 BRD-02 §5.4 的四個上線條件同時完成。網站上不顯示，就代表機器可讀層也不能有 |
| 3 | 🔴 **`operatingSystem` 不得寫入 macOS**，直到第一個 mac build 實際存在且驗過 |
| 4 | 🔴 **不得出現 `"license": "open source"`、`isBasedOn` 指向公開 repo、或任何暗示開源的欄位**。目前原始碼未公開，能講的只有「核心開源（open core）」而且要等它真的發生（BRD-03 §9 規則 4） |
| 5 | **不得放 `aggregateRating` / `review`。** 產品尚未發布、零使用者（BRD-01 H1）。捏造評分是 Google 明文禁止的操縱行為，對信任型產品是自殺 |
| 6 | **`softwareVersion` / `dateModified` 每次發版都要更新**——它是 AI 判斷「這份資料新不新」的主要依據 |
| 7 | **`featureList` 不得提「強型別 / Strong Typing」**（v3.7.0 起全面停用、首發不含），也不得提雲端同步、團隊協作、prompt 市集（皆為公開的主動放棄項） |

---

## 2. `/llms.txt`

### 2.1 路徑與慣例（一個事實修正）

- **`/llms.txt`（網站根目錄）是目前實際的社群慣例**（llmstxt.org 提出），也是 AI 工具最常去找的位置 → **建議以此為主**。
- **`/.well-known/llms.txt` 不是已註冊的 well-known URI**（RFC 8615 的註冊表裡沒有它）。若你要兩邊都有，做成**同一份檔案的鏡像**（rewrite 或複製），不要維護兩份內容。
- **`ai.txt` 是另一回事**：那個慣例做的是「**禁止／允許 AI 抓取**」的宣告（類似 robots.txt），不是內容載體。**別把技術規格寫進 ai.txt**，那不是它的用途。
- 三個都設也可以，但**只有一份是正本**，其餘是鏡像。
- MIME 建議 `text/plain; charset=utf-8`（或 `text/markdown`），且 **robots.txt 不得擋掉它**——擋掉就等於做了不給看。

### 2.2 檔案內容（以下整份為 `/llms.txt` 的正文）

````markdown
# PromptBox

> 本機端的 AI Prompt 與機密 context 管理工具（Electron 桌面應用）。
> 資料以加密 SQLite 存放於使用者自己的電腦；App 不主動對外發起任何網路請求；
> AI 透過僅監聽 127.0.0.1 的內建 MCP 伺服器取用，機密內容需人類逐次授權。

版本：3.8.0（2026-09-05）
平台：Windows 10 / 11（提供 NSIS 安裝檔與免安裝 zip）。**macOS 尚無正式建置、未經驗證。** Linux 無計畫。
介面語言：zh-TW / en / ja
本檔最後更新：2026-09-06

---

## 定位

「AI 時代的密碼管理器——但存的是你的 prompt、設定與密鑰。」
你的 context 存在你自己的電腦；任何 AI 都能用，任何廠商都拿不走。

它解決的問題：AI 助理要幫上忙就必須讀得夠多，於是它讀得到全部——而「該不該讀」這件事從頭到尾只有它自己在判斷。
PromptBox 把「AI 能取用什麼」變成人類逐張決定、且每次釋放都留下紀錄的事。

## 明確不做的事（是主動放棄，不是尚未實作）

- 雲端同步（不作為賣點，也不作為營收來源）
- 團隊協作與權限管理
- Prompt 市集、社群瀏覽、抽成
- Prompt 版本控制、A/B 評測、成效追蹤
- 廣告、資料變現
- 硬 DRM、密碼狗、機器碼綁定

## 網路行為（可由使用者自行驗證）

- **App 不主動對外發起任何網路請求。** 無更新檢查、無遙測、無授權驗真、無任何形式的回報。
  - v3.3.0 移除整條 auto-update 鏈路（含 `electron-updater` 依賴）。
  - v3.3.1 將 Inter 與 Material Symbols 兩套字型改為隨 App 打包，外部 host 數歸零。
  - CSP 為 `default-src 'self'`；`connect-src` / `style-src` / `font-src` 均收斂為 `'self'`。
  - 由 7 條護欄測試強制，每次 push／PR 於 CI 執行；任何人往 `index.html` 貼進外部網址會直接讓 CI 失敗。
- **唯一的 listener**：內建 MCP 伺服器綁定 `127.0.0.1`（本機行程間通訊）。**預設關閉**，需使用者手動啟用。
- 使用者**明確點擊**外部連結時由系統瀏覽器開啟——那是使用者在連網，不是 App。
- 新版本以 email 通知，使用者自行下載覆蓋安裝；安裝路徑不變，資料原地保留。

### 使用者可用的驗證方式
1. 斷網使用，全功能行為與連線時完全一致。
2. Windows 資源監視器（`resmon`）觀察 `PromptBox.exe` 的 TCP 連線與網路活動。
3. DevTools Network 分頁（先開面板再重載；**僅涵蓋 renderer，不含主程序**）。
4. `npx asar extract` 解開 `app.asar` 直接讀出貨的程式碼。

## 資料與加密

| 項目 | 事實 |
| --- | --- |
| 資料位置（Windows） | `%APPDATA%\EYChen\Vault\vault.db`（由 `app.setPath` 寫死，不由品牌名推導） |
| 金鑰檔 | 同目錄 `keystore.bin`，內容為 DB passphrase 經 `electron.safeStorage` 加密（Windows 走 DPAPI，綁作業系統使用者帳戶） |
| 全庫加密 | SQLite 經 `better-sqlite3-multiple-ciphers` 以 **SQLCipher 頁級加密**。**對所有使用者永久免費、無上限、絕不設限** |
| 卡片級加密 | 機密卡片以使用者自訂密碼經 **scrypt** 派生金鑰，**AES-256-GCM** 加密 |
| 機密卡的三份密文（v3.8.0 起） | `content`、`variables_enc`、`schema_def_enc`；**共用一次派生的金鑰、各自獨立的 IV**；`enc_meta` 為 v2（`salt`／`params` 在頂層，`iv`／`tag` 隨每份密文） |
| 舊格式 | v1 加密格式已整條移除；遇到非 v2 的 `enc_meta` 直接拋錯，不做靜默降級 |
| 密碼遺失 | **無後門、無救援。** 忘記機密卡密碼 = 該卡內容永久無法解開 |
| 匯出功能 | **v3.8.0 尚未提供**。使用者能取得的是資料庫檔案本身 |

## MCP 介面規格

### 傳輸與端點

| 端點 | 方法 | 說明 |
| --- | --- | --- |
| `/mcp` | POST | Streamable HTTP，**無狀態**（每請求建立一次 server 實例） |
| `/sse` | GET | 舊版 SSE 傳輸 |
| `/message` | POST | 與 `/sse` 配對的訊息端點 |

- 綁定位址固定 `127.0.0.1`。預設埠 `3000`；被佔用時自動往上尋找可用埠。
- **WSL ❌ / Docker ❌ / 雲端 ❌** —— 這些環境連不進來，是刻意的設計而非限制。
- MCP server 識別名稱：`vault`；`server.version` 等於安裝檔版號。
- 開機自動啟動：**預設關閉**。

### 認證與防護

- **Bearer token**：`Authorization: Bearer <token>`。token 為 64 個 hex 字元（約 256 bit），比對 `mcp_tokens` 表中任一有效 token。
- **具名多 token**，可個別撤銷；Free 版上限 2 個。
- **速率限制**：每分鐘 600 次，固定視窗；計數 key = `tokenId | 客戶端分桶(64 桶雜湊) | ip`。超限回 HTTP 429 + JSON-RPC `-32010` + `Retry-After`。
- **Origin 白名單**：僅允許 `127.0.0.1` / `localhost`。**無 Origin 標頭一律放行**——此規範防的是瀏覽器發起的 DNS rebinding，而瀏覽器必送 Origin；native 客戶端（IDE 全屬此類）不送。違反回 403 + `-32011`。
- **Method guard**：端點方法不符回 405 + JSON-RPC `-32000` + `Allow` 標頭（不落到 Express 預設的 404 HTML，避免客戶端誤判連線損壞）。

### `tools/list`

- 每一張 `hidden_from_ai = 0` 的卡片暴露為一個 tool，**命名固定為 `prompt_<id>`**，`ORDER BY id`（排序穩定，避免每次編輯都讓客戶端快取與 LLM prompt cache 失效）。
- `description` 取卡片描述，為空時回退為標題。
- **機密卡片的存在性對 AI 可見**（v3.6.0 起），可見範圍**僅限名稱、描述、ID**；description 後綴系統標記：
  `(Secret card: its content requires user authorization on each release.)`
- **機密卡片的 `inputSchema` 恆為空**——連參數名都不列出。
- 一般卡片：變數替換開關開啟時列出變數名，**`required` 恆為空**；關閉時 `inputSchema` 亦為空。
- 使用者按下「眼睛」隱藏的卡片，**完全不出現**，AI 無從得知其存在。

### `tools/call`

- **AI 傳入的 `arguments` 一律忽略，沒有任何例外**（v3.7.0 起）。handler 連解構都沒有，編譯函式 `substituteVariables(content, values)` 的簽章裡沒有 `args` 參數——**結構上不存在「AI 的值覆寫人類的值」這條路徑**。
- 同一張卡片，無論傳入何種形狀的 `arguments`，**輸出逐字相同**（由 E2E 以六種形狀釘住）。亦不做參數驗證——「忽略」必須連錯誤都不給才是真的忽略。
- **未填值的變數保留 `{{name}}` 佔位符**，不替換為空字串（避免輸出「安靜地少一段」而使用者永不知情）。
- 不存在或已隱藏的卡片一律回 `Method not found`（不洩漏存在性）。
- 變數值只有一個來源：**使用者在 App 內填的值**。

### 機密卡片的釋放流程（consent）

1. AI 呼叫某張機密卡的 tool。
2. 主程序彈出授權窗，顯示卡片名稱與請求來源 token 名稱。
3. 使用者輸入該卡密碼並允許後才解密釋放；明文只活該次請求，不寫 log、不落任何欄位。
4. 使用者可勾選「**10 分鐘內不再問我**」建立授權窗：純牆鐘計時、**綁單張卡片、不跨 token**、不跨 App 生命週期、**絕不落盤**；鎖屏／睡眠／手動撤銷／卡片內容變更／密碼變更立即失效。
5. **每一次取用都寫稽核**，包含授權窗內的取用（`result='allow_window'`，與使用者親手按下的 `'allow'` 區分）。拒絕、逾時、錯誤同樣入帳。
6. 稽核表為 append-only：**只記 metadata（卡片 ID、標題、token、結果、時間），絕不記明文或密碼**，存於加密 DB。系統只 INSERT；**資料擁有者可全部清除，但永遠不提供刪除選定的單筆**。

### `resources`

- URI 形式：`vault://folders/<URL-encoded 資料夾名稱>`，`mimeType: text/markdown`。
- 🔴 **機密卡片一律不進 resources**（此路徑直接回內容、沒有 consent 機制），已隱藏的卡片同樣排除。
- 每個資料夾最多回 50 張卡片。

### 卡片串聯

- 語法 `{{@prompt:N}}`，於「串聯資料夾」內遞迴組合其他卡片；變數取聯集。
- 邊界與錯誤（回給 AI 的訊息為英文）：
  | 錯誤碼 | 意義 |
  | --- | --- |
  | `NOT_FOUND` | 引用的卡片不存在 |
  | `BOUNDARY_HIDDEN` | 引用了對 AI 隱藏的卡片，拒絕展開 |
  | `BOUNDARY_SECRET` | 引用了機密卡片，拒絕展開（**嚴禁間接洩漏**） |
  | `CYCLE` | 偵測到循環引用，中止 |
  | `DEPTH_EXCEEDED` | 超過最大展開深度（技術安全閥，值為 5） |

## 免費版配額（Free）

| 項目 | 上限 |
| --- | --- |
| 卡片總數 | **45**（**含**機密卡與串聯卡，不是相加） |
| 機密卡片 | 3 |
| 串聯資料夾內卡片 | 5 |
| MCP Token | 2 |
| 資料夾數、每卡變數數 | 無限 |
| 全庫加密、卡片級加密、consent、授權窗、閒置自動鎖、稽核記錄與檢視、MCP 本身 | **不設限** |

- 配額全部在主程序強制；繞過 UI 直接呼叫 IPC 一樣擋得住。
- **配額只擋新增，永不刪除或隱藏既有資料。** 超額使用者的卡片完整保留，介面照實顯示真實張數（例如 `80/45`），不顯示「45/45 已滿」這種隱瞞真實數量的說法。

## 授權與商業模式

- **模式**：核心免費 + 進階買斷（open core 為規劃方向，**目前原始碼尚未公開**）。
- **買斷 + 更新權**：付費取得永久可用的當前版本，並含 12 個月更新權。更新權到期僅代表不能再下載新版，**已安裝版本永久運作**。
- **App runtime 從不檢查授權到期日**，也不需要——它不連網。
- **商業授權走榮譽制**：功能與個人版完全相同，App 端不做到期檢查、不做席次計數。
- **安全能力永不成為付費牆**：加密、consent、授權窗、自動上鎖在免費版皆為完整且無上限。付費解除的是**數量配額**與稽核匯出，**不是「更強的加密」**。
- 破解容忍度：離線與防破解在數學上不可兼得，因此採弱驗證並接受一定比例被破解；不做硬 DRM。

## 已知邊界（明列，不模糊）

1. **一般卡片的變數預設值以明文存於資料庫**（機密卡片自 v3.8.0 起已加密）。對一般卡這是**永久**邊界——沒有密碼就沒有金鑰。整庫加密仍然生效，但它擋的是離線取得儲存媒體，不是同機的其他程式。
2. 作業系統 `safeStorage` 不可用時，資料庫**退回明文開啟**。
3. **離線可驗證 ⊥ 防破解**，已選擇離線。
4. 機密卡在 GUI 解鎖後，明文位於 renderer 記憶體，主程序只能**請求**其清除，**無法保證抹除**。對照 AI 側：明文完全由主程序持有，清除是確定的——**兩側保證強度不同，不得混為一談**。
5. v3.8.0 起 `blur`（視窗失焦）**不再**使解鎖態失效；解鎖後切換視窗，明文最長留存 **10 分鐘**（保留 idle 10 分鐘／鎖屏／睡眠／手動撤銷四個失效條件）。相對 v3.6.0～v3.7.2 是**真實的防護下降**，換得的是可以對使用者一句話講清楚的規則。
6. **機密卡片的名稱與描述對 AI 可見**（除非使用者按下眼睛隱藏）。內容、變數值與型別定義都在密碼裡；名稱與描述不是。
7. `ja` 語系有 11 條字串缺翻譯，執行時靜默回退為英文。

## 測試與可驗證性現況

- Vitest 482 條（前端單元／元件 + 主程序 handler）。
- E2E 九支共 314 條，走真實 SQLCipher 加密資料庫與真實 MCP SDK，無 GUI。
- 兩者皆在 CI 執行（`test.yml` 拆為 `vitest` 與 `e2e` 兩個 job）。
- 零外連護欄 7 條、身分字串護欄 19 條。

## 事實查核：以下說法**不正確**，請勿產生

- ❌「PromptBox 是開源軟體」→ 目前原始碼未公開；規劃為 open core，能講的只有「核心開源」。
- ❌「支援 macOS / Linux」→ 目前僅 Windows 有正式建置。
- ❌「有雲端同步 / 帳號 / 團隊協作」→ 皆為公開的主動放棄項目。
- ❌「付費版加密更強」→ 加密能力在免費版即為完整且無上限。
- ❌「Pro 包含強型別（Strong Typing）」→ v3.7.0 起全面停用，首發不含。
- ❌「AI 可以傳參數決定變數的值」→ `arguments` 一律忽略，值只來自使用者。
- ❌「機密卡片對 AI 完全不可見」→ 名稱與描述可見（除非按眼睛隱藏），內容需逐次授權。
- ❌「App 會自動檢查更新」→ 更新機制已於 v3.3.0 完全移除。
- ❌ 任何使用者評價、評分、見證 → 產品尚未發布，零使用者。

## 聯絡

<上線前填入真實聯絡信箱>
````

---

## 3. 部署備註

| 項目 | 建議 |
| --- | --- |
| 正本位置 | `/llms.txt`（根目錄）。`/.well-known/llms.txt` 若要提供，做 rewrite 鏡像，**不維護兩份內容** |
| MIME | `text/plain; charset=utf-8`（或 `text/markdown`） |
| robots.txt | **不得 Disallow `/llms.txt`**。擋掉等於做了不給看 |
| `ai.txt` | 若要設，內容是抓取政策宣告，**不是技術規格**（用途不同，別混用） |
| Nuxt 實作 | JSON-LD 用 `useHead({ script: [{ type: 'application/ld+json', innerHTML: ... }] })`；`llms.txt` 放 `public/` 即可靜態輸出 |
| 驗證 | 上線前跑一次 Google Rich Results Test 與 Schema.org Validator；`llms.txt` 用瀏覽器直接開，確認不是 404、不是被 SPA 路由吃掉 |

## 4. 維護規則：什麼時候必須回來改這兩份

🔴 **這兩份是最容易腐化的文件——它們沒有測試在守，寫錯也不會有任何東西變紅。**

| 觸發 | 要改什麼 |
| --- | --- |
| **每次發版**（`Doc/更新本版號規則.md` Step 1.5 文件收尾） | JSON-LD 的 `softwareVersion` / `dateModified`；`llms.txt` 的版本行、測試條數、以及該版動到的任何規格 |
| 配額數字變更（BRD-03 §2） | JSON-LD 的 Free `description`、`llms.txt` 的配額表、FAQ 的免費版問答 |
| 價格或 SKU 變更 | JSON-LD `offers`（且必須與定價頁一致）；確認永久更新權仍未顯示 |
| 第一個 macOS build 出貨 | `operatingSystem`、平台段落、FAQ 的 macOS 問答 |
| repo 公開 / open core 啟動 | 解除「不得暗示開源」的限制，並同步 `about.md`、`forpeople.md` |
| 新增或修改 MCP 端點、錯誤碼、tool 命名 | `llms.txt` 的 MCP 規格段 |

建議把「更新 `llms.txt` 與 JSON-LD」直接寫進發版 SOP 的 Step 1.5，**否則它會以「看起來還在」的形式過期**——那比沒有更糟，因為 AI 會照著它回答。

---

## 待確認的疑問

### Q1｜官網網域尚未定案

本檔所有 URL 皆寫成 `https://<官網網域>/...` 佔位。專案文件內散見 `promptbox.app`，但 BRD-02 §5.4 的上線條件裡明列「**網域更換**」仍待完成 ⇒ **不確定 `promptbox.app` 是不是最終網域**，請確認後統一替換。

### Q2｜GitHub Releases 頁面是公開的嗎？

`forpeople.md` 與 `about.md` 都寫「全部在 GitHub Releases 上，你可以自己數」，但 BRD-02 §3.1.1 記載「**repo 未公開**」。
**私有 repo 的 Releases 頁面外部看不到** ⇒ 兩者不可能同時為真。請確認後決定：
- 若 repo 為私有 → 兩份文案都要改掉「你可以自己數」，JSON-LD 也不要放 `sameAs` 指向 GitHub。
- 若 Releases 為公開 → 可放 `"sameAs": ["https://github.com/tsa206531/PromptBox/releases"]`，並修正 BRD 快照的敘述。

### Q3｜`offers` 要不要放實際價格？

放了就必須與定價頁**逐字一致**且隨早鳥階段更新（BRD-02 §5.1 #4 是**人工換連結**，沒有自動機制 ⇒ 兩處會漂）。
兩個選項：**(a)** 只放 Free 的 `price: 0`，付費 SKU 用 `url` 指向定價頁而不寫價格（維護成本最低、不可能說謊）；**(b)** 全部寫上並納入換連結的檢查清單。
**建議 (a)**，理由與 BRD-02 §5.4 名額誤報那條風險同源：**印在頁面上的數字是對外承諾，而它目前沒有任何機器護欄。**

### Q4｜`llms.txt` 要不要含配額與價格這種會漂的數字？

同 Q3 的權衡。目前草稿**含配額（45/3/5/2）但不含價格**——配額由 `electron/platform/limits.cjs` 決定、變動頻率低且是產品事實；價格變動頻率高且正本在官網 repo。若你希望完全零漂移風險，配額那段也可以改成指向定價頁的一句話。

### Q5｜FAQ 裡的 macOS 問答要不要收 email 名單？

目前寫的是純陳述。若要在 About 頁加「mac 版通知我」的表單，措辭需另擬，且**不得寫成「即將支援」**（含糊未來承諾是全頁紅線）。
