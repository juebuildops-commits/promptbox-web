/**
 * 🔴 安裝檔下載目標的**唯一來源** —— 下載頁、會員專區、`/dl/[platform]` 轉址端點共用。
 *
 * 2026-09-15 從 `download.vue` 搬出來：5a+ 之後同一組網址一度寫在三個地方
 * （下載頁、`server/routes/dl/[platform].get.ts`、`account.vue` 的版號與大小徽章），
 * 而 `check:release` 只看得到下載頁那一份。放在 `shared/` 是因為 server route 引用不到 `.vue`。
 *
 * F10 / Q15 已解 —— 安裝檔由 Cloudflare R2 發佈（上線前置鏈 P1）。
 *
 * 為什麼不放 `public/`：安裝檔各自超過 100 MB，而 GitHub 硬擋單檔 >100 MiB、
 * Vercel Hobby 的來源檔上限同樣是 100 MB ⇒ 放進 repo 會讓整條部署路線不通。
 * R2 的 egress 免費，這是「發安裝檔」唯一重要的成本項。
 *
 * 🔴 公開下載頁不經過登入是 D16（所有下載一律需登入）的**暫時例外**，為了讓比賽曝光期有東西可下載。
 *
 * 🔴 `href` 與 `sha256` **必須成對更新** —— 校驗碼是印在頁面上的對外承諾
 *    （`download.checksum.*`），對不上比沒有更糟。
 *    2026-09-10（v3.9.2）起，每一組都是**整顆下載回來實算 SHA-256** 與下面的常數比對過的；
 *    現行這組是 2026-09-18（v3.10.0 win）：由 Claude 整顆下載 R2 上的檔案實算，並與 App repo 的建置產物交叉比對；
 *    `mac` 是 2026-09-27 加回的，同樣整顆下載實算 —— 但 **App repo 的 `dist_electron/` 裡沒有 dmg**（mac build 不在這台機器上做），
 *    交叉比對改用 R2 的 ETag：下載檔的 MD5 ＝ `98658eaf…02da7` ＝ R2 回的 ETag ⇒ 證明實算的是「使用者真的會拿到的那個位元組序列」。
 *    ⏳ **三組都尚待創辦人自己實算比對**（WL-006）。
 *    ⚠️ 不要退回只比 ETag：ETag 是 MD5，與頁面上印的 SHA-256 是**兩種雜湊**，
 *    ETag 相符證明得了「線上檔案 = 本機產物」，證明不了「印出去的校驗碼是對的」。
 *
 * 🔴 檔名與路徑**推導不出來，只能照建置產物逐字抄**：
 *    R2 路徑自 v3.9.2 起多一層版本資料夾（`/V3.9.2/`），而檔案的命名規則還不一致
 *    （`PromptBox-Setup-3.9.2.exe` 對 `PromptBox-3.9.2-win.zip`；v3.7.1 時的 zip 又叫 `promptbox-v3.7.1.zip`；
 *    v3.10.0 的 exe 變成**含空白**的 `PromptBox Setup 3.10.0.exe` —— App 沒設 `nsis.artifactName`，網址裡要寫 `%20`）。
 *    ⇒ ⛔ 不要為了「乾淨」用 `DOWNLOAD_VERSION` 組字串 —— 那會讓下一個人只改版號、而 `sha256` 停在舊值，
 *    正是這條紅線要擋的事。`DOWNLOAD_VERSION` 只給畫面顯示，`check:release` 會檢查三個 `href` 都含這個版號。
 *
 * 🔴 `pub-*.r2.dev` 是 Cloudflare 的公用開發網址，官方不建議正式環境長期依賴。
 *    網域到位後（前置鏈 P6）改綁自訂網域，一樣只動這個檔案。
 *    `check:release` 會擋下 `app/`、`server/` 裡任何其他地方出現的 `r2.dev`。
 */
const R2 = 'https://pub-c877572083874aada08b285a742dce71.r2.dev'

export interface DownloadTarget {
  href: string
  size: string
  sha256: string
}

/** 目前發佈的版號（不含 `v`）。只用於顯示，不得拿來組 `href`。 */
export const DOWNLOAD_VERSION = '3.10.0'

/**
 * 鍵名就是 `/dl/[platform]` 的路徑參數。
 *
 * 📌 `mac` 2026-09-18 因為 v3.10.0 沒有 mac build 而暫停，**2026-09-27 隨 v3.10.0 的 dmg 加回**（WL-006 §2-3）。
 *    加回時同一批動的還有：`check-release.mjs` 的 `DOWNLOAD_PLATFORMS`、`account.vue` 的下載卡、
 *    `download.vue` 的 `MAC_DMG`／`MAC_READY`／校驗碼列，以及**最低需求 macOS 12 → 13**（見下）。
 *
 * 🔴 **最低需求是 macOS 13 (Ventura)，不是 12。** 取自這顆 dmg 自己的
 *    `PromptBox.app/Contents/Info.plist`：`LSMinimumSystemVersion = 13.0`（2026-09-27 解開檔案讀出來的）。
 *    成因是 App 用 Electron 44，而 Electron 44 起不支援 macOS 12（App 側回覆 3 §二 W7）。
 *    ⚠️ App 的 `package.json` **沒有設 `build.mac.minimumSystemVersion`**（W8 未做）⇒ 這個值是 Electron 的預設值，
 *    會**隨 Electron 大版無聲改變**，而 `check:release` 只看版號、不看系統需求。升級 Electron 後要重讀 Info.plist。
 */
export const DOWNLOADS = {
  'win': {
    href: `${R2}/V3.10.0/PromptBox%20Setup%203.10.0.exe`,
    size: '134.6 MB',
    sha256: 'cf0e80a59240500d241855062e5814c9bb6fc0cfcf488dca681c1f60fc9939d4',
  },
  'win-zip': {
    href: `${R2}/V3.10.0/PromptBox-3.10.0-win.zip`,
    size: '178.4 MB',
    sha256: 'fabfc2e7d53647e016dbc5c0a4b3614c51c37cfdbc66c44ebd70207539f1a269',
  },
  'mac': {
    href: `${R2}/V3.10.0/PromptBox-3.10.0-arm64.dmg`,
    size: '154.8 MB',
    sha256: '7a3549b568d948915240683bf98387c1ee079138520d7bc97c5480909e3bfcf3',
  },
} as const satisfies Record<string, DownloadTarget>

export type DownloadPlatform = keyof typeof DOWNLOADS

/**
 * 檔名取自 `href` 的最後一段，不另外手寫一份。
 * 要解碼：網址裡的 `%20` 在使用者硬碟上是空白（v3.10.0 起 exe 檔名含空白），
 * 印在校驗指令裡的必須是**真正的檔名**，否則照抄會找不到檔案。
 */
export const downloadFilename = (target: DownloadTarget) =>
  decodeURIComponent(target.href.slice(target.href.lastIndexOf('/') + 1))
