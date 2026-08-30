> ⚠️ **這是 App repo 的 README 副本，不是官網專案的文件。**
> **快照日期**：2026-08-28（版本 v3.7.1）
>
> 當初複製過來是為了在遷移期比對文案與功能敘述。**它不會跟著正本更新** ——
> 引用它之前請先確認正本沒有變動，尤其是版本號、功能清單與紅線相關的敘述。

---

# PromptBox

> 本地端 AI Prompt 管理工具 - 安全策展、AI 精準取用的機密 Context 保險庫

## 📖 簡介

PromptBox 是一個基於 Electron 的本地端應用程式，專為 AI 工作者打造，幫助您高效管理和使用 AI Prompts。v3.0 起升級為「人類策展、AI 安全取用」的機密 Context 保險庫——資料靜態加密、機密卡片密碼鎖定、MCP Tools 精準呼叫。v3.1 再補上「機密釋放（consent）」與「卡片串聯」：機密卡片可在使用者當次授權下安全餵給 AI，Prompt 之間可用 `{{@prompt:N}}` 遞迴組合。v3.2 系列持續收束機密 UX：強型別型別設定 GUI（v3.2）、前端架構重構（v3.2.1）、機密卡片變數支援（v3.2.2）、全站 UI 視覺與操作優化（v3.2.3）。

### ✨ 核心功能

- 📁 **資料夾分類**：使用多層資料夾管理 Prompts
- 🔍 **智慧搜尋**：快速搜尋標題、內容、標籤
- 📋 **一鍵複製**：快速複製 Prompt 到剪貼簿
- ⭐ **我的最愛**：標記常用 Prompts
- 🏷️ **標籤管理**：使用標籤靈活組織
- 📝 **Markdown 支援**：美觀的 Markdown 預覽
- 🎨 **變數樣板** (V1.5)：動態變數替換，提升 Prompt 重用性
- 🌓 **深色/淺色模式**：自動切換主題
- 🔕 **不做更新檢查** (V3.3)：App 內移除所有更新機制，**啟動時不會連上任何伺服器**；新版本以 email 通知，自行至官網下載
- 🧹 **清除快取與重設** (V2.1.2)：設定頁面一鍵還原出廠狀態
- 🔑 **變數 Key 自動清理** (V2.1.3)：儲存時自動移除孤立變數 Key
- 🔌 **MCP 伺服器** (V2.2+)：內建 MCP 伺服器（SSE + Streamable HTTP），讓 Cursor、VS Code、Claude Desktop 等 IDE 直接讀取與呼叫 Prompt
- 🖥️ **System Tray 模式** (V2.2)：關閉視窗後縮小至系統匣，MCP 服務持續運行
- 🔐 **靜態加密** (V3.0)：SQLite 資料庫以 SQLCipher 頁級加密，金鑰由 OS Keychain 保護
- 🛠️ **MCP Tools 化** (V3.0)：每個未鎖定 Prompt 自動暴露為 MCP Tool，AI 可帶參數精準呼叫並取得編譯後純淨字串
- 👁️ **AI 可見性（眼睛）** (V3.0，V3.6.0 正名)：卡片一鍵切換「對 AI 隱藏／顯示」。**v3.6.0 起與密碼徹底解綁**——機密卡也看得到、按得動這顆按鈕
- 🔐 **機密卡片** (V3.0)：卡片級 AES-256-GCM 加密，需自訂密碼才可查看。**v3.6.0 起「有密碼」與「對 AI 隱藏」是兩條正交的軸**：可讓 AI 知道卡片存在（僅名稱／描述／ID），內容仍須逐次授權，參數名不可見
- 🪙 **具名多 Token** (V3.0)：以可撤銷的具名 Token 取代單一共用 Token，含速率限制
- 🔓 **機密釋放 / Consent** (V3.1+)：AI 請求機密卡時主程序彈出授權窗，使用者輸密碼授權後才釋放。**v3.6.0 起** `release_policy` 三檔位停用，可見性改由眼睛（`is_locked`）全權承擔；授權當下可勾「10 分鐘內不再問我」
- 🧾 **釋放稽核** (V3.1)：每次機密釋放（允許/拒絕/逾時）皆寫入 append-only 稽核表（只記 metadata、存於加密 DB），MCP 面板可檢視
- 🔗 **卡片串聯** (V3.1)：在「串聯資料夾」內以 `{{@prompt:N}}` 遞迴組合其他卡片；含循環偵測、深度上限、🔴 鎖定/機密邊界（嚴禁間接洩漏）；變數取聯集
- 🧩 **串聯槽 + 值繼承** (V3.2)：串聯卡改用可編輯**串聯槽**（取代內容框）、**邊打邊即時展開預覽**；被引用卡已填的變數值自動帶入組合卡當預設（不衝突直接帶、同名不同值留空並標示），**不影響被引用卡本身**、永不寫回 content
- 🔣 **機密卡片變數支援** (V3.2.2)：機密卡解鎖後恢復完整變數鏈路（解析 → 填值 → 代入 → 複製），並可更新變數預設值（明文存 DB + 明確警示）；未解鎖零洩漏、密文永不改寫
- 👁️ **密碼可視切換** (V3.2.3)：所有密碼欄位（設定 / 變更 / 移除 / 解鎖）內建顯示/隱藏切換，降低「打錯密碼 → 永久鎖死」的不可逆風險
- ✨ **UI 視覺與操作優化包** (V3.2.3)：標籤灰階降噪、操作按鈕加大、標籤一鍵重設、串聯資料夾歸位固定導覽、預設卡片檢視、編輯 Modal 顯示 `#id`、全站「橘紅 = 機密」視覺語意
- 🚧 **Free 版邊界** (V3.4)：卡片總數 45、機密卡 3、串聯卡 5、MCP Token 2。**配額只擋新增，既有資料一張不少、一個欄位不掉**；超額使用者的卡片完整保留、不刪除也不隱藏
- 🧪 **單元 + 整合測試** (V3.1+)：Vitest 前端單元 / 元件測試 + 後端 handler 測試（`electron/__tests__`），v3.7.1 全套 **443 綠**；另有 E2E 九支 **307 條**走真實加密 DB

## 🚀 快速開始

### 系統需求

- Node.js 18+
- Windows 10/11 或 macOS 10.15+

> **v3.0 升級注意**：首次啟動會將舊明文資料庫備份為 `promptbox.db.plain.bak` 並建立全新加密資料庫。舊資料不會自動遷移（使用者可手動匯入備份）。
>
> **v3.3.1 起：PromptBox 完全不連網。** 不做更新檢查、不做遙測、不回報任何使用資料、不載入任何外部資源——你的卡片一個位元組都不外傳。
> **這件事你不必相信我們，可以自己驗證**（方法見下）。
> 新版本會以 **email 通知**，請至 GitHub Releases 或官網手動下載覆蓋安裝（安裝路徑不變，資料原地保留）。
>
> <sub>誠實揭露：內建 MCP 伺服器會在 `127.0.0.1` 開一個**本機** listener 供 AI 客戶端連入，那是本機行程間通訊、不對外。此外，你**明確點擊**官網或回報表單連結時，會由系統瀏覽器開啟——那是你在連網，不是 App。字型（Inter / Material Symbols）自 v3.3.1 起隨 App 打包，不再走 CDN。</sub>

