# 產品改名：官網 repo 的動手清單

> **狀態**：⬜ 未動工 —— 卡在 [待討論問題 §八](待討論問題.md)「改名的正確時序」第 ④ 步（發出比賽用 Free build）之後
> **建立**：2026-09-09　·　**最後查核**：2026-09-09
> **範圍**：只管 `promptbox-web` 這一個 repo。App repo 的改名（視窗標題、關於視窗、安裝程式顯示名稱）不在這裡。

---

## 0. 這份不回答什麼

**正本永遠不要有兩份**（[文件規則 §6](../文件規則.md)）。下面這些本檔一律不重述：

| 你要找的 | 正本在哪 |
| --- | --- |
| 為什麼要改名、什麼時候才能改、改之前**不准做**什麼 | [待討論問題 §八](待討論問題.md) |
| 哪些字串**永遠不能改**、它們的現值與凍結值 | [身分字串凍結清單](../appsync/身分字串凍結清單.md)、[SYNC-001 名詞對照表](../appsync/SYNC-001_名詞對照表.md) |
| 網域什麼時候買、DKIM 怎麼設 | [上線前置鏈](上線前置鏈.md) P6 |
| **新名字是什麼** | **還沒定。** 本檔刻意不留「新名字」欄位 —— 留了就會有人來填，然後這裡變成第二個正本 |

> **本檔只回答一件事**：改名那天，這個 repo 要動哪些檔、**哪幾處看起來該動但不能動**、以及怎麼證明改乾淨了。

---

## 1. 🔴 先分清楚：這裡有四種名字，只有一種要改

改名當天最容易犯的錯不是漏改，是**多改**。repo 裡同時存在四種名字，在 `grep -i promptbox` 底下長得一模一樣：

| 名字 | 現值 | 改名當天 | 依據 |
| --- | --- | --- | --- |
| **產品名（A 類品牌字串）** | `PromptBox` | ✅ **全部要改**，見 §3 | [待討論問題 §八](待討論問題.md) A 類 |
| **公司名** | 覺構 / JueBuild | ❌ **不動** —— 結構是 Mozilla／Firefox：公司名穩定，產品名可換 | [D31](待討論問題.md) |
| **身分字串（B 類）** | `com.eychen.vault`、`{appData}/EYChen/Vault`、`vault.db`、`vault://`、MCP server `vault` | 🔴 **永遠不動。** 改了＝資料變孤兒，或永久解不開 | [凍結清單 §B](../appsync/身分字串凍結清單.md) |
| **網域** | `promptbox.app`（**佔位值，尚未購買**） | ⚠️ **另一條線** —— 跟著 P6 走，不跟著改名走。見 §4-2 | [Q10-a](待討論問題.md) |

**§2 就是把這四種混在一起的地方拆出來。**

---

## 2. 🔴 看起來該 sed、但不能：九類陷阱

> 全 repo 共 **412 處** `promptbox`（不分大小寫），`Src/` 佔 **178 處**。
> 下面九類**不在**可安全取代的範圍內。**先讀完這節，再跑任何取代。**

