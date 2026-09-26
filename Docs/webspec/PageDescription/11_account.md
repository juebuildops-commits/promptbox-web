# 頁面分析：會員專區（/account）

> **來源**：`Src/app/pages/account.vue`、`Src/i18n/locales/{zh-TW,en,ja}/account.json`、`Src/app/composables/useMemberLogin.ts`、`Src/shared/downloads.ts`
> **最後查核**：2026-09-15（修正：語系檔少一層 `account` 導致整頁顯示原始 key、`ssr: false` 被重複的 `routeRules` 蓋掉、四句不成立的主張）

---

## 一、頁面類型定義

* **推論分類**：會員應用專區（User Dashboard / Account Portal）兼授權憑證展示節點。
* **技術性質**：純 SPA 客戶端渲染 —— `nuxt.config.ts` 的 `routeRules` 對 `/account`、`/en/account`、`/ja/account` 各設 `ssr: false`（規則比對實際路徑，三個語系要各寫一條）。登入狀態只存在瀏覽器，預繪出來的 HTML 必然是「未登入」。
* **條件式狀態**：會員登入是否可用由 `useMemberLogin().available` 判斷（`SUPABASE_URL` 未設定時 nuxt.config 退回佔位網址，判斷的是「是不是佔位值」）。
* **主要目的**：為登入使用者提供帳號資料與方案狀態，並提供與公開下載頁同一批安裝檔的 `/dl` 轉址下載。Q12 方案 A 的授權碼字串框**位置已保留**，金流開通前只顯示空狀態。

---

## 二、核心內容映射

| 區塊 | 內容元素 | 意圖與主張 |
| :--- | :--- | :--- |
| **Hero 橫幅** | 標籤「會員中心」、標題「個人帳號專區」、副標題「查看你的方案狀態，取得官方安裝檔」 | 界定個人專屬空間。🔴 2026-09-15 拿掉「管理授權憑證」—— 現在沒有任何憑證可管理 |
| **登入未開放提示** | `.notice-warning` 警告框「會員登入尚未開放」＋「下方安裝檔與公開下載頁同一批、不需登入」（`available` 為 false 時呈現） | 安全降級。🔴 原文案是寫給開發者看的「未設定 SUPABASE_URL 環境變數」，而正式環境留空時訪客看到的就是這句 |
| **個人基本資料** | Google 帳號頭像（無頭像時為內嵌 SVG 人形）、名稱、Email、「Google 已連結」徽章、登入/登出按鈕 | 呈現 Google OAuth 連動狀態。登入後回到**目前語系**的 `/account` |
| ~~**早鳥席次標章**~~ | 🔴 **2026-09-15 移除** | 原實作是「登入即顯示『早鳥 150 名席次保留／你的信箱已符合早鳥登記名單』」，沒有比對任何名單 ⇒ 對每一個登入者宣稱他在前 150 名裡。FR-27B 要求比對 Buttondown 名單才點亮，**比對做好之前不顯示任何資格**（另：原文案把 `$19` 寫死在語系檔，違反紅線 1） |
| **方案與授權憑證** | 當前方案（Free）、「查看 Pro 方案」按鈕、授權碼空狀態「目前沒有授權碼／金流尚未開通，Pro 目前還不能購買」 | 🔴 **2026-09-15 移除範例 JWS 與複製鈕**：原本顯示一串 `…sample_signature_preview` 並附說明「可直接複製並於桌面端設定頁貼上離線啟用」＝請使用者拿假憑證去啟用 App。按鈕原為「升級至 Pro」，但 Pro 買不了，改為「查看 Pro 方案」（與 App 撞上限 Modal 同一用語） |
| **下載面板** | Windows（.exe／.zip）＋ macOS（.dmg）**三張卡片、三欄**（~~2026-09-18～09-27 為兩張兩欄：macOS 那張隨 mac 暫停拿掉~~ → **2026-09-27 隨 v3.10.0 的 dmg 加回**，見 [WL-006](../../Wishlist/006.WL_mac暫停下載與Windows換新版.md) §2-3），徽章為版號與體積、下方為檔名；說明「與公開下載頁是同一批官方檔案，不需要登入也能下載」＋ 核對校驗碼的連結 | 指向 `/dl/[platform]`。🔴 不稱「會員專屬」—— 沒有閘門。版號／體積／檔名取自 `shared/downloads.ts`，本頁不另寫 |

---

## 三、連結拓樸分析

* **入站連結**：
  * 全站 `AppHeader.vue` 右側「會員專區」按鈕（桌機與行動選單）。🔴 **條件式（2026-09-15 創辦人裁示「先藏起來」）**：只在會員登入可用時出現。
  * ⚠️ 入口藏起來 ⇒ crawlLinks 爬不到本頁 ⇒ `nuxt.config.ts` 的 `nitro.prerender.routes` 明列 `/account`、`/en/account`、`/ja/account`（與 `/enterprise` 同一個坑）。登入開放、入口出現之後那三行也不要刪，會員登入隨時可能被關回去。
  * 下載頁的會員引導小卡（**條件式**：只在會員登入可用時出現）。
  * ⇒ 會員登入未開放期間，**全站沒有任何連到本頁的入口**，只能直接輸入網址。
* **出站連結**：
  * 定價頁 `/pricing`（「查看 Pro 方案」按鈕）。
  * 下載頁 `/download#platforms`（「到下載頁核對 SHA-256 校驗碼」）。
  * 下載代理 `/dl/win`、`/dl/win-zip`、`/dl/mac`（302 重新導向至 Cloudflare R2；`/dl/mac` ~~2026-09-18～09-27 本頁不再連出~~，**2026-09-27 恢復**）。端點本身在 `shared/downloads.ts` 查不到該平台時自動 302 回 `/download`。🔴 `/dl/**` 在 `routeRules` 設 `prerender: false`，否則 crawlLinks 會從本頁爬到它、把 302 預繪成靜態檔，遙測永遠不會執行。

---

## 四、問題解決與意圖解析

1. **打破死鎖**：藉由實體化的會員專區，確立授權碼採「直接複製 compact JWS 字串」而非「密鑰檔案拖曳」，為 App 端的 Electron 設定頁與離線驗證提供具體介面標準。App 端驗簽用的字串樣本在 [測試向量 fixture](../../appsync/fixtures/license-test-vectors.json)（kid `TEST-DO-NOT-SHIP`），**不放在頁面上**。
2. **零金流風險**：此頁面全程不經手信用卡扣款與不可逆 Webhook，做壞了可隨時回滾。
