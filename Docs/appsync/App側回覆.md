# App 側回覆（Reply from the App Repo）

> **這份文件解決的問題**：官網 repo 看不到 App 的程式碼，`Doc/appsync/` 那四份文件裡
> 有一批格子是空的、一批敘述是**推測**的。這份是 App 側的查核結果、拍板結論，
> 以及**官網那一端需要跟著做的事**。
>
> **回覆對象**：[App 事實依據](App事實依據.md)、[ADR-008](ADR-008_授權憑證格式與離線驗證契約.md)、
> [官網金流與授權發放接縫](官網金流與授權發放接縫.md)、[身分字串凍結清單](身分字串凍結清單.md)
>
> **查核日**：2026-08-31　·　**查核基準**：App repo `main` @ `f2653d7`（v3.7.1）
>
> 🔴 **本檔是查核結果與跨 repo 通知，不是實作規格。**
> App 側要怎麼做已立案為 [v3.7.2 PRD 身分字串凍結]，
> 憲法層的改動記在 [ADR-000 §6 的 2026-08-31 條目]。
> **這份文件不重複那些內容**，只保留官網需要知道的部分。
>
> 📌 **App 程式碼路徑一律寫成純文字不做連結**：這份文件兩個 repo 都會讀，
> App 路徑在官網 repo 點不開。起點都是 App repo 的子專案目錄 `PromptBox/`。

---

## 〇、現在的分工

|            | 範圍                                        | 落在哪                           |
| ---------- | ------------------------------------------- | -------------------------------- |
| **主線**   | 身分字串：選定 + 凍結 + 護欄 + Windows 驗收 | ✅ **已立案 v3.7.2**（App repo） |
| **憲法**   | `ADR-000 B5` 凍結對象改寫                   | ✅ **已改**（App repo）          |
| **官網**   | 因身分字串改動而要跟著改的文案與文件        | **§二 —— 待官網執行**            |
| ⏸ **暫緩** | ADR-008 憑證格式、Q12 交付外觀、金流接縫    | **§四 —— 等會員區 + Polar 串好** |

**暫緩的理由（創辦人 2026-08-31）**：憑證的交付外觀與細節，要等 Polar 實際串起來、
看到它發的購買憑證長什麼樣才知道；而憑證本身要等官網會員區做完才會做。
**現在拍板等於在缺一半資訊的情況下定死一件發出去就改不了的事。**

> 🔴 **兩件事的時間壓力不對稱，這是排序的全部理由。**
> 憑證可以等（會員區沒做完，它連做都做不了）；
> 身分字串不能等（**發出比賽用 Free build 的那一刻就永久定案**）。

---

## 一、拍板結果（2026-08-31 創辦人）

### 1.1　三個決定

| #   | 問題                                    | 裁示                                                                      |
| --- | --------------------------------------- | ------------------------------------------------------------------------- |
| 1   | 步驟 0：有沒有既有使用者                | **沒有** ⇒ 走 **§B 重選分支**（2026-08-30 已答）                          |
| 2   | Free / Pro 是兩個不同軟體，那身分字串呢 | **共用同一組身分字串**。兩個 codebase、兩份建置，但對作業系統是同一個 App |
| 3   | 永久產品代號                            | **`vault`**                                                               |

### 1.2　定案的字串組

| 項目                | 現值                              | **凍結值**                           |
| ------------------- | --------------------------------- | ------------------------------------ |
| `build.appId`       | `com.promptbox.app`               | **`com.eychen.vault`**               |
| userData 路徑       | `{appData}/PromptBox`（**推導**） | **`{appData}/EYChen/Vault`（寫死）** |
| `app.setName()`     | 無                                | **`Vault`** ⚠️ 見下                  |
| 加密 DB 檔名        | `promptbox.db`                    | **`vault.db`**                       |
| v2 明文備份         | `promptbox.db.plain.bak`          | **`vault.db.plain.bak`**             |
| keystore 檔名       | `keystore.bin`                    | **不變**（現值已中性，沒有改的理由） |
| MCP server name     | `PromptBox`                       | **`vault`**                          |
| MCP IDE 設定鍵名    | `mcpServers.PromptBox`            | **`mcpServers.vault`**               |
| MCP resource URI    | `promptbox://folders/{name}`      | **`vault://folders/{name}`**         |
| NSIS `guid`         | 未明設（由 appId 推導）           | **明設固定 UUID**                    |
| `build.productName` | `PromptBox`                       | **不凍結**，隨品牌走                 |