<details>
<summary><b>🔍 怎麼自己驗證「完全不連網」</b>（點開）</summary>

**方法 1：斷網使用（零門檻，最推薦）**

拔網路線或關掉 Wi-Fi，正常使用 PromptBox。所有功能——包括圖示、字型、搜尋、加解密、變數與串聯——都與連線時**完全一樣**，什麼都不會少、不會轉圈、不會報錯。

**方法 2：Windows 資源監視器（看得到整個行程）**

`Win + R` → 輸入 `resmon` → 「網路」分頁 → 在行程清單勾選 `PromptBox.exe`。
**「TCP 連線」與「網路活動」應該都是空的**（MCP 開啟時會看到 `127.0.0.1` 的本機連線，那是給你的 AI 客戶端用的）。

**方法 3：DevTools（技術使用者）**

在 App 內按 `Ctrl + Shift + I`（或按 `Alt` 叫出選單 → View → Toggle Developer Tools）打開開發者工具，切到 **Network** 分頁，然後按 `Ctrl + R` 重新載入。

你會看到一整排資源載入紀錄，**但每一筆的來源都是本機 `file://`，沒有任何一筆是外部網域**。

> ⚠️ **兩個要注意的地方**：
> ① Network 面板只記錄「開著的時候」發生的請求，所以必須**先開面板再重載**，否則看到空白什麼也證明不了。
> ② **DevTools 只看得到 renderer（畫面層）的流量，看不到主程序。** 想確認主程序也沒連外，請用方法 1 或 2——那才涵蓋整個 App。

## 📦 專案結構

```
PromptBox/
├── .github/
│   └── workflows/
│       ├── release.yml           # 自動打包發布 CI/CD（推 tag 觸發）
│       └── test.yml              # 測試 CI（push / PR 觸發）：vitest + e2e 兩個 job（v3.4.1）
├── electron/                     # Electron Main Process
│   ├── handlers/                 # IPC 處理器
│   │   ├── promptHandlers.cjs    # Prompt CRUD + 可見性 + 機密卡片 + variables 清空防護（v3.2.2）
│   │   ├── secretHandlers.cjs    # 明文生命週期與授權窗 IPC（v3.6.0）
│   │   ├── mcpHandlers.cjs       # MCP Token 管理 IPC
│   │   └── folderHandlers.cjs
│   ├── core/
│   │   └── prompts/
│   │       └── variableSync.cjs  # 變數同步單一真相純函式（v3.2.1，前後端 parity）
│   ├── __tests__/                # 後端 handler / schema 測試（Vitest）
│   ├── services/
│   │   ├── keyService.cjs        # safeStorage 金鑰管理（v3.0）
│   │   ├── cryptoService.cjs     # 卡片級 AES-256-GCM 加密（v3.0）
│   │   ├── consentBroker.cjs     # 機密釋放 consent 跨 IPC 橋接（v3.1）
│   │   ├── secretLifecycle.cjs   # 明文存活時間的唯一時鐘持有者（v3.6.0，跨 process）
│   │   ├── secretGrantStore.cjs  # AI 授權窗明文快取（v3.6.0，純記憶體、絕不落盤）
│   │   └── prefsStore.cjs        # 「變數替換」全域開關（v3.7.0，settings 表，預設關閉）
│   ├── db.cjs                    # SQLCipher 加密資料庫 + 串聯資料夾 seed + 釋放稽核表（v3.1）+ 機密卡閉眼一次性遷移（v3.6.0）
│   ├── mcpServer.cjs             # MCP 伺服器（Tools + Resources + consent + 串聯展開）
│   ├── schemaUtils.cjs           # MCP schema 推導 / 強型別守門 + expandChains 串聯展開（v3.1）+ mergeInheritedValues 值繼承（v3.2）
│   ├── core/prompts/             # 領域純函式：variableSync（孤立 key 清理）/ variableDefaults（預設值單一入口）
│   │                             #   + variableSubstitution（v3.7.0 替換機制與策略，簽章裡沒有 args）
│   ├── tokenStore.cjs            # 具名多 Token 管理（v3.0）
│   ├── portDetector.cjs          # 動態 Port 偵測
│   ├── ipcHandlers.cjs           # IPC 整合入口
│   └── main.cjs                  # 主程序入口
├── src/
│   ├── components/               # Vue 元件
│   │   ├── PromptCard.vue        # 卡片（#id、鎖定、機密標示、灰階標籤 v3.2.3）
│   │   ├── PromptModal.vue       # 編輯彈窗（機密密碼、AI 可見性 v3.6.0、串聯槽、解鎖後變數 v3.2.2）
│   │   ├── SchemaPanel.vue       # 變數側欄面板（填值 + 強型別，v3.2）
│   │   ├── McpModal.vue          # MCP 設定（多 Token、釋放紀錄）
│   │   ├── ConsentModal.vue      # 機密釋放授權窗（並發佇列，v3.1）
│   │   ├── Sidebar.vue           # 側欄（串聯資料夾固定於 Main Nav、標籤重設，v3.2.3）
│   │   └── base/                 # 基礎元件（Input 含密碼可視切換，v3.2.3）
│   ├── composables/              # useSecretCard / useChainExpand / useStrongTyping（v3.2.1 拆分）
│   ├── stores/                   # Pinia 狀態管理（含 consent 佇列、稽核列表）
│   ├── constants/                # UI 樣式常數（v3.2.3）/ 教學卡片
│   ├── utils/                    # 工具函式（variables.js / schema.js + 單元測試、前後端替換 parity）
│   └── locales/                  # 多語言（zh-TW / en / ja）
├── E2E/                          # 整合測試（ELECTRON_RUN_AS_NODE，真實加密 DB），npm run test:e2e
│   ├── test-v370.cjs             # v3.7.0：arguments 一律忽略（AC-1 護欄）+ 揭露表 + 開關 OFF 逐字回傳（最新）
│   ├── test-v360.cjs             # v3.6.0：兩軸可見性 + 強制 weak + 授權窗 + 稽核零盲區 + 遷移冪等
│   ├── test-v350.cjs             # v3.5.0：手動啟動路徑 + 405/429/403 形狀 + 排序穩定
│   ├── test-v340.cjs             # v3.4.0：配額 gate 邊界 + G2 資料不掉
│   └── test-v322.cjs             # v3.2.2：機密卡變數 / update 清空防護
├── scripts/
│   ├── check-doc-links.mjs       # 文件健康檢查（斷鏈 + 查核時效）
│   └── run-e2e.mjs               # E2E 執行器（跨平台，v3.4.0）
└── Doc/
    ├── BRD/                      # 商業決策（定位/定價/付費邊界/版本時序）
    ├── ADR/                      # 跨版本技術決策 + 技術紅線
    ├── PRD/                      # 產品需求文件
    ├── Tech Design/              # 技術設計文件
    ├── Future plans/             # 已決定要做、目前不做
    ├── Wishlist/                 # 可能要做（DONE/ 與 WONTFIX/ 收結案）
    └── zother/                   # 分析報告、除錯紀錄等雜項（不具決策效力）
```

> repo 根另有 `CLAUDE.md`（AI 協作入口）與 `.claude/skills/`（10 本專案技能，依觸發條件自動載入）。

## 🛠️ 技術棧

