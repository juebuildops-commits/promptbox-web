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
 *    現行這組是 2026-09-12（v3.9.4），由創辦人實算比對。
 *    ⚠️ 不要退回只比 ETag：ETag 是 MD5，與頁面上印的 SHA-256 是**兩種雜湊**，
 *    ETag 相符證明得了「線上檔案 = 本機產物」，證明不了「印出去的校驗碼是對的」。
 *
 * 🔴 檔名與路徑**推導不出來，只能照建置產物逐字抄**：
 *    R2 路徑自 v3.9.2 起多一層版本資料夾（`/V3.9.2/`），而檔案的命名規則還不一致
 *    （`PromptBox-Setup-3.9.2.exe` 對 `PromptBox-3.9.2-win.zip`；v3.7.1 時的 zip 又叫 `promptbox-v3.7.1.zip`）。
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
export const DOWNLOAD_VERSION = '3.9.4'

/** 鍵名就是 `/dl/[platform]` 的路徑參數。 */
export const DOWNLOADS = {
  'win': {
    href: `${R2}/V3.9.4/PromptBox-Setup-3.9.4.exe`,
    size: '116.6 MB',
    sha256: 'beaf83fd32b8520c8ea5f5017730d23e5f34f6453d473d22355a6f99c096b2b1',
  },
  'win-zip': {
    href: `${R2}/V3.9.4/PromptBox-3.9.4-win.zip`,
    size: '160.7 MB',
    sha256: 'a12ba94ff8499672c42671bfcde2aaa5b0dac87113bf8849a1dfd86fe2d23ede',
  },
  'mac': {
    href: `${R2}/V3.9.4/PromptBox-3.9.4-arm64.dmg`,
    size: '126.8 MB',
    sha256: '04a44b63095d05c1052c1934089f83b5e04feba04f97875fcb554c62d7aa1a86',
  },
} as const satisfies Record<string, DownloadTarget>

export type DownloadPlatform = keyof typeof DOWNLOADS

/** 檔名取自 `href` 的最後一段，不另外手寫一份。 */
export const downloadFilename = (target: DownloadTarget) => target.href.slice(target.href.lastIndexOf('/') + 1)