> ⚠️ **`app.setName('Vault')` 是唯一會出現在使用者眼前的身分字串**：
> macOS 鑰匙圈授權對話框會顯示「『Vault』想要使用你儲存在鑰匙圈中的機密資訊」。
> 若要改成更明確的值（例如 `EYChen Vault`），**必須在發出第一個 mac build 之前決定**。
> Windows 不受影響（DPAPI 綁使用者帳戶，不綁名字）。

### 1.3　🔴 `productName` 不再是身分字串（B5 已改寫）

凍結清單 A-2 自己指出了衝突（`productName` 同時是安裝顯示名與 userData 目錄名），
並給了解法「把 userData 路徑從推導改成寫死，之後 `productName` 就自由了」——
**但清單後面又把它留在凍結表裡，等於解法沒有被兌現。**

查核結果：寫死 userData 之後，`productName` 只剩下「安裝目錄名 + 捷徑顯示名」，
而 NSIS 的升級判定與「程式集裡只有一個」**都由 `appId` 推導的 GUID 決定**
（清單 A-1「附帶」欄自己寫了）。所以它就是純 A 類品牌字串。

`ADR-000 B5` 已於 2026-08-31 改寫為 **`appId` + userData 路徑**，
理由與教訓記在 ADR-000 §6。**紅線的保護力不減反增**——userData 路徑從 v3.4.0 立護欄至今從未被保護過。

### 1.4　🔴 「兩個不同軟體」帶來的一個新工作量

「共用身分」在單一 `package.json` 時是**結構保證**（只有一份值，想不一樣都難）。
拆成兩個 codebase 之後，它降級為**兩份各自寫對的字面值**。

> 沒有任何機制會告訴你它們漂開了。
> 你只會在某個買了 Pro 的人回報「我的卡片不見了」的時候才知道。

因此 **`identity.cjs` 與護欄測試，Pro codebase 建立時兩份都要複製過去**。
這條已寫進 v3.7.2 PRD §9 與 ADR-000 B5。

---

## 二、🔴 給官網的動作清單

以下五項因 App 側的改動而產生，**歸屬在官網 repo**。

| #      | 動作                                                                                              | 觸發原因                                                                                                                                                                     | 急迫性                                               |
| ------ | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **W1** | 安裝說明裡的 **`promptbox.db` / `promptbox.db.plain.bak` 改為 `vault.db` / `vault.db.plain.bak`** | 凍結清單 A-4 已註明「這兩個名字已經公開寫在官網的安裝說明裡」                                                                                                                | **與 v3.7.2 出貨同步**，早了會說謊、晚了也會         |
| **W2** | 使用者的 **IDE 設定範例**若官網有列，`mcpServers.PromptBox` → `mcpServers.vault`                  | FR-5                                                                                                                                                                         | 同上                                                 |
| **W3** | 定價頁規格對照表**確認有沒有列「強型別」**                                                        | Free 的邊界不只四項數字配額，還有布林能力 `strongTyping: false`（`limits.cjs:26-28`，硬性 false 無開關）。ADR-008 §7 那列只寫了「45 卡 / 3 機密卡 / 5 串聯卡 / 2 MCP Token」 | 隨時可做。權威來源是 `Doc/BRD/BRD-03` §2，不是本文件 |
| **W4** | [身分字串凍結清單](身分字串凍結清單.md) 的 §A 空格**不必再填**，改為指向 v3.7.2 PRD               | 清單的執行版本已在 App repo 立案                                                                                                                                             | 隨時                                                 |
| **W5** | [App 事實依據](App事實依據.md) §三「B5 護欄只釘住兩個身分字串」**已過期**                         | v3.7.2 出貨後護欄涵蓋 12 條以上                                                                                                                                              | **v3.7.2 出貨後**再改，現在改會提前說謊              |

> 📌 **關於 W5 的一個修正**：App 事實依據 §三 的判斷「只有一半有護欄保護」**完全正確**，
> 但它低估了一階——**不只是「沒有測試保護」，而是那個值當時根本不是一個可被保護的東西**
> （userData 路徑是 `getName()` 的推導結果，不是任何地方的字串，**無法對它寫斷言**）。
> 所以補護欄是兩個動作：先讓它變成字面值，才能釘。這也是 v3.7.2 存在的理由。