- **Frontend**: Vue 3 (Composition API) + Vite + Tailwind CSS
- **Desktop**: Electron
- **State**: Pinia
- **Database**: SQLite — `better-sqlite3-multiple-ciphers`（SQLCipher 靜態加密，v3.0）
- **Crypto**: Node.js `crypto`（scrypt KDF + AES-256-GCM，卡片級加密，v3.0）
- **Key Management**: `electron.safeStorage`（OS Keychain 金鑰保護，v3.0）
- **Markdown**: markdown-it + highlight.js
- **i18n**: vue-i18n（zh-TW / en / ja）
- **MCP**: @modelcontextprotocol/sdk + Express（Tools + Resources，Streamable HTTP + SSE）
- **Schema Validation**: Ajv（MCP 弱型別驗證，v3.0）
- **Testing**: Vitest + @vue/test-utils（前端單元 / 元件 + 後端 handler 測試，v3.7.1 全套 443 綠；另有 E2E 九支 307 條走真實 DB）
- **Fonts**: Inter（SIL OFL 1.1）+ Material Symbols Outlined（Apache 2.0），**隨 App 打包不走 CDN**（v3.3.1）
- **Update**: **無**——v3.3.0 移除 `electron-updater`，App 不做更新檢查（email 通知 + 官網手動下載）
- **CI/CD**: GitHub Actions

## 📚 版本歷程

### V3.7.1 (2026-08-26) - Trial UI Polish（試用版介面誠實化）

> **試用版已經在別人手上了，而介面在三個地方說了不實話。** 設定頁被內容撐爆、超出畫面的部分永遠捲不到；兩塊自己都還不滿意的功能長得跟成熟功能一模一樣；稽核區那顆「重新整理」按了沒反應——它其實在補一個 bug，而不是提供價值。

- 📜 **設定視窗加捲軸**：Body 原本只有 `p-6`，內容多高視窗就撐多高，撐出畫面後**底部的設定項等同不存在**（而使用者不會知道自己少看了東西）。沿用 `McpModal` 既有的 `max-h-[70vh] overflow-y-auto`，Header 留在捲動區外
- 🏷️ **MCP 設定與卡片串聯標上 Beta**（側欄兩處 + MCP 視窗標題 + 串聯槽），共用單一樣式常數。刻意用中性色——橘紅已是「機密」的全站語意、amber 給最愛／鎖定，借色會稀釋那兩套訊號。**不加 tooltip、不定義移除條件**：這是一個標籤，不是治理對象
- 🐛 **修掉「清單自 App 啟動後就凍結」的根因**：`McpModal` / `SettingsModal` 在 `App.vue` 是**無條件渲染**的（`v-if` 在元件內部的遮罩層上），所以 `onMounted` **一輩子只跑一次**。App 開著不關，稽核與授權兩份清單就停在開機那一刻。**那兩顆「重新整理」是在用按鈕補這個 bug**——先修根因（`watch(isOpen)`），才刪按鈕
- 🗑️ **「機密釋放紀錄」的重新整理 → 「全部清除」**（+ 二次確認、空清單時隱藏）。確認窗第三句「不會影響目前有效的 AI 授權」**不可省**：兩區上下相鄰，少了它使用者會以為清紀錄順便收回了授權而不去撤銷——**那是由文案造成的安全誤判**
- ⚖️ **[ADR-007] 釋放稽核的 append-only 邊界**：紅線 A3 的 `append-only` 照字面讀等於「稽核永不刪除」，與本版直接衝突。拍板口徑為**約束寫入路徑與系統，不是資料擁有者**——系統只 INSERT、擁有者可全部清除、**永遠不提供刪除選定的單筆**。分界的理由：**全清不製造假象，挑選性刪除會**。A3 同日加註限定
- 🌱 **自動保留策略只留接縫不實作**：handler 收 `{ keepLatest = 0 }`，日後傳 50 即可啟用。**`50` 不進本版任何一行程式碼**——沒實作的策略留下字面量，會變成沒人記得為什麼存在的常數
- 🧪 **測試 425 → 443**（新增 18 條）；E2E 301 → **307 條**。其中一支專驗「稽核相關 channel 只有 list 與 clear 兩條」——ADR-007 第 3 條沒有程式層強制力，**回歸網就是它唯一的執行機制**
- 📌 **i18n 只補 Beta pill 一個 key**：查證發現 `McpModal.vue` **整檔零 i18n**（宣告了 `t` 卻一次沒用），`ConsentModal.vue` 則是「順手翻一半」的活證據（`t()` 12 次 + 硬編碼中文 17 行並存）。只翻新增三句會讓該檔更難維護，整檔化立案 **WL-041**（實測範圍是**五個檔案 ~139 行**，不是一檔）
- ⚠️ **本版未做打包實測**（SOP Step 4.5）：發版後須補，結果不論通過與否都要寫回

### V3.7.0 (2026-08-24) - Variable Substitution（人類策展、AI 不代填）

> **一張卡片裡的變數值，是誰說了算？** 舊行為是「AI 傳的 `arguments` 優先於使用者填的值」——等於 AI 可以覆寫人類的策展。這一版把答案定死：**值只來自使用者，AI 傳什麼都不採用。**

- 🔴 **`arguments` 一律忽略，沒有任何例外**：`tools/call` **連解構都沒有**，編譯函式 `substituteVariables(content, values)` 的**簽章裡根本沒有 `args`**。不是「讀了但不用」，是**結構上沒有入口**——後者才擋得住下一次改動不小心接回去
- 🔴 **驗證層整支拿掉**：只要 Ajv 那一關還在，AI 傳個非字串值就會拿到 `InvalidParams`，**同一張卡因參數形狀不同回傳不同結果**。「忽略」必須連錯誤都不給才是真的忽略。E2E 以「六種 `arguments` 形狀輸出逐字相同」釘住
- 📝 **未填的變數保留 `{{name}}` 佔位符**：舊版替換成空字串，輸出「安靜地少一段」而使用者永遠不會知道。前後端行為自此**逐字一致**，並補上替換 parity 測試（此前只有「抽取」有鎖，「替換」從來沒有）
- 🎚️ **「進階功能」改名為「變數替換」**，真相從 `localStorage` 搬進 `settings` 表：MCP 跑在 main process，**讀不到 renderer 的 localStorage**。renderer 自此只是顯示器，讀寫都走 IPC（ADR-005 分層）。**預設關閉**，且**不是付費牆**
- 🔒 **機密卡的 `inputSchema` 恆空**——連參數名都不列。拍板「AI 不能給任何值」之後參數名對 AI 已無用途，⇒ **[ADR-000 C2 ⑤] 這條已知邊界被整條移除**，而不是「更誠實地標示它」。這是本專案少數能把邊界真的拿掉的機會
- 🧯 **補上強型別讀路徑的守門**：`getEffectiveSchema` 舊判斷式**完全不查 feature flag**——handler 擋的是「寫入」，**讀路徑從來沒有人守**，任何 v3.4.0 之前寫入的 `schema_definition` 今天仍會把 `default`／`enum` 帶進 `tools/list`
- 🗑️ **參數名快照停用**（加進來與停用相隔三天，欄位保留不刪）：它沒有做錯——它解掉的是「AI 空手探測、每輪一次人類授權」這個真實問題；本版讓**那個問題本身消失**了。`unlock-secret` 因此回到純讀取
- 🧪 **測試 341 → 425**；E2E 八支 240 條 → **九支 301 條**。四條風險（R-1／R-2／R-3／R-7）各做過一次突變測試，確認守門真的會咬
- 🐛 **打包實測抓到一個 P0 並補了護欄**：設定頁文案寫了 `{{變數}}`，對 vue-i18n 是巢狀 placeholder ⇒ **dev 只警告、打包後才 throw** ⇒ 「按設定完全沒反應」。新增語系檔編譯測試（三語每一條訊息），並記入 [debugging-playbook §B.1](.claude/skills/debugging-playbook/SKILL.md)。**教訓：417 條測試 + build 全綠，涵蓋的卻都不是這次改的東西——假訊號比沒訊號更危險**
- ✅ **結案一項跨三版的遺留驗證**：打包版 `server.version` 與安裝檔版號的比對，自 v3.5.0 掛著、v3.6.0 明確標為「未實跑」，**本版實測通過（3.7.0）**。⚠️ 驗的是「裝起來打一次 `initialize` 比對 `serverInfo.version`」，不是「Release 有三個 Assets」——後者只證明打包沒失敗
- ✅ **發版後複驗**：Assets 三個檔案齊全；設定頁（即上面那個 P0 的複驗）打包版開得起來
- ⚠️ **既有債（非本版造成）**：`ja` 語系有 11 條 key 缺翻譯，執行時靜默 fallback 回英文；已記為測試基準線，新增漏翻譯會紅

