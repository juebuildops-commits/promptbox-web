# App 側回覆 3（Notice from the App Repo, #3）

> **這份文件解決的問題**：App 將在 v3.10.0 把 Electron 從 40 升到 44。
> 這件事**改變了 macOS 版的最低系統需求**，而官網首頁寫著「macOS 版即將推出」——
> **如果官網任何地方列出（或打算列出）系統需求，數字要跟 App 一致。**
>
> **回覆對象**：無（App 側主動通知，不回覆任何一份文件）
>
> **查核日**：2026-09-16（W7／W8）　·　**2026-09-18 追加 W9**（v3.10.0 出貨驗收時實測到的事實更正）
> **查核基準**：App repo `main` @ `2bea8dd`（v3.9.4）→ W9 的基準是 v3.10.0 出貨版
>
> 🔴 **本檔是跨 repo 通知，不是實作規格，也不是狀態看板。**
> 每一項做到哪，看 [SYNC-000](SYNC-000_索引與雙方進度.md) —— **這份寫完就凍結，不再修改。**
> 📌 **W9 是在「凍結」之前補上的**：本檔自 2026-09-16 寫成後**尚未送達官網 repo**，
> 還沒有人依它做事 ⇒ 補一條比另開第四份通知更不容易漏。**送出之後就不再改。**
>
> 📌 **App 程式碼與文件路徑一律寫成純文字不做連結**（在官網 repo 點不開）。起點是 App repo 子專案目錄 `PromptBox/`。

---

## 〇、一句話

**macOS 版出來時，最低需求是 macOS 13 (Ventura)，不是 12、更不是 README 寫的 10.15。**
Windows 維持 Windows 10 以上，但**只有 64 位元**。

---

## 一、三項交辦

| # | 動作 | 為什麼 | 觸發條件 |
| --- | --- | --- | --- |
| **W7** | 官網若在任何地方列出**系統需求**（下載頁、FAQ、「macOS 版即將推出」附近），寫成：<br>**Windows 10 以上（64 位元）／macOS 13 (Ventura) 以上**。<br>**沒有列就不必新增。** | 見 §二 | **隨時**（現在寫就是對的） |
| **W8** | 在 [SYNC-000 §3.2](SYNC-000_索引與雙方進度.md)「**macOS 的一切**」那一列（同一格裡已有 `app.setName` 驗證）補一項：<br>「**最低系統版本**（`build.mac.minimumSystemVersion`；以發 build 當時的 Electron 大版重查，2026-09 為 macOS 13）」 | 這是發 mac build 前**必須決定**、而且**發出去之後使用者會直接撞到**的一個值。它跟 `app.setName` 同性質：現在不做沒事，漏做會在 mac 首發當天出事 | **隨時** |
| **W9** 🔴 | [身分字串凍結清單 A-3](身分字串凍結清單.md) 的表格裡「金鑰層 `safeStorage` 主金鑰 → Windows ✅ **不中**（DPAPI 綁使用者帳戶，不綁名字）」**要加一句限定**：<br>「⚠️ **不綁名字是對的，但它不是只綁帳戶**——實測（2026-09-18）`keystore.bin` 還依賴 **同一個 userData 目錄裡的 `Local State`**。只帶走 `keystore.bin`（即使同機器、同帳戶）**解不開**。」 | 見 §三 | **隨時**（這是事實更正，不是決策） |

### ⚠️ W7 的寫法建議：不要把數字寫死在多處

**這個數字會隨 App 升級而上升**（Chromium 大約每年停止支援一個 macOS 大版，App 依 ADR-010 跟著走）。
建議官網**只在一個地方**寫系統需求，其他地方引用那一處。否則下次升級時會出現「下載頁說 13、FAQ 說 12」。

---

## 二、為什麼是這兩個數字

| 事實 | 出處 |
| --- | --- |
| Electron 40（App 目前用的）**已於 2026-06-30 停止支援** | Electron 官方發版時程 releases.electronjs.org/schedule |
| **Electron 38 起不支援 macOS 11**，**Electron 44 起不支援 macOS 12** | Electron 官方 Breaking Changes |
| **Electron 44 起不再提供 Windows 32 位元版本** | 同上 |
| App v3.10.0 目標版本是 **Electron 44**（支援至 2027-03-02） | App repo `Doc/PRD/v3.10.0_PRD_ElectronSupportWindow.md` |
| **決策：App 不為了支援較舊的作業系統而停在過期的 Electron** | App repo `Doc/ADR/ADR-010_Electron只跑官方支援窗內的版本.md`（2026-09-16 採用） |

