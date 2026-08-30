# Docs — 官網文件索引

> **這個資料夾裝什麼**：`promptbox-web`（官網）的計畫、現況規格、跨 repo 契約、與外部參考。
> **它不裝什麼**：網站怎麼跑、技術棧、環境變數、npm 指令 —— 那些在 [根 README](../README.md)。
> **最後整理**：2026-08-29
>
> **怎麼寫文件**（什麼時候該開檔、檔頭格式、狀態詞彙）見 [文件規則.md](文件規則.md)。本檔只回答「東西在哪」。

---

## 兩條入口路徑：先選一條

**這份 Docs 是為「要動手改一處」設計的，不是為「第一次想搞懂網站」設計的。** 不要從頭讀到尾。

| 你是誰 | 走這條 |
| --- | --- |
| **第一次打開，想知道網站怎麼跑** | [根 README](../README.md) §四～§六（頁面／渲染／護欄）→ [webspec/PageDescription/](webspec/PageDescription/README.md) 的站台拓樸 → 回頭看本檔 §一。約 30 分鐘 |
| **已經知道網站長怎樣，要改一處** | 直接跳本檔 **§二「要動 X，先看 Y，動完回寫 Z」**，那張表就是動手路線的全部入口 |

> 理解路線一輩子走一次，動手路線每天走 —— 所以下面的「先看這三份」是**動手路線**的三份。
> 想先建立架構心智模型的人，那三份都不回答那個問題，請走上表第一列。

---

## 🔴 先看這三份

| 想知道 | 看 |
| --- | --- |
| **現在做到哪、還有什麼沒決定** | [webplan/待討論問題.md](webplan/待討論問題.md) —— 已拍板決策 D1–D31、待決問題、現況待修 F1–F15、階段規劃 |
| **網站上每句話的依據站不站得住** | [webspec/主張與依據.md](webspec/主張與依據.md) —— **改文案前先看這份** |
| **哪些事交期以週計、不做會卡住上線** | [webplan/上線前置鏈.md](webplan/上線前置鏈.md) —— 公司登記 → D-U-N-S → Apple／簽章憑證；網域 → DKIM |

---

## 一、四個資料夾：判準與內容

判準只有兩刀：**① 這是「要做什麼」還是「現在是什麼」？② 官網一邊做得完，還是需要 App 那邊？**

| 資料夾 | 是什麼 | 判準 | 讀寫 |
| --- | --- | --- | --- |
| **[webplan/](webplan/)** | 要做什麼 | 官網自己做得完 | 做完凍結 |
| **[webspec/](webspec/)** | 現在是什麼 | 程式碼的鏡子 | 🔴 **每次改動都要回寫** |
| **[appsync/](appsync/)** | 跟 App 對得上的 | 需要 App 那邊也動、或需要 App 那邊為真 | 改動需雙方同意 |
| **[refer/](refer/)** | 參考、佐證 | 正本在別處 | 唯讀，可疑就回正本 |

### webplan/ —— 要做什麼

| 文件 | 管什麼 |
| --- | --- |
| [待討論問題.md](webplan/待討論問題.md) | 決策 D1–D31、待決問題、現況待修 F1–F15、階段規劃、改名時序 |
| [上線前置鏈.md](webplan/上線前置鏈.md) | 交期以週計算、且互相串聯的前置事項 P1–P7。觸發條件寫成條件而非日期 |
| [PRD_階段一_Nuxt遷移.md](webplan/PRD_階段一_Nuxt遷移.md) | 從靜態 HTML 搬到 Nuxt 4 的範圍與驗收條件 |
| [PRD_階段二_Content化.md](webplan/PRD_階段二_Content化.md) | changelog／docs 為什麼變成 Markdown、資產怎麼瘦身 |
| [PRD_階段三_i18n與訂閱.md](webplan/PRD_階段三_i18n與訂閱.md) | i18n、GA4、隱私頁、訂閱表單；含上線前的環境變數交接表 |
| [PRD_階段五六_金流與授權發放.md](webplan/PRD_階段五六_金流與授權發放.md) | 金流／登入／下載閘門為什麼暫緩、依賴順序長什麼樣 |

### webspec/ —— 現在是什麼（🔴 改完要回寫）

| 文件 | 鏡射什麼 |
| --- | --- |
| [PageDescription/](webspec/PageDescription/) | 七個路由的資訊架構與意圖分析（2026-08-30 增 `/what-we-dont-do`）。**這個網站唯一的架構記錄，正本只有這一份** |
| [主張與依據.md](webspec/主張與依據.md) | 對外主張 ↔ 可查證依據 ↔ 目前狀態。主張來源是 PageDescription 的「核心內容映射」 |
| [systemV2.md](webspec/systemV2.md) | 官網的 design token（從 `style.css` 逆向拆解）。⚠️ 與 App 那套不可互換 |

### appsync/ —— 跟 App 對得上的