### V3.6.0 (2026-08-17) - Secret Visibility（機密與 AI 可見性的兩軸控制）

> **使用者的心智模型是兩件事**——「我不想給 AI 看到這張卡」與「這張卡有密碼要保護」——**但程式與 UI 把它們綁成一件**：卡片一旦設密碼，就自動且永久地從 AI 世界消失，而使用者**沒有任何介面可以表達不同意見，也沒有任何 UI 說明這件事發生了**。這一版把它們拆成兩條正交的軸。

- 👁️ **眼睛＝存在性，鎖頭＝密碼**：全站不再一符二義。可見性一律用 `visibility` / `visibility_off`，鎖頭與鑰匙只留給密碼；「機密**且**隱藏」是合法狀態，**兩個徽章同時顯示**（原為 `v-if` / `v-else-if` 互斥）
- 🔓 **機密卡終於看得到、按得動可見性切換鈕**：舊版 `v-if="!isSecret"` 讓使用者**連想改都沒得按**——本版核心問題的一半是 UI 造成的，不是 SQL 造成的。編輯頁也補上可見性入口，與密碼設定區並排：**設密碼的當下正是使用者形成「加密碼＝要用時問我一聲」這個期待的時刻**
- 🔍 **`tools/list` 放寬存在性，但不放寬暴露面**：可見性全交給 `is_locked`，`is_secret` 退出過濾條件。對 AI 可見的**僅限名稱、描述、ID**；內容仍須 consent，**參數名一律不可見**（機密卡強制 weak schema，`schema_definition` 永不進 MCP）
- ⏱️ **授權窗**：consent 當下可勾「10 分鐘內不再問我」。純牆鐘、綁單卡、**不跨 token**、不跨 App 生命週期、絕不落盤；鎖屏／睡眠／手動撤銷立即失效。**「密碼永不快取」這條不變式沒有破**——只快取明文，不快取密碼或派生金鑰
- 🔴 **`blur` 刻意不使 AI 授權窗失效**：使用者按下「10 分鐘內不再問我」之後會**切回 IDE 繼續工作**，而 consent 每次都會 `focus()` 主視窗、接著必然 `blur`。照原設計實作，授權窗會在**建立後幾秒內被自己殺掉**，功能完全失效。人類側的 UI 解鎖態則維持含 `blur`——**那邊的明文在螢幕上**
- 📋 **有效授權清單 + 一鍵撤銷**（系統匣與 MCP 面板）：授權窗放棄了「綁連線」帶來的邊界可感知性，就必須由 UI 補回來。**這不是加分項，是授權窗的必要配套**
- 🧾 **稽核零盲區**：窗內**每一次**取用照舊寫 `secret_release_audit`，以 `result='allow_window'` 與使用者親手按下的 `'allow'` 區分。沒有這一行，一張卡在 10 分鐘裡被取用 40 次、紀錄上只看到 1 次
- 🔒 **GUI 閒置自動鎖**：解鎖態活過 Modal 關閉，由 **main process 單一時鐘**管理；失焦／鎖屏／睡眠立即鎖回，睡眠喚醒以牆鐘校正。⚠️ **誠實邊界**：main 只能**請求** renderer 清明文，不能直接抹它的記憶體——與 AI 側「完全由 main 持有、wipe 是確定的」保證強度不同
- 🚚 **升級後行為 100% 相同**：既有機密卡一次性遷移為閉眼，記號與 `UPDATE` 在同一個 transaction。**不分 `release_policy` 現值**——設成 `once`／`session` 的卡今天實際上也不在 `tools/list`，讓它們保持睜眼就是靜默放寬
- 🗑️ **`release_policy` 停用**（不刪欄）：`never` 的作用由眼睛取代、`once` 是預設、`session` 在無狀態 `/mcp` 從未生效。**一個永遠只有單一有效值的欄位不該存在**
- 🧪 **測試 298 → 341**；E2E 七支 176 條 → **八支 240 條**（新增 `test-v360.cjs` 54 條）。其中三條是承重牆：升級前後 `tools/list` 完全一致、「先設強型別再加密」的卡 `inputSchema` 為空、resources 路徑仍完全濾掉機密卡
- ⚠️ **已知未驗證**：打包版 `server.version` 與安裝檔版號的比對**未跑**（v3.5.0 遺留項，見 [TD §9.5.1](Doc/Tech%20Design/v3.6.0_TD_SecretVisibility.md)）。其餘手動項已於 2026-08-16／17 逐項實跑通過。**「已出貨」不等於「已驗證」。**

### V3.5.0 (2026-08-11) - MCP Reachability

> **PromptBox 的核心差異點是「AI 安全取用」，而取用端有三個獨立的斷點**——接不上（設定模板錯誤且**無聲失敗**）、會斷線（自身速率限制約 1 分鐘後打斷連線）、開機不在。三者任一成立，MCP 就無法成為工作流的一部分。這一版把三個斷點一次補完，**且不擴大任何攻擊面**。