| # | 位置 | 為什麼不能跟著改 | 該怎麼處理 |
| --- | --- | --- | --- |
| **T1** | [`app/pages/download.vue`](../../Src/app/pages/download.vue) `:28` `:33`<br>`PromptBox-Setup-3.7.1.exe`／`promptbox-v3.7.1.zip` | 這是 **R2 上實體檔案的檔名**，由 App repo 的建置產物決定，不是官網說了算。改了 `href` 就 404 | 🔴 等 App 出新名字的建置，`href` 與 `sha256` **成對更新**（[CLAUDE.md 紅線 5](../../CLAUDE.md)） |
| **T2** | 同上 `:274` `:278`<br>`Get-FileHash .\PromptBox-Setup-3.7.1.exe`／`shasum -a 256 …` | 校驗指令範例裡的檔名**必須與真實檔名逐字相同**，否則使用者照抄會失敗 | 同 T1，與 `href`／`sha256` 同一批動 |
| **T3** | [`content/docs/9.install-safety.md`](../../Src/content/docs/9.install-safety.md) `:45` `:50` | 同 T2 的**第二份**（手冊裡也印了一次同樣的指令） | 同 T1。**兩份要一起改**，漏一份就是兩個檔名並存 |
| **T4** | [`app/pages/download.vue`](../../Src/app/pages/download.vue) `:383`<br>HTML 註解裡的 `promptbox.db.plain.bak` | 這句是**改名沿革的紀錄**（「v3.7.2 起由 `promptbox.db.plain.bak` 改名」）。舊值就是它的內容，改掉等於刪掉紀錄 | ❌ 不動 |
| **T5** | [`public/demo-app/index.html`](../../Src/public/demo-app/index.html) `:1459`<br>`"promptbox · " + call` | 這是模擬 IDE 顯示 MCP tool call 的**來源標籤**，對應 **MCP server name**，凍結值是 `vault`，**不是新品牌名** | ⚠️ **改成 `vault`，而且不必等改名** —— 它現在就跟 App 對不上。W2 已把 [`content/docs/7.mcp.md`](../../Src/content/docs/7.mcp.md) 的設定鍵改成 `vault`，**這一處漏了** |
| **T6** | 同上 `:1034` `:1037`<br>`svc_promptbox`／`promptbox-prod-assets` | 示範用的**假 .env 內容**（用來演「機密卡裡放的是什麼」）。它不是產品名，是道具 | 改不改都行。要改的話先確認新字串**不會剛好是一個真的存在的東西** |
| **T7** | [`content/about/2.how.md`](../../Src/content/about/2.how.md) `:35`、[`content/about/3.status.md`](../../Src/content/about/3.status.md) `:63`<br>`%APPDATA%\EYChen\Vault\vault.db` | 這是 **B 類凍結路徑**。`grep promptbox` 抓不到它，但改名當天一定會有人想「順手改一致」 | 🔴 **不動。** 改名後它會更不像同一個產品 —— 要補的是**一句說明**，不是改路徑（[關於我頁 Q4](關於我頁.md)） |
| **T8** | `Docs/refer/` 扣掉 `BRD/` 的 **53 處** | 唯讀快照，正本在 App repo。改了會讓副本與正本對不上 | ❌ 不動（[CLAUDE.md 紅線 3](../../CLAUDE.md)）。⚠️ **但 `refer/BRD/` 的 30 處是正本，要改** —— 見 §6 |
| **T9** | `Docs/appsync/` 的 **97 處** | 大多是**記錄舊值的對照表**（`com.promptbox.app` → `com.eychen.vault` 這種）。全域取代會把箭頭左邊也換掉，整張表就失去意義 | ⚠️ **逐處看**，只改「指產品本身」的那些。對照表的舊值欄一律保留 |

---

## 3. A 類：可以安全全域取代的部分

扣掉 §2 那 10 處陷阱之後，`Src/` 還剩 **168 處**；其中 **164 處**是純品牌字串，取代不會誤傷 ——
`PromptBox` 是獨特專有名詞，[待討論問題 §八](待討論問題.md) 已論證過**不需要為它做參數化**（那只會讓語系檔變難讀）。

> 剩下的 4 處不在本節：`nuxt.config.ts` 的 2 處與 `.env.example` 的 1 處是**網域**（§4-2），
> `package.json` 的 1 處是 **repo 名**（§6）。兩者都不是產品名。

### 3.1 語系檔（132 處，最大宗）

| 檔案 | 處數 | 備註 |
| --- | --- | --- |
| `Src/i18n/locales/zh-TW/`（12 檔） | 48 | |
| `Src/i18n/locales/en/`（12 檔） | 49 | |
| `Src/i18n/locales/ja/`（9 檔有值） | 35 | ⚠️ ja **尚未在 [`nuxt.config.ts`](../../Src/nuxt.config.ts) 的 `locales` 啟用**，但檔案在、值也填了 —— 一起改 |

密度最高的是 `home.json`（zh-TW／en 各 11 處）與 `enterprise.json`（各 6 處）。
其中很大一部分是 **`meta.title` / `meta.description` 與圖片的 `alt`／`aria`** ——
**這些不會在畫面上直接看到，是最容易漏的一批。**

🔴 **`ja/about.json`、`ja/demo.json`、`ja/what-we-dont-do.json` 目前是空骨架（0 個值）。**
改名當天它們沒東西可改，但**翻譯填進去的那天要記得用新名字**。
`check:i18n` 只比對 key、不比對值 —— **它不會提醒你**。

### 3.2 程式碼（6 處）

| 位置 | 是什麼 |
| --- | --- |
| [`app/components/AppHeader.vue`](../../Src/app/components/AppHeader.vue) `:66` | 站首字標（wordmark），純文字 |
| [`app/components/AppFooter.vue`](../../Src/app/components/AppFooter.vue) `:54` | 頁尾字標 |
| 同上 `:17` | 🔴 `href('PromptBox', '/privacy#contact')` —— 這是 **mailto 的主旨**，會出現在收信人的信箱裡。**不是註解** |
| [`app/pages/download.vue`](../../Src/app/pages/download.vue) `:79` | hero 標題（`titleLead` 之後接的字標） |
| [`app/pages/about.vue`](../../Src/app/pages/about.vue) `:3`、[`app/pages/changelog.vue`](../../Src/app/pages/changelog.vue) `:38` | 註解 |