---

## 三、身分字串現值查核表

清單 §A 每一格的答案。走 §B 不必逐項抄現值，但要知道**哪些是寫死的、哪些是推導的**：

| 項目                                 | 現值                                                                                                 | 出處                                                                                                                               | 是否為字面值                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **A-1** `appId`                      | `com.promptbox.app`                                                                                  | `package.json` `build.appId`                                                                                                       | ✅ 有護欄                                   |
| **A-2** `productName` / `name`       | `PromptBox` / `promptbox`                                                                            | `package.json`                                                                                                                     | ✅ 有護欄                                   |
| **A-2** userData 路徑                | **無此字串，完全由 `getName()` 推導**                                                                | 讀取點：`electron/db.cjs:36`、`electron/main.cjs:209`、`electron/services/keyService.cjs:34,77`                                    | 🔴 **全域無 `app.setPath` / `app.setName`** |
| **A-3** 金鑰儲存實作                 | **`safeStorage` + 自管檔 `userData/keystore.bin`**（混合式，非清單假設的二選一）                     | `electron/services/keyService.cjs:17,34-55`                                                                                        | ⚠️ 見 3.1                                   |
| **A-4** 加密 DB 檔名                 | `promptbox.db`                                                                                       | 🔴 **四份推導**：`electron/db.cjs:37`、`electron/main.cjs:212`、`scripts/check-db.cjs:11`、`scripts/migrate-sync-variables.cjs:55` | 🔴 見 3.2                                   |
| **A-4** v2 明文備份                  | `promptbox.db.plain.bak`（由 `dbPath + '.plain.bak'` 組出）                                          | `electron/db.cjs:47`，文案另一份於 `main.cjs:266`                                                                                  | 🔴 非獨立常數                               |
| **A-5** MCP server name              | `PromptBox`                                                                                          | `electron/mcpServer.cjs:286`                                                                                                       | 字面值                                      |
| **A-5** IDE 設定鍵名                 | `mcpServers.PromptBox`，橫跨 9 種 IDE 模板                                                           | `src/config/ideConfigs.js`                                                                                                         | 字面值 ×13 處                               |
| **A-5** 固定 port                    | **沒有固定 port**。`findAvailablePort()` 動態探測，選定值存 `settings.mcp_port`                      | `electron/portDetector.cjs`、`electron/tokenStore.cjs:110,116`                                                                     | 不適用                                      |
| **A-5** Token 儲存位置               | SQLCipher DB 的 `mcp_tokens` 表（id/name/token/scope）。舊鍵 `settings.mcp_token` 已一次性遷移並刪除 | `electron/tokenStore.cjs:26-38`                                                                                                    | 隨 DB 走                                    |
| **A-6** protocol handler / deep link | **不存在**（全域無 `setAsDefaultProtocolClient`）                                                    | —                                                                                                                                  | 不適用                                      |
| **A-6** 更新機制殘留                 | **零殘留**，且 7 條護欄擋回加                                                                        | `electron/__tests__/no-outbound.test.js`                                                                                           | ✅                                          |
| **（清單漏列）**                     | **MCP resource URI scheme `promptbox://`**                                                           | `electron/mcpServer.cjs:311`                                                                                                       | 見 3.3                                      |

> 📌 **A-6 補充**：`package.json` 有 `build.publish`（provider `github`、owner `tsa206531`、repo `PromptBox`）。
> 它是 **electron-builder 的發佈設定，不是 runtime 的更新檢查**，不違反 A5。
> 但它決定 Release 資產的 URL 形狀，與金流接縫 §9 第 4 項（F10 / Q15「下載檔案放哪」）是同一個問題的兩端。

### 3.1　🔴 A-3 的敘述要修正：不是二選一，而且兩個 OS 風險不同

清單 A-3 要你「先確認你用的是哪一種：`safeStorage` **或** `keytar`／自寫」。
實際是 **`safeStorage` 外面包了一個自管檔案**，所以身分依賴有**兩層**，而且兩個平台不對稱：