- 🔌 **不會斷**：速率上限 60 → 600，計數 key 由 `tokenId|ip` 改為 `tokenId|客戶端分桶|ip`。兩個編輯器不再擠爆同一個桶
- 🧮 **key 空間先天有界**：原提案取 `User-Agent` 前 40 字元，那會讓 key 空間**由客戶端控制**，所以才需要清掃來補救——病與藥是同一件事。改用 64 桶雜湊後，10000 個相異 UA 只長出 ≤ 64 個 key，清掃降級為保險（惰性、**無 `setInterval`**）
- 📨 **所有錯誤出口統一 JSON-RPC**：429（`-32010` + `Retry-After`）、403 Origin（`-32011`）、405 method 守門（`-32000` + `Allow`，涵蓋 `/mcp` `/sse` `/message`）。舊行為會落到 Express 預設 **404 HTML**，客戶端據此判定連線損壞
- 🗂️ **`tools/list` 改 `ORDER BY id`**：舊寫法任一張卡被編輯就整份重排，等於每次編輯都讓所有客戶端快取與 LLM prompt cache 失效
- 🔐 **MCP 不再無條件自動啟動**（預設關）：token 是**明文寫進 IDE 設定檔**的，伺服器永遠在跑等於暴露窗永遠開著。這是本版唯一一項**降低**攻擊面的改動
- 🔴 **啟動流程拆成 prepare / start 兩段**：舊 `initMcpServer` 把「載 SDK」與「開 HTTP」綁在一起，而新設定只想關掉後者。照字面實作的話，手動按「啟動伺服器」會做出一台 **listening 正常、status 顯示 running、但每個請求都 TypeError** 的伺服器——**最惡的失敗模式：看起來好的**
- 🚀 **開機自動啟動**（預設關）：`--hidden` 靜默常駐系統匣。一律以 `getLoginItemSettings()` 回讀為準，**不在 DB 存影子狀態**；寫不進去（權限／防毒）時 toggle 回退並說明原因
- 🖥️ **系統匣補上 MCP 狀態與開關**，順手修掉一個空轉——舊版讓 tray menu 在 `mcp:status-update` 時重建，但那是 main → renderer 的 send，**renderer 從來不會把它送回來**，而且選單裡本來也沒有任何 MCP 項目
- 🧩 **客戶端模板 5 → 9**：新增 Claude Code／Windsurf／Gemini CLI／Cline，欄位地雷（`serverUrl`／`httpUrl`／「不要整份覆蓋」）直接寫進步驟。**Claude Desktop 改為 `mcp-remote` 轉接**——它的設定檔 schema 只驗 stdio，遇到 `url` 會**靜默丟棄整個 `mcpServers` 區塊**，連帶弄壞使用者既有的其他 MCP 設定
- 📍 **監聽位址透明化**：面板明說「監聽於 `127.0.0.1`（僅本機）；WSL ❌／Docker ❌／雲端 ❌」。**不改變任何監聽行為**，只是把既有事實說出來
- 🧪 **測試 288 → 298**；E2E 六支 126 條 → **七支 176 條**（新增 `test-v350.cjs` 50 條，其中「不走 `initMcpServer` 直接手動啟動後發真實請求」是上述啟動流程缺陷的唯一防線）
- ⚠️ **已知未驗證**：四個新客戶端模板的實機貼上、以及「一輪典型 AI 對話消耗多少請求」的實測**均未跑**（見 [PRD §8.1](Doc/PRD/v3.5.0_PRD_McpReachability.md)）。**600 這個值目前仍是估計，不是實測得出的數字。**

### V3.4.2 (2026-08-11) - Lazy Load Refill

> **大螢幕上，卡片超過 10 張的使用者只看得到 10 張。** 沒有錯誤、沒有捲軸、沒有「載入更多」可按——看起來就像卡片不見了。根因是 `IntersectionObserver` **只在交叉狀態改變時回呼**，而 sentinel 在大螢幕上從頭到尾都可見：狀態沒變過，第二次回呼永遠不會來。

- 🔧 **內容變動後主動補滿**：初次啟動、切資料夾／收藏／標籤／搜尋、清除篩選——每條路徑都補到畫面沒有空間為止，不必等使用者捲動。`IntersectionObserver` **原封不動保留**，它負責的「使用者捲動」那條路徑本來就是對的
- 🪟 **視窗拉大也會補滿**：內容沒變、空間變多，是同一個失效的第五種形式。原 PRD 只列了「內容變動」的四個時機，動工前補上
- 🔴 **補滿迴圈跨 tick，否則會退化成「一次載入全部」**：`loadMore()` 只改 `visibleLimit`，DOM 更新是非同步的——同步 `while` 量到的是上一輪的版面，終止條件永遠不成立。改由 post-flush watcher 自己當迴圈，每輪都保證量到最新版面
- 📐 **上界由畫面高度決定，不隨卡片總數增長**：測試釘住 100 張與 300 張卡都只顯示 50 張。漸進式載入沒有被廢掉
- 🔍 **一個從未生效的參數**：實機量測證實 `rootMargin: '100px'` 被捲動容器的 clip 吃掉，觸發點的提前量是 2～18px 而非 100+。那個緩衝是本版第一次真的存在
- 🧪 **測試 271 → 288**（純邏輯終止條件 9 條、接線 8 條）。接線測試做過變異檢查：拆掉接線後 5 條全紅，確認不是靠 jsdom 回 0 而假綠

### V3.4.1 (2026-08-11) - Quota Seam Hardening

> **v3.4.0 把配額接縫全部蓋起來了，但接縫本身沒有被驗證過。** 這一版**畫面零變化**——它做的全是「證明上一版真的會動」，以及修掉收尾稽核找出的缺陷。之所以值得一個版號，是因為 `quota:get-status` 這條唯一的新 channel **註冊那一行從未被執行過**，而它壞掉的表現是橫幅、👑、撞牆預檢**全部靜默失效，功能看起來完好無損**。

- 🧪 **補上零覆蓋的 IPC channel**：`quota:get-status` 從「從未被執行」變成每次 E2E 都真的 invoke。E2E 改走 production 的同一條開機路徑（`setupHandlers`），並斷言唯讀——呼叫前後 `total_changes()` 不變
- 🔴 **讓 mock 不再比真實 API 寬容**：E2E 的 `ipcMain` mock 原本對重複註冊是**靜靜覆寫**，真實 Electron 會 throw。已對齊——「測試綠、打包版一啟動就炸」這個盲區關掉。**mock 可以更簡單，不可以更寬容**
- ⏱️ **修掉一個靠碰巧成立的併發**：`refreshQuota()` 在「查詢已送出、尚未回來」之間收到的變動會被合流吃掉，拿到變動前的計數。改為 dirty flag 補跑，並把回傳 promise 的語意（「已排程更新」而非「更新已完成」）寫進 JSDoc
- 🔴 **修掉一個會讓 Pro 版整個鎖死的既有缺陷**：把「`null` = 無上限」寫成契約時實測發現，`checkQuota()` 的 `current >= limit` 在 `limit === null` 時，JS 把 `null` 當 `0` → **`0 >= null` 為 true**。「無上限」會變成「一張都不准開」，錯誤碼還是 `QUOTA_EXCEEDED`。Build A 走不到這條路徑，**沒有測試的話它會一路潛伏到 Build B**
- 🚦 **E2E 進 CI**：拆成 `vitest` / `e2e` 兩個 job——單元測試的回饋速度不被 electron binary 下載與原生模組重編綁架。E2E 腐化半年沒人發現的根因是「沒有任何自動化在跑它們」，修路徑只解決症狀
- 📦 **出貨產物內零測試檔**：`build.files` 排除 `electron/__tests__/`。已對真實 asar 複驗——我方禁字命中從 3 檔降為 **0**，asar 內我方測試檔 10 → **0**
- 📐 **改寫一個不可能達成的驗收指標**：原本寫「產物內 `Ed25519`/`entitlement`/`licenseKey` 命中 = 0」，但 `jose` 會列舉簽章演算法、`entitlement` 是 Mathematica 的關鍵字——**指標寫錯了，不是實作沒做到**。改為兩段式：我方碼 = 0 ＋ 第三方命中逐項揭露
- 🧪 **測試 255 → 271**（含 App.vue 撞牆接線 4 條、併發時序 5 條、`null` 契約 6 條）；E2E 117 → **126 條**