> 另有 [`scripts/check-content.mjs`](../../Src/scripts/check-content.mjs) `:10` 一處註解。

### 3.3 內容檔（15 處）

`Src/content/about/*.md`（4 檔 6 處）、`Src/content/docs/*.md`（5 檔 7 處，已扣掉 T3）、
[`content/changelog/v3.7.0.md`](../../Src/content/changelog/v3.7.0.md)（2 處）。

⚠️ **changelog 是歷史紀錄，要不要改是立場問題**：
改＝以現名重述歷史；不改＝讀者在版本紀錄裡看到一個不認識的名字。
**建議改**（changelog 對外的用途是「這個產品做過什麼」，不是考古），**但這需要拍板**。

### 3.4 示範頁（10 處）

[`public/demo-app/index.html`](../../Src/public/demo-app/index.html) 扣掉 T5／T6 之後：
`<title>`、左側 App 視窗標題、對話文案等。
**這是一份零外部依賴的獨立 HTML，語系檔管不到它** —— 改語系檔的時候不會順手掃到。

---

## 4. 三件卡順序、不在同一天做的事

### 4-1　下載檔名 + sha256（等 App）

T1／T2／T3 共 **6 處**，前置是「App repo 出一版用新名字的建置」。
🔴 **`href` 與 `sha256` 必須成對更新**，對不上比沒有更糟（[CLAUDE.md 紅線 5](../../CLAUDE.md)）。

> 在新建置出來之前，官網照舊掛 `3.7.1` 的檔名是**正確的**，不是漏改。

### 4-2　網域（等 P6，跟改名是兩條線）

佔位值 `promptbox.app` 出現在 **3 處**：
[`nuxt.config.ts`](../../Src/nuxt.config.ts) `:75`（i18n `baseUrl`）、`:100`（`public.siteUrl`）、
[`.env.example`](../../Src/.env.example) `:7` 的註解。

正式環境走 `NUXT_PUBLIC_SITE_URL` ⇒ **買到網域當天先設 Vercel 環境變數就能上線**，這三處是 fallback，可以晚一步。
但**不要放著不改** —— 本機 dev 與任何忘了設變數的環境，會靜默用舊網域產出 canonical／hreflang／og:url。

### 4-3　憑證 `iss`（🔴 過了就回不去）

[ADR-008](../appsync/ADR-008_授權憑證格式與離線驗證契約.md) 的 payload 有 `"iss": "promptbox.app"`，驗證時**逐字相符**，而憑證**不可撤銷**。
官網這端目前只有文件、實作未動工。

**這一條不是「改名要改什麼」，是「改名前不要製造出改不掉的東西」** ——
[待討論問題 §八](待討論問題.md) 已把「簽任何一張憑證」列為改名前的禁止事項。

---

## 5. sed 改不到的四件事

| 項目 | 現況 | 要做什麼 |
| --- | --- | --- |
| **Logo 圖檔** | `Src/public/assets/icon.png`，被 header、footer 與 `nuxt.config.ts` 的 `rel="icon"` 三處引用**同一顆** | 換圖即可，**引用路徑不必動**（檔名是路徑，不是品牌）。三處會一起換 |
| **字標排版** | 字標是純文字，`font-ui`（Inter／Noto Sans TC）+ `text-2xl` | 新名字長度不同 ⇒ 改完**要看 `max-lg` / `max-md` 斷點**。header 是 flex，字變長會擠掉導覽 |
| **localStorage 鍵 `pb-theme` / `pb-analytics`** | `pb` = PromptBox 的縮寫，出現在 [`useTheme.ts`](../../Src/app/composables/useTheme.ts) `:19`、[`useAnalyticsConsent.ts`](../../Src/app/composables/useAnalyticsConsent.ts) `:15`、[`nuxt.config.ts`](../../Src/nuxt.config.ts) `:174`（防 FOUC 的同步 script）——**而且兩個鍵名都印在隱私頁上**（[`privacy.vue`](../../Src/app/pages/privacy.vue) `:140` `:143`） | 🔴 **需要拍板**，見下 |
| **JSON-LD / `llms.txt`** | [Wishlist/forAI.md](../Wishlist/forAI.md) 已寫好素材（19 處 `PromptBox`，且自己標注網域待確認），**尚未實作** | ⚠️ **不要在改名前實作它** —— 那等於保證要再做一次 |

### 🔴 待拍板：`pb-` 前綴要不要跟著改名

| 選項 | 代價 |
| --- | --- |
| **A. 留著不改**（建議） | 隱私頁上會出現一個解釋不了的 `pb`。可順手把那兩格改成不提縮寫來源 |
| **B. 改成新前綴** | 所有回訪者的**主題偏好被重設**（可接受）＋ **分析退出同意被重設**（要重新問一次 —— 這是有成本的，而且發生在最需要信任的時候） |