| 層                               | 依賴什麼                                       | Windows                                     | macOS |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------- | ----- |
| **檔案層**：`keystore.bin`       | userData 路徑（← `productName`）               | 🔴 中                                       | 🔴 中 |
| **金鑰層**：`safeStorage` 主金鑰 | macOS Keychain 項目 `{getName()} Safe Storage` | ✅ **不中**（DPAPI 綁使用者帳戶，不綁名字） | 🔴 中 |

因此清單那句「A-2 的路徑寫死**不一定**擋得住 A-3」——**macOS 上成立，Windows 上不成立**。

**結論**：現階段（只有 Windows build）唯一實際存在的風險是 userData 路徑。
`app.setName()` 是為 macOS 預留的，v3.7.2 會寫，但**要等 mac build 才驗得了**——
🔴 **在那之前，任何文件都不得宣稱 macOS 這條已驗過。**

### 3.2　🔴 A-4 比清單假設的更糟：四份推導，其中兩份是壞的

`scripts/check-db.cjs:11` 與 `scripts/migrate-sync-variables.cjs:55` 各自寫死：

```js
path.join(app.getPath('appData'), 'promptbox', 'promptbox.db')
                                   ^^^^^^^^^ 小寫
```

真實 userData 是 `appData/PromptBox`。**Windows 檔名不分大小寫所以現在沒爆，
換到 macOS 會直接找不到檔案。** 這是一個已經存在的潛伏 bug，v3.7.2 FR-3 順手修掉。

### 3.3　🔴 清單漏了一格：MCP resource URI scheme

`electron/mcpServer.cjs:311` 用 `promptbox://folders/{name}` 當 MCP resource URI。

清單 A-6 問的是「protocol handler / deep link scheme」——**App 確實沒有那個**
（全域無 `setAsDefaultProtocolClient`，OS 層未註冊），所以那一格答「不存在」是對的。
但這個 URI scheme 是 **AI 端看得到的識別**，清單沒有這一格。

等級屬「可救」（AI client 重新 list 一次即可），但**現在改成本是零**，
之後改要動使用者的 IDE 與 E2E 四處斷言。已納入 v3.7.2 FR-5。

> 📌 **`vault` 剛好解掉了清單 A-5 預期的客服量**：它是個真實英文字，
> `mcpServers: { vault: {...} }` 在使用者的設定檔裡完全讀得通。
> 所以 MCP 識別**不必為了可讀性而沿用品牌名**，也就不會在改名時需要請使用者重設一次。

---

## 四、⏸ 暫緩區：等會員區 + Polar 串好再談

以下每條都已查核完，結論記在這裡；**現在不需要任何動作**。

| #       | 題目                                                       | App 側查核結論                                                                                                                                                                                                                                                                               | 為什麼現在不答                                                           |
| ------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Q12** | 憑證交付外觀（純字串 / `.promptbox-license` / `.license`） | App **沒有 protocol handler、沒有任何檔案關聯**（A-6）；`settings` KV 表現成可用（`electron/db.cjs:111`），`electron/services/prefsStore.cjs` 是可照抄的範本。**技術上偏向純字串，但不急著定**                                                                                               | 要先看 Polar 實際發什麼形狀的購買憑證                                    |
| **X1**  | ADR-008 §7 說接縫是 `isPro()` / `isEntitled()`             | 🔴 **這兩個函式不存在。** 實際接縫是 `electron/platform/limits.cjs`（`getTier` / `getLimits` / `getFeatures`），且已為 Pro 備好：檔頭寫明「以 optional require 探測只存在於該 build 的模組，`quota.cjs` 與五個攔截點一行都不用改」，「無上限」已定死為 `null` 並禁止 `Infinity` / `-1` / `0` | 實作那天再對齊即可，但**動工前必須先看這條**，否則會去找兩個不存在的東西 |
| **X2**  | 乾淨 build 護欄會不會擋住 Ed25519 驗簽                     | ✅ **已解除。** 原本擔心的是「Pro 驗簽碼進同一棵樹 → `data-continuity.test.js:57-88` 的禁字掃描變紅」。**Pro / Free 是兩個不同軟體**（創辦人 2026-08-31），Pro 的驗簽碼不在這棵樹裡，護欄維持全綠且語意正確                                                                                  | 已無問題，僅存查                                                         |
| —       | 金流接縫 §9 前置 #1（NQ1）                                 | ✅ **已吸收進 v3.7.2**，不再是獨立前置。但性質變了：見 §1.4——共用身分已非結構保證，Pro codebase 建立時要複製 `identity.cjs` 與護欄                                                                                                                                                           | 已併入主線                                                               |
| —       | 金流接縫 §9 小修正                                         | 表格寫「`ADR-000 B5` 的五行護欄測試」，實際是 **5 個 `it()`、89 行**。不影響結論                                                                                                                                                                                                             | 順手記                                                                   |