**為什麼接受排除 macOS 12 以下的使用者**（完整理由在 ADR-010）：
PromptBox 的使用者是 AI IDE 的使用者，而主流 AI IDE 本身也建立在 Electron／Chromium 上、跟著同樣的下限走——
**IDE 跑不動的 Mac，PromptBox 也派不上用場。**

> 📌 **這不是商業決策**，是技術推導出來的下限（BRD 沒有定義支援平台）。
> 若官網認為這會影響受眾定位、需要在 BRD 正本記一筆，**那是官網側的判斷**，App 側不在副本裡替你決定。

---

## 三、W9 的依據：`keystore.bin` 不是只綁 Windows 帳戶

**量法**（v3.10.0 FR-6 探針，2026-09-18，Windows 10／Electron 44.4.1）：
同一台機器、同一個 Windows 帳戶，把**真實的 `keystore.bin`**（2026-09-03 由 Electron 40 時代的版本寫入）
複製到一個乾淨的 userData 目錄——**只帶它，不帶 `Local State`**——再呼叫 `safeStorage.decryptString`。

| 帶了什麼 | 結果 |
| --- | --- |
| 整個 userData（含 `Local State`） | ✅ 解得開 |
| **只有 `keystore.bin`** | 🔴 **❌ `Error while decrypting the ciphertext provided to safeStorage.decryptString.`** |

**為什麼**：Windows 上 `safeStorage` 走 Chromium 的 OSCrypt。DPAPI 保護的不是資料本身，
而是一把存在 **userData/`Local State`** 裡的金鑰；那把金鑰才用來加解密 `keystore.bin`。
⇒ 解密需要**兩樣同時在場**：①同一個 Windows 帳戶（DPAPI）②**那個 userData 的 `Local State`**。

🔴 **對外文案的實務後果**（官網若寫任何備份／移轉說明，這一條會直接影響）：
**「備份 `vault.db` + `keystore.bin`」是打不開的**——而那是最容易犯、看起來也最合理的一種備份方式。
**要講就要講「整個 userData 目錄」。**

⚠️ **換機（另一台機器／另一個帳戶）仍未驗** —— DPAPI 那一層本次沒測，維持 App repo `Doc/Wishlist/054` 的既有待辦。

## 四、順帶一件：本機副本的 SYNC-000 G1 看起來過期了

App repo 的 SYNC-000 副本（最後同步日 2026-09-01）§4.2 **G1** 仍寫
「`app.setName()` 最終值未拍板（`Vault` vs `EYChen Vault`）—— 🔴 未決」。

**App 側的事實**：已於 **2026-09-02** 由創辦人定案為 **`Vault`**，並隨 v3.7.2 出貨
（App repo `Doc/Tech Design/v3.7.2_TD_IdentityFreeze.md` 驗收表「`app.setName()` 值的最終確認」一列）。

**若正本那一份已經更新，忽略本節即可。**
⚠️ 不論 G1 怎麼寫，「`app.setName` **實際效果**要等 mac build 才驗得到」**仍然成立**——W8 要加的那一格就放在它旁邊。

---

## 五、App 側自己的待辦（不歸官網，記在這裡是為了讓你看得到）

| # | 事項 | 觸發條件 |
| --- | --- | --- |
| 1 | App README 的「Windows 10/11 或 macOS 10.15+」「Node.js 18+」更正 | v3.10.0 FR-5 |
| 2 | 加一條**會在 Electron 停止支援日變紅**的檢查，避免同一件事再發生 | v3.10.0 FR-4 |
| 3 | 發第一個 mac build 前的 App 側清單（重查下限、設 `minimumSystemVersion`、原生模組另驗） | 已列在 ADR-010 附註 |

---

## 六、查核指令

在 App repo 子專案目錄 `PromptBox/` 內執行：

```bash
# App 目前的 Electron 版本（v3.10.0 出貨前應為 40.x，出貨後應為 44.x）
node -e "console.log(require('./node_modules/electron/package.json').version)"

# README 的系統需求（v3.10.0 出貨前是舊的）
grep -n "macOS" ../README.md

# 目前沒有 mac build 設定（預期查無 "mac"）
grep -n '"mac"' package.json
```

`Doc/` 側的對應位置：
`Doc/ADR/ADR-010_Electron只跑官方支援窗內的版本.md`（§決策 3 平台下限表、附註「第一個 mac build 之前」）、
`Doc/ADR/ADR-000_索引與技術原則.md` §6 的 2026-09-16 條目、
`Doc/PRD/v3.10.0_PRD_ElectronSupportWindow.md`。