**建議 A**，理由與 [凍結清單](../appsync/身分字串凍結清單.md) 的核心論證是同一條：
**鍵名不是品牌 —— Firefox 的設定檔路徑到今天還寫著 `Mozilla`。**
差別只在這裡的破壞力小得多（重設偏好 ≠ 資料變孤兒），所以這是建議，不是紅線。

---

## 6. 文件回寫義務

改名**不改站台結構**，所以 PageDescription 的 **§3 連結拓樸不會變**；會變的是 §2 的內容實體與各頁標題。

| 要回寫的 | 處數 | 動什麼 |
| --- | --- | --- |
| [webspec/PageDescription/](../webspec/PageDescription/) | 7 | 主要是 [02_download.md](../webspec/PageDescription/02_download.md) 的**檔案實體 ①②**（檔名隨 T1 變），與各頁 §2 的標題敘述 |
| [webspec/主張與依據.md](../webspec/主張與依據.md) | 4 | 引號裡的**措辭禁令**（「不說『PromptBox 是開源軟體』」）—— 禁令的對象跟著改名 |
| [webspec/systemV2.md](../webspec/systemV2.md) | 1 | 標題 |
| [appsync/SYNC-001_名詞對照表.md](../appsync/SYNC-001_名詞對照表.md) | — | 🔴 **不改舊值欄**，改成**加一列**「品牌名：`PromptBox` → 新名」。對照表的價值就在左邊那半 |
| [appsync/身分字串凍結清單.md](../appsync/身分字串凍結清單.md) | — | 同上，**一個字都不要改** —— 它整份的內容就是「舊值長什麼樣」 |
| **`Docs/refer/BRD/` 六冊** | 30 | ✅ **要改** —— 它是 BRD **正本**（[CLAUDE.md 紅線 3](../../CLAUDE.md)），不是快照 |
| `Docs/refer/` 其餘 | 53 | ❌ **不改**（T8） |
| [README.md](../../README.md) | 9 | 含 §一「是什麼／不是什麼」與環境變數表 |
| [CLAUDE.md](../../CLAUDE.md) | 2 | 紅線 4 裡 `promptbox.db` 的字面。⚠️ **該值已凍結為 `vault.db`，這裡本來就該順手校正** |
| `Docs/webplan/` 其餘 | 32 | 含本檔。多數是歷史敘述，逐處看 |

### repo 名與資料夾名：建議不改

`promptbox-web`（[`package.json`](../../Src/package.json) `:2`）與磁碟路徑 `j:\desktopp\promptbox-web`。
改了會連帶失效：Docs 裡所有寫死的絕對路徑、`.claude/settings.json` 的 **2 條 allow 規則**。

**理由同 §5 的 `pb-` 前綴** —— repo 名不是品牌，而且它不對外。

---

## 7. 🔴 驗收：完全沒有機器在守這件事

**三支護欄一支都不檢查品牌名**：
`check:content` 擋沒包在程式碼裡的 `{{ }}`、`check:i18n` 比對 key（**不比對值**）、`check:docs` 檢查相對連結。

**改名是這個 repo 裡最大的一件「靜默壞掉」** —— 這正是本檔存在的理由，也是下面幾條必須手跑的原因。

```bash
# ① 應該只剩下 §2 列出的那幾類陷阱。逐一比對，不該冒出第十類
cd Src
grep -rn -i "promptbox" app content i18n public scripts nuxt.config.ts package.json .env.example

# ② 建置（三支護欄 + nuxt build）
npm run build
```

目視三項：

- [ ] `/` 與 `/en`（日後 `/ja`）的 `<title>` 與 `meta description` 都換了 —— **meta 不在畫面上，最容易漏**
- [ ] header 與 footer 的字標，在 `max-lg` / `max-md` 斷點沒有擠掉導覽（§5）
- [ ] 隱私頁的 `pb-theme` / `pb-analytics` 那兩格說得通（§5 拍板之後）

---

## 8. 不在本檔範圍

| 在哪 | 什麼 |
| --- | --- |
| **App repo** | 視窗標題、關於視窗、安裝程式顯示名稱（＝ A 類）。🔴 B 類一律不動 |
| **外部帳號** | Buttondown newsletter 名稱（[D30](待討論問題.md) 已註明「名稱先隨意，改名後再改」）、Polar 商品名、Vercel 專案名 |
| **公司身分** | 覺構／JueBuild 與 `juebuild.ops@gmail.com` —— [D31](待討論問題.md) 已明列**不受改名影響** |