### V3.4.0 (2026-08-07) - Free Build Gating

> **PromptBox 從「全功能無限免費」變成「有邊界的免費版」。** 這不是新增畫面也不是修 bug，是產品性質的變更——App 第一次具備收費能力。但整版真正的難處不在「怎麼數卡片」，而在**不讓任何既有使用者掉一張卡、掉一個欄位**。

- 🚧 **四項配額、五個攔截點**：卡片總數 45、機密卡 3、串聯卡 5、MCP Token 2。**全部在 main process 強制**——renderer 的提示只是體驗，繞過 UI 直呼 IPC 一樣擋得住
- 🛡️ **配額只擋「增加用量」，不碰既有資料**：改機密卡密碼、編輯已在串聯資料夾裡的卡片、資料夾改名觸發的批次更新，**一律放行**。三處「自我計入」陷阱各配一條反向測試，擋的是「不該擋卻擋了」
- 🔴 **修掉一個會讓全體使用者掉資料的缺陷**：強型別自 v3.2 起對所有人免費，而編輯器每次存檔都會送 `schema_definition: null`。若照直覺實作，Free 使用者**只是改個標題就會抹掉自己的 schema**。現在 update 路徑把該欄位整個視為不存在——丟棄請求 ≠ 刪除既有值
- 🚦 **撞牆有出路**：按下「新增提示詞」或「設為機密」的**當下**就提示，不讓人寫完一整則 prompt 才被告知存不進去。主按鈕開系統瀏覽器到官網，**零新增外連 IPC**
- 📊 **配額橫幅**：卡片總數超過 39 張才出現，顯示三項配額；超額使用者照實顯示 `80/45`，不寫「45/45 已滿」那種隱瞞真實張數的話。可在設定關閉
- 🧪 **測試 154 → 255**，另加 E2E 六支共 117 條（真實 SQLCipher DB + 真實加密）。新增 `npm run test:e2e` 與 CI 的 `npm test` workflow——在此之前 repo 沒有任何測試在 CI 跑過
- 🔒 **[ADR-000 A5](./Doc/ADR/ADR-000_索引與技術原則.md) 未被破壞**：本版新增大量「使用者行為觸發點」（撞牆、橫幅、點擊升級），**一次都沒有記錄**。零外連護欄 7 條維持全綠
- 📌 **釘住 `appId` 與 `productName`**（[ADR-000 B5](./Doc/ADR/ADR-000_索引與技術原則.md)）：五行護欄測試，擋的是日後做雙 build 時「產物要能區分」這個很合理的動機——它會直接讓既有使用者的資料變孤兒

### V3.3.1 (2026-08-05) - Font Localization

> **v3.3.0 把「不打電話回家」推到 90 分，這一版補上最後 10 分。** 字型是 App 唯一剩下的主動外連——每次啟動都會向 Google 要 Inter 與 Material Symbols，使用者 IP 因此被看到。兩套字型改為隨 App 打包後，**「完全不連網」從一句不能講的話變成打開 DevTools 就能當場驗證的事實**。

- 🔒 **零外連達成**：`index.html` 移除全部四條 Google Fonts `<link>`（含兩條 `preconnect`），兩份 CSP 的 `style-src` / `font-src` 收成 `'self'`，外部 host 由 4 個降為 **0**
- 📐 **[ADR-000 A5](./Doc/ADR/ADR-000_索引與技術原則.md) 自此無例外**，C2 已知邊界由四條回到**三條**（原 C2-④ 刪除）——剩下三條都是**有意識的取捨**，不再混入未竟工作
- 🈺 **字型隨 App 打包**：Inter（SIL OFL 1.1）+ Material Symbols Outlined（Apache 2.0），兩份授權隨產物散布
- 🛠️ **離線可用性修復**：斷網時 88 處圖示不再退化成 `settings`、`delete` 這類英文單字；`fonts.googleapis.com` 不可達的地區（如中國大陸境內）一併恢復正常
- 🧪 **護欄測試第 7 條**：`index.html` 不得含任何外部 http(s) 資源。比對通則而非廠商名——擋的是「外連」這個類別，不是 Google 這一家
- 🖼️ **修復系統匣與視窗圖示空白**（附帶修正）：執行期圖示改放 `electron/assets/`，dev 與 prod 共用同一條路徑，不再有「dev 能跑、打包就壞」的分支；順帶清掉 `public/` 四個非正方形的早期圖示
- 🧪 **測試**：全套 **154 passing**（護欄 6→7）+ 打包版斷網實測全站圖示與尺寸無回歸

### V3.3.0 (2026-08-04) - No Outbound

> **這一版是一次刪除。** 產品把「不打電話回家」寫成品牌核心，但程式碼每次啟動都會主動連上 GitHub 檢查新版——`autoDownload = false` 只擋住下載，「檢查」本身仍是自動的，使用者沒有按任何東西。本版移除整條 auto-update 鏈路，讓「App 不主動對外連線」從行銷話術變成**可被反組譯驗證的事實**，並用護欄測試釘死。

- 🚫 **移除 auto-update 全鏈路**：`electron-updater` 依賴、`autoUpdater.cjs`、`updaterAPI` preload 橋、`UpdateModal.vue`、`dev-app-update.yml`、啟動檢查、側欄「有新版本」橫幅、設定頁紅點、`preferenceStore` 的 `hasUpdate` / `updateInfo` 全數刪除（`node_modules` 連帶少 8 個套件）
- 🔒 **CSP `connect-src` 收斂為 `'self'`**：由原本放行 `api.github.com` / `github.com` / `*.githubusercontent.com` 三個外部 host 降為 0
- 🛡️ **消除 🔴 高風險 Remote XSS（H-2）**：`UpdateModal` 以 `v-html` 渲染未清洗的遠端 Release Notes，整條攻擊鏈**結構性消失**——不是修補，是「遠端內容被注入」的前提本身不存在了
- 📮 **更新告知改為 email + 官網手動下載**：設定頁 footer 顯示「新版本將以 email 通知」（三語系）；發版 SOP 新增強制寄信步驟——**漏寄等於該版無人可得**
- 🧪 **零外連護欄測試**：`electron/__tests__/no-outbound.test.js` 六條斷言納入 `npm test`，擋住日後（含 AI）為了「方便更新」把連外能力加回來
- 📐 **新增技術紅線 [ADR-000 A5](./Doc/ADR/ADR-000_索引與技術原則.md)**：App 不主動對外發起網路請求
- 🧪 **測試**：全套 **153 passing**（13 檔）+ `vite build` 通過 + `check:docs` 0 斷鏈
- ⚠️ **本版尚未達成「完全不連網」**：字型仍從 Google Fonts CDN 載入，是 A5 唯一的已知例外（[ADR-000 C2-④](./Doc/ADR/ADR-000_索引與技術原則.md)），由 [v3.3.1](./Doc/PRD/v3.3.1_PRD_FontLocalization.md) 收尾。**在那之前對外措辭只能說「不做更新檢查、不做遙測」，不能說「完全不連網」。**

### V3.2.3 (2026-07-11) - UI Polish

