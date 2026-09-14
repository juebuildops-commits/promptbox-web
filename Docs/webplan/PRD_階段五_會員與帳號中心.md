# PRD — 階段五：會員體系與帳號中心（5a+ 先行啟動）

> **狀態**：🟡 **進行中（先行啟動 5a+）**
> **建立日期**：2026-09-14（自原《階段五六 PRD》拆分並強化 5a+ 範疇）
> **前置**：[階段三 PRD](./PRD_階段三_i18n與訂閱.md)（已完成）、[ADR-008](../appsync/ADR-008_授權憑證格式與離線驗證契約.md)
> **接續**：[階段六 PRD](./PRD_階段六_金流與授權發放.md)（暫緩，等 5a+ 交付、改名定案與 App 雙 build）
> **對應決策**：D6（Supabase）、D7（Google OAuth）、D16/D17（帳號頁與下載連結）、D25（早鳥資格）

---

## 0. 為什麼拆分階段五並先行啟動 5a+

原先規劃將「會員登入」與「金流簽發」混在同一份 PRD，導致整包因「改名未定案」與「等 App 雙 build」而被標記為暫緩，進而引發跨 repo 的互等死鎖（[SYNC-000 §三](../appsync/SYNC-000_索引與雙方進度.md#33-接起來之後浮出的兩件事)）：
* 官網等 App 做雙 build
* App 等官網把會員區做完以確定授權碼外觀（Q12）

### 5a+ 先行啟動的三大優勢：
1. **打破死鎖**：官網率先把真實的會員專區與授權碼展示框做出來，App 側便有明確的 UI 參考去實作設定頁與離線驗簽，不再互等。
2. **完全可逆、零金流風險**：不碰 Polar、不經手信用卡、不簽發不可撤銷的付費憑證。即便操作失誤或架構重構，代價極低。
3. **繞過改名障礙**：會員中心是內部系統，產品更名對本階段而言僅為前端 i18n 文案置換，不影響底層 Schema 與 OAuth 整合。

---

## 1. 5a+ 範圍內（In Scope）

### FR-25A　Supabase 整合與 Schema 基礎
* 引入 `@nuxtjs/supabase` 模組。
* 資料庫建立 `profiles` 表（對應 Supabase `auth.users`），記錄使用者基本資料（`id`, `email`, `created_at`, `locale`）。
* 設定 Row Level Security (RLS)，確保使用者僅能讀寫自己的個人資料。

### FR-26　Google OAuth 登入／登出流程
* 採用 Supabase Auth 的 Google OAuth 提供者（D7，不引入 Clerk）。
* 支援繁中（zh-TW）、英文（en）、日文（ja）多語系導向與狀態維持。
* 全站 `AppHeader` 整合：
  * 未登入：顯示「登入 / 註冊」按鈕。
  * 已登入：顯示使用者頭像與下拉選單（包含「帳號中心」、「登出」）。

### FR-27　會員專區頁面 (`/account`)
* **個人資訊**：顯示 Google 帳號 Email、頭像、註冊日期與語系設定。
* **Free 版快速下載區**：登入後直接提供 Windows / macOS (Apple Silicon) 最新版安裝檔下載連結與 SHA-256 校驗碼。
* **Pro 授權碼卡片預留槽（Mock / Empty State）**：
  * 預設顯示方案狀態：「目前方案：免費版（Free）」。
  * 預留「我的授權碼」文字複製展示框（依據 Q12 方案 A，不使用檔案形式，直接展示 compact JWS 字串外觀與「一鍵複製」按鈕）。
  * 附帶「升級 Pro」導向定價頁、或「兌換授權碼」輸入框 UI 骨架。

### FR-27B　早鳥資格自動綁定識別
* 若登入的 Google Email 存在於先前 Buttondown 預購/訂閱名單中，帳號頁直接點亮 **「早鳥資格已保留（首批 150 名永久鎖價 $19）」** 專屬徽章（落實 D25）。
* 此功能給予早鳥登記者實質的反饋感，大幅增加註冊率。

### FR-27C　下載代理與基礎遙測端點（`/dl/[platform]`）
* **語意化端點**：實作 Nitro 伺服器路由（`/dl/win`、`/dl/win-zip`、`/dl/mac`），前端全站下載連結改指向該端點，不再直接暴露 `pub-*.r2.dev` 原始儲存桶網址。
* **嚴格 302 轉址（防頻寬耗盡）**：端點僅處理日誌紀錄與轉址，回傳 `302 Found` 導向 Cloudflare R2，**嚴禁在 Vercel 伺服器端串流代理 126MB+ 安裝檔**，確保大檔流量 100% 由 R2 CDN 承擔。
* **遙測數據蒐集**：解析請求之 `User-Agent`（OS 版本、架構）、`CF-IPCountry`（國別）、來源 `Referer` 與時間戳，寫入 Supabase `download_telemetry` 表或非同步紀錄，為曝光期掌握真實下載轉換率。
* **階段六對接基石**：本端點為階段六「Pro 下載閘門」的前置基盤，階段六只需在同端點加入授權憑證檢查即可平滑升級。

### FR-30　Ed25519 跨端簽驗測試向量備妥
* 原 PRD §0 所述之不受改名影響的關鍵前置：
  1. 產生 Ed25519 測試金鑰對。
  2. 產出標準 `(payload, 私鑰, 預期 JWS)` 測試向量 fixture。
* 在官網 repo 落檔保存，並提供給 App 端作為單元測試依據，讓 App 端能即刻驗收其離線驗證演算法。

---

## 2. 範圍外（Out of Scope，留待階段六）

* ❌ **Polar 金流串接與商品建立**（移至階段六）。
* ❌ **Polar Webhook 簽發端點**（`/api/webhook/polar`，移至階段六）。
* ❌ **正式不可撤銷之 Ed25519 憑證簽發**（移至階段六）。
* ❌ **強制作業：全站 Free 下載一律必須登入（D16 例外維持）**：
  * 理由：如原 PRD 警示，若強迫 Free 版也要登入，Supabase Auth 會成為整站單點故障。
  * 策略：公開下載頁（`/download`）維持免登入直接下載；`/account` 頁面則提供登入使用者的專案儀表板與下載連結。

---

## 3. 架構細節與前端踩雷防範

### 3.1 SSG 與 Auth 的 Hydration 衝突防範
* **現象**：官網目前全站預繪（SSG）。若 `/account` 頁面進行預繪，伺服器輸出的 HTML 為未登入骨架，用戶端讀取 Cookie/Session 後重新渲染，會產生 Hydration Mismatch 或畫面閃爍。
* **解法**：在 `nuxt.config.ts` 中設置：
  ```typescript
  routeRules: {
    '/account': { ssr: false } // 會員中心走純 SPA 客戶端渲染
  }
  ```
  未登入者直接在客戶端由路由守衛導向登入頁或首頁。

### 3.2 Google OAuth Redirect URI 配置
* 開發與測試階段支援：
  * `http://localhost:3000/confirm`
  * `https://*.supabase.co/auth/v1/callback`
  * Vercel Preview 部署網址（於 Supabase Auth URL Configuration 中以萬用字元或環境變數對應）。

### 3.3 大檔下載代理之 302 轉址 vs 串流防爆
* 安裝檔體積超過 120MB，Vercel Serverless Function 執行超時與每月頻寬額度有限。
* 代理端點必須僅作為 **Metadata 收集器 + 302 導向器**，不經手位元組流（Zero-byte Stream Proxying），回應須帶 `Cache-Control: no-cache` 避免瀏覽器快取 302 導致遙測計數失真。

---

## 4. 驗收標準（AC）

| # | 驗收條件 |
| :--- | :--- |
| **AC-5A-1** | 訪客可透過 Google OAuth 成功登入，並能正確於各語系登出 |
| **AC-5A-2** | 登入後訪問 `/account` 頁面，能正確顯示 Google 帳號 Email 與頭像 |
| **AC-5A-3** | 會員頁面能直接下載最新版 Free 安裝檔，且 SHA-256 校驗碼正確 |
| **AC-5A-4** | 會員頁面呈現明確的 Pro 授權碼卡片預留槽（Q12 方案 A，一鍵複製 UI 骨架） |
| **AC-5A-5** | 若登入信箱符合早鳥名單，頁面能正確點亮「早鳥 150 名保留」徽章 |
| **AC-5A-6** | 產出並落檔 Ed25519 跨端簽驗測試向量 fixture，App 端可直接引用進行測試 |
| **AC-5A-7** | 訪問 `/dl/:platform` 能正確 302 轉址至 R2 對應檔案，並記錄基本遙測數據 |