> 📌 **憑證儲存的一條結論可以先記著**（實作時省一輪討論）：憑證存在 DB 裡，
> 即使遇到 C2 邊界②（`safeStorage` 不可用 → 明文開庫，`electron/db.cjs:67-70`），
> **安全性也不受影響**——憑證是簽章聲明，使用者讀得到改得動，但改了就驗不過。
> 這是「不用 Keychain」最強的一條理由，ADR-008 §六 目前沒寫。

---

## 五、📋 文件狀態收尾（未做，等憑證排期時一起）

`Doc/Future plans/PRD_Entitlement_Licensing.md` **沒有被刪除**
（ADR-008 前言寫「已刪除」），而且 `Doc/Future plans/FP00_索引與方向狀態.md` 第 41 列
仍標「✅ 現行 ｜ 要實作 entitlement 接縫、Ed25519 離線驗章、升級頁」。

**風險**：現在照 FP00 去實作的人，會做出一個帶 `updatesUntil` 的憑證——
那正是 ADR-008 §三 花整節禁止的東西。

建議改法：

| 位置                   | 改成                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| PRD 檔頭「方向有效性」 | ✅ 現行 → ⚠️ **部分過期**；並移除「無已知失效章節」這六個字                                                                 |
| PRD 檔頭新增註記       | §6.1 / §6.2 / §6.3 / §6.5 已由 ADR-008 取代；§4.2 / §4.3 數字已變；其餘（§5.1 / §5.2 / §6.4 / §7 / §8）仍有效               |
| FP00 第 41 列          | 狀態同步改；末欄改為「要實作 entitlement 接縫、升級頁。🔴 **Ed25519 離線驗章的規格已移至 ADR-008，本檔 §6.1 / §6.2 勿用**」 |

> ⚠️ **「Ed25519 離線驗章」這個詞要留在索引裡，不要刪。**
> ADR-008 沒有推翻 Ed25519，也沒有推翻離線驗章——它 §一 定的就是 Ed25519 的 compact JWS，
> §四 定的就是離線驗簽流程。被取代的是 token 結構與儲存位置等**規格內容**，不是演算法或機制。
> 刪掉那個詞，下一個人在 FP00 搜「Ed25519」會什麼都搜不到，**比現在更糟**。
> 索引的工作是「讓人搜得到，並在踩進去之前攔一次」，不是把詞藏起來。

另外：**ADR-008 目前不在 App repo 的 ADR 體系裡**（`Doc/ADR/` 只有 000–007）。
它 §三 / §四 / §六 規範的全是 App main process 的行為。等憑證真的要做的時候，
應正式立案為 App repo 的 ADR-008 並在 `ADR-000` 索引補一列，
`Doc/appsync/` 這份改為指路存根——**正本在哪要有唯一答案**。

---

## 六、查核指令

在 App repo 子專案目錄 `PromptBox/` 內執行：

```bash
# §三 身分字串現值
grep -rn "getPath('userData')\|setPath\|setName" electron/
grep -rn "promptbox" electron/ scripts/
grep -rn "promptbox://" electron/
grep -rn "setAsDefaultProtocolClient" electron/    # 預期：無輸出

# 護欄現況
cat electron/__tests__/data-continuity.test.js

# §四 X1 接縫實況
cat electron/platform/limits.cjs

# 全部護欄是否仍綠
npm test
npm run test:e2e
```

`Doc/` 側：`Doc/ADR/ADR-000_索引與技術原則.md`（A5 / B5 / C2 / D1 與 §6 的 2026-08-31 條目）、
`Doc/PRD/v3.7.2_PRD_IdentityFreeze.md`、
`Doc/Future plans/FP00_索引與方向狀態.md` 第 41 列、
`Doc/Future plans/PRD_Entitlement_Licensing.md` 檔頭。