| 文件 | 管什麼 | 性質 |
| --- | --- | --- |
| [App事實依據.md](appsync/App事實依據.md) | 官網文案依賴的 App 紅線（A5 零外連、B5 資料連續性、C1/C2 誠實紅線…）與**查核方式** | 📋 單向依賴，官網不能改 |
| [身分字串凍結清單.md](appsync/身分字串凍結清單.md) | 🔴 **發出任何安裝檔之前**要定死的一批字串。擋的是唯一「發出去就回不去」的事 | 🔒 一次凍結 |
| [ADR-008_授權憑證格式與離線驗證契約.md](appsync/ADR-008_授權憑證格式與離線驗證契約.md) | 憑證長什麼樣、App 怎麼離線驗簽。含「🔴 刻意不存在的欄位」一節 | 📈 版本化（版本在 payload） |
| [官網金流與授權發放接縫.md](appsync/官網金流與授權發放接縫.md) | 錢進來之後，憑證怎麼生出來、送到誰手上、出錯怎麼救 | 📈 |

### refer/ —— 參考（唯讀）

⚠️ **以下全部是快照，不會跟著正本更新。** 正本在 App repo `j:/desktopp/githut/PromptBox/`。

| 文件 | 為什麼留著 |
| --- | --- |
| [BRD/](refer/BRD/) | **商業模式與定價的依據，refer 裡唯一必讀的**。BRD-02 §3 是 $19 / $109 / $69 / 150 名的出處；BRD-03 是 Free/Pro 邊界與配額 |
| [APP快照.md](refer/APP快照.md) | App 的 README（v3.7.1）。功能清單、版本歷程、`promptbox.db` 檔名等事實的出處 |
| [FP04.md](refer/FP04.md) | §五 資料連續性紅線（B5 出處）、§四 Free/Pro 邊界 |
| [FP05.md](refer/FP05.md) | 定案未執行的倉庫結構決策 |
| [promptbox-spare-img/](refer/promptbox-spare-img/) | 備用截圖，目前頁面沒用到，換圖時取用 |

---

## 二、🔴 要動 X，先看 Y，動完回寫 Z

**這張表是本檔的重點。** 資料夾名字用猜的就知道八成，這張表猜不出來。

| 你要動 | 動之前先看 | 動完要回寫 |
| --- | --- | --- |
| **任何價格／配額數字** | `Src/app/utils/pricing.ts`（唯一來源）→ [BRD-02 §3](refer/BRD/BRD-02_商業模式與定價.md)、[BRD-03](refer/BRD/BRD-03_授權與Free-Pro邊界.md) | — |
| **任何對外文案** | [webspec/主張與依據.md](webspec/主張與依據.md) | 若是**新主張** → 加一列，**依據欄填不出來就不要上線** |
| **關於 App 行為的文案**（不連網、加密、升級不掉資料） | [appsync/App事實依據.md](appsync/App事實依據.md) | 主張與依據對應列 |
| **頁面加／刪區塊、改連結去向** | [webspec/PageDescription/](webspec/PageDescription/) 對應頁 + [systemV2.md](webspec/systemV2.md) | **PageDescription §2 §3 ＋ 主張與依據，兩份一起** |
| **色、間距、圓角、字體** | [webspec/systemV2.md](webspec/systemV2.md) | systemV2 對應 token 表 |
| **手冊／版本紀錄內容** | `Src/content/**.md`（唯一來源）；跑 `npm run check:content` | — |
| **版面文案 key** | `Src/i18n/locales/**`；跑 `npm run check:i18n`（ja 是骨架也要補） | — |
| **新增路由／API 端點／外部服務／環境變數** | [webplan/待討論問題.md](webplan/待討論問題.md) 的 D 清單 → **先在 webplan/ 開一份** | webplan 那份標 ✅ 已上線 |
| **任何 App 也認得的字串**（appId、DB 檔名、MCP server 名、userData 路徑） | [appsync/身分字串凍結清單.md](appsync/身分字串凍結清單.md) | 🔴 **不要動。** 改了會讓既有使用者的資料變孤兒或永久解不開 |

---

## 三、三條硬規則

1. **價格只有一個來源**：`Src/app/utils/pricing.ts`。語系檔用 `{proEarly}` 這種具名參數引用，改價只改一處。
2. **依據欄填不出來 ⇒ 那句話不能上線。** 誠實紅線 C1/C2 不是文案風格，是紅線（見 [App事實依據 §二](appsync/App事實依據.md)）。
3. **`refer/` 是唯讀的。** 要拿它的內容當依據可以，但**不要編輯它**——它是別人的正本的影子。

---

## 四、已知的文件債

| # | 債 | 影響 |
| --- | --- | --- |
| 1 | `refer/BRD/` 六份裡只有 BRD-02 有副本檔頭，其餘五份沒標快照日與正本位置 | 讀的人不知道它可能過期 |
| 2 | `refer/` 底下的連結指向 App repo 的路徑（`../ADR/`、`_archive/`、`Wishlist/`…） | **不是債，是副本的正常狀態** —— 改它會讓副本與正本對不上。`check:docs` 已明文豁免 `Docs/refer/` |
| 3 | B5 護欄只釘住 `appId` 與 `productName` | 見 [主張與依據 §缺口 4](webspec/主張與依據.md) |