> 8 項獨立純前端微調一次收整，**零後端 / MCP 改動**，每項可獨立 revert。校正「視覺權重與操作成本和實際重要性不成比例」的累積摩擦：不重要的搶眼（七彩標籤）、重要的不顯眼（機密區塊與星星同色）、高頻的太費力（標籤逐顆取消）、高風險的沒防呆（密碼純遮罩）。

- 🏷️ **標籤灰階降噪**：移除 `PromptCard` / `PromptList` 兩份字數 hash 七彩配色，收斂為單一樣式常數 `TAG_BADGE_CLASS`（含 dark 模式）——標題與內容回到視覺主角
- 🖱️ **操作按鈕加大**：卡片鎖定 / 編輯 / 複製按鈕 `w-8`→`w-11`（44px）、icon 18→24px，grid / list 兩檢視同步
- 🧹 **標籤一鍵重設**：Sidebar Tags 區常駐「重設」鈕（無選取時停用半透明），`filterStore.clearTags()` 一鍵清空多選標籤
- 🧭 **串聯資料夾歸位**：內建串聯資料夾移入 Main Nav 固定導覽（我的最愛之下、教學之前），與使用者自建資料夾做結構區隔；「不可刪 / 不可改名 / 不可拖曳」改由結構保證，順手移除迴圈內特判
- 🃏 **預設卡片檢視**：`viewMode` 預設 `list`→`grid`（拍板僅改預設值、不做持久化）
- 🔢 **編輯 Modal 顯示 #id**：編輯既有卡片時標題旁顯示 `#id`（`text-sm` 灰色 mono；新增卡與串聯卡不顯示），GUI 與 MCP / 回報流程引用體驗一致
- 🟠 **「橘紅 = 機密」視覺語意**：機密語意 amber 全站 10 處換橘紅系（Modal 機密區塊、列表 lock badge / key icon、一般卡的機密功能入口）；「忘記密碼永久無法復原」警語升 red；amber 保留給最愛星星 / 鎖定 toggle 等一般強調
- 👁️ **密碼可視切換（本版最高優先）**：`base/Input.vue` 內建 visibility 切換，設定 / 變更 / 移除 / 解鎖等全部密碼欄位自動受益；`type="button"` 不搶 Enter、unmount 自動重置遮罩、aria-label i18n 三語——直接降低「打錯密碼 → 永久鎖死」的不可逆風險
- 🧪 **測試**：新增 Sidebar / Input / filterStore / preferenceStore / PromptModal `#id` 案例，全套 **147 passing** + `vite build` 通過

### V3.2.2 (2026-07-10) - Secret Card Variables

> 機密卡片解鎖後恢復完整變數鏈路（`{{變數}}` 解析 → 填值 → 代入 → 複製），且**不破壞任何機密安全不變式**：明文僅存記憶體、密文永不改寫、未解鎖零洩漏（UI 與前版逐像素一致）。

- 🔣 **解鎖後變數面板（FR-1）**：`SchemaPanel` 顯示條件放寬，解析來源改解鎖明文（`effectiveContent` 單一 computed）；機密卡固定弱型別（強型別另案 WL-019）
- 📋 **複製代入變數（FR-2）**：`copyUnlocked` 走 `replaceVariables`（未填保留 `{{佔位符}}`），單顆按鈕一律代入，與一般卡片行為一致
- 💾 **預設值可更新（FR-3）**：機密 + 已解鎖時允許儲存 `variables` 預設值（**永不**寫 content / schema_definition）；連帶修復 MCP 釋放路徑 `secretDefaults` 凍結——AI 端不再拿到加密前的舊快照；預設值明文存 DB + 面板警示（決策記錄見 ADR-006）
- 🛡️ **後端清空防護（FR-4）**：`prompts:update` 在 content 缺席時跳過孤立 key 同步、僅正規化後原樣存入——修掉「variables-only update 全部 key 被清成 `{}`」的既存資料破壞風險；一般卡路徑位元級不變
- 💬 **設密提示（FR-5）**：含變數的卡片設為機密時提示「變數面板將於解鎖後才可使用」（i18n 三語），消除「設了機密才發現變數壞掉」的驚訝感
- 🧹 **清理連帶**：`clearSecretState()` 清明文時連帶清變數填值——關 Modal / 換卡即清，機密填值不殘留到下一張卡

### V3.2.1 (2026-06-23) - Frontend TechDebt

> 純技術債清理，對外行為不變；為 v3.2.2+ 的機密 UX 系列打地基。

- 🧩 **God Component 拆分（FR-6）**：`PromptModal.vue` script 504→287 行，機密 / 串聯 / 強型別狀態拆出 `useSecretCard` / `useChainExpand` / `useStrongTyping` composables
- 🎯 **變數同步單一真相（FR-1，消 C8）**：前後端兩份重複的孤立 key 清理邏輯收斂為 `electron/core/prompts/variableSync.cjs` 純函式，17 筆前後端 parity 測試護欄
- ⚛️ **資料夾批次原子化（FR-2）**：修掉 `editFolder` / `deleteFolder` 浮動 Promise 競態（「資料夾已改名、部分卡片未改名」的中間態）
- 🔀 **預設值單一真相（FR-3）**：修正弱 / 強型別 default 雙寫漂移——toggle 切換時雙向遷移值、存檔只寫當前模式那一份
- ⚡ **強型別效能（FR-5）**：`highlightJson` 不再於每個 keystroke 重算
- 🧪 全套 **111 passing** + `vite build` 通過

### V3.2.0 (2026-06-23) - StrongTyping GUI & 串聯槽

> 純前端 / GUI 路徑強化，建立在 v3.1 串聯（FR-4）之上。**MCP 路徑與 content 儲存格式不變**（仍只存 `{{@prompt:N}}` token、永不寫回展開結果），向後相容。

- 🔗 **可編輯串聯槽**：串聯資料夾卡片在 Edit 檢視改用可編輯的「串聯槽」取代內容大框，手打 `{{@prompt:N}}` token；輸入時 **debounce 即時展開預覽**，Preview 分頁渲染「展開＋填值後」的 Markdown 結果（`renderedContent` 既有行為，已補回歸測試）
- 🧬 **變數值繼承（規則 d）**：展開時順帶蒐集被引用卡（含遞迴）已填的變數值，經純函式 `mergeInheritedValues`（`electron/schemaUtils.cjs`）合併後當組合卡預設——**不衝突直接帶入、同名不同值留空並以琥珀色提示標示**；只填空欄位且每變數只自動帶一次（不覆寫使用者已填/清空的值），**不影響被引用卡本身**。`prompts:expand-preview` 回傳擴充為 `{ content, vars, inherited, conflicts }`
- 🐞 **執行期修復**：(1) IPC `An object could not be cloned`——`overrides` 為 Vue 響應式 Proxy 經結構化複製失敗，store 層轉純物件修正；(2)「Expanding...」卡死——`runExpandPreview` 以 `try/finally` 確保 busy 旗標必定重置。詳見 [V3.2debug_ChainSlot.md](Doc/zother/DebugLog/V3.2debug_ChainSlot.md)
- 🧪 **測試**：新增 `mergeInheritedValues` 單元測試（規則 d / 衝突 / 空值 / 壞資料）與 PromptModal 元件測試（串聯槽渲染、衝突旗標、Preview 展開填值、debounce 重跑），全套 **88 passing**

### V3.1.0 (2026-06-10) - Prompt Chaining & Secret Release

> 完全建立在 v3.0 既有元件之上，不引入新基礎建設、不新增執行期依賴（僅新增 devDependency `vitest` / `@vue/test-utils` / `jsdom`）。100% 相容 v3.0：未釋放機密卡片仍 human-only，非串聯資料夾行為不變。

- 🔓 **機密釋放 / Consent（FR-1）**：機密卡片可設 `release_policy`（`never` 預設 / `once` / `session`）。AI `tools/call` 命中 `once`/`session` 卡片時，主程序透過 `consentBroker` 彈出授權窗並 `await`；使用者輸密碼授權 → 重用 `cryptoService` 解一次 → 編譯餵一次 → 明文即棄（不快取、不寫檔、不寫 log）。`never` 維持 v3.0 行為（`MethodNotFound`、不洩漏存在性）
- 🧾 **釋放稽核（FR-2）**：新增 `secret_release_audit` append-only 表（只記 metadata、不記明文/密碼、存於加密 DB），MCP 面板新增「釋放紀錄」檢視
- 🔗 **卡片串聯（FR-4）**：擴充編譯引擎，於 `{{var}}` 替換**之前**多一道 `expandChains()` 遞迴展開 `{{@prompt:N}}`；串聯資訊只存 `content` token、**不新增 DB 欄位**。單一內建「串聯資料夾」成員即生效；含循環偵測、深度上限（5）、🔴 鎖定/機密邊界（經串聯間接洩漏次數＝0）；變數取聯集；前端 edit-time 記憶體展開預覽，**永不寫回 content**
- 🛡️ **嚴格 token**：`{{@prompt:N}}` 正則杜絕誤判（拼錯/缺冒號/id 非數字皆當純文字），與 `{{var}}` 變數天然不互相干擾
- 🧪 **測試安全網（FR-5）**：引入 Vitest，覆蓋 `variables.js` / `schemaUtils.cjs`（derive / compile / 串聯 / 循環 / 深度 / 機密邊界）核心函式，並新增 PromptModal 元件掛載 smoke test；新增 `E2E/test-v31.cjs`（19 項，真實加密驅動 DB）

### V3.0.0 (2026-06-03) - MCP Tools & Vault Security

> **⚠️ 重大版本**：資料庫從明文升級為 SQLCipher 加密。首次啟動會備份舊資料（`promptbox.db.plain.bak`）並建立新加密庫；舊資料不自動遷移。請手動下載安裝此版本。

- 🔐 **靜態加密（SQLCipher）**：整個本地資料庫以 AES-256 頁級加密；金鑰由 OS Keychain（Windows DPAPI / macOS Keychain）保護，金鑰不落明文
- 🛠️ **MCP Tools 化（弱型別）**：每個未鎖定 Prompt 自動暴露為 `prompt_{id}` Tool；`{{var}}` 推導為 JSON Schema（全 string + required）；AI 帶參數呼叫後端直接編譯返回純淨字串，省 Token、可驗證
- ✅ **Ajv 弱驗證 + 對話引導式錯誤**：缺必填參數返回 `Missing required property 'x'. Please ask the user to provide it.`
- 🔔 **`notifications/tools/list_changed`**：Prompt 新增/編輯/鎖定後即時通知已連線 IDE 刷新 Tool 列表
- 🔒 **資料鎖（is_locked）**：卡片一鍵 🔒 鎖定，對 MCP 的 tools/list、tools/call、resources 完全隱藏
- 🔐 **機密卡片（卡片級加密）**：使用者設自訂密碼，以 scrypt（N=2¹⁷）+ AES-256-GCM 加密 content；密碼永不儲存；GUI 需密碼查看；AI 永遠無法取得
- 🪙 **具名多 Token（FR-8）**：單一共用 Token 升級為可具名、可個別撤銷的多 Token；驗證失敗 → 401；逾速率（60 req/min per token）→ 429；支援向下相容自動遷移
- 📋 **description 欄位**：Prompt 新增說明欄位，作為 MCP Tool 的 description（空則 fallback 至 title）
- **#id 顯示**：卡片左下角顯示 `#id`（GitHub Issue 風格），為 Prompt Chaining 鋪路
- 🔄 **手動更新（v3.0 起）**：關閉自動靜默安裝，改為「發現新版 → 提示 → 前往下載頁手動安裝」，避免無聲重置使用者資料 —— <sub>⛔ **v3.3.0 已整個移除**（當時「手動」只指下載安裝，啟動時的檢查仍是自動的）</sub>
- 🧪 **整合測試覆蓋**：新增 E2E 整合測試（66 項），以真實 SDK + 加密 DB 驗證 MCP Tools、Token 認證、機密卡片全流程

### V2.3.0 (2026-05-28) - MCP Streamable HTTP

- 🌊 **Streamable HTTP 傳輸**：新增 `/mcp` 端點支援 MCP Streamable HTTP（stateless，每請求新建 server + transport），與 legacy SSE 並存

### V2.2.0 (2026-05-26) - MCP Integration

- 🔌 **本地 MCP SSE 伺服器**：內建符合 Model Context Protocol 標準的 SSE 伺服器（`127.0.0.1`），讓外部 IDE 透過 `ListResources` / `ReadResource` 直接讀取 Prompt 資產
- 🛡️ **Token 認證**：每次安裝自動生成隨機 Token，支援 `Authorization: Bearer` Header 與 `?token=` URL 參數
- 🖥️ **System Tray 模式**：關閉主視窗後應用程式縮小至系統匣持續運行，MCP 服務不中斷
- 🎛️ **MCP 設定面板**：側欄新增 MCP 設定按鈕，可查看伺服器狀態、管理 Token、啟動/停止伺服器、一鍵產生 IDE 設定 JSON

### V2.1.3 (2026-03-24) - Variable Key Sync

- 🔑 **孤立變數 Key 自動清理**：儲存 Prompt 時，自動偵測並移除 `variables` 中已不存在於 `content` 的孤立 Key

### V2.1.2 (2026-03-11) - Installation & System Reset

- 📂 **自訂安裝路徑**：Windows 安裝精靈開放選擇安裝磁碟與資料夾
- 📦 **免安裝便攜版**：新增 Release 產出 `.zip` 格式
- 🧹 **清除快取與重設機制**：設定頁面一鍵清除所有資料並還原出廠狀態

### V2.1.0 (2026-03-10) - Performance Optimization

- ⚡ **極速啟動體驗**：Skeleton Screen 與 `ready-to-show` 視窗優化
- 🔄 **非同步資料載入**：SQLite 資料庫讀取非同步化
- 📦 **打包體積優化**：Vite `manualChunks` + esbuild Bundle 分割

### V2.0 (2026-03-09) - Auto Update

- 🔄 **自動更新機制**：整合 `electron-updater`，軟體啟動時自動比對 GitHub Releases 最新版本
- 🔒 **CSP 安全性強化**：加入 Content-Security-Policy Header

### V1.5 (2026-02-16) - Variables Template

- ✨ 新增變數樣板功能（`{{variableName}}` 語法）+ Variables Panel 元件

### V1.2 (2026-02-15) - Pinia & Markdown

- 🔄 引入 Pinia 狀態管理 + Markdown 預覽

### V1.0 - Initial Release

- 基礎 Prompt 管理功能、SQLite 本地儲存、資料夾與標籤系統
