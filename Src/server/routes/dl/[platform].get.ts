/**
 * FR-27C —— 下載代理與基礎遙測端點（/dl/[platform]）
 *
 * 規範依據：Docs/webplan/PRD_階段五_會員與帳號中心.md §1 FR-27C & §3.3
 *
 * 設計原則：
 * 1. 嚴格 302 Redirect：
 *    PromptBox 安裝檔單檔高達 120MB+，絕對禁止在 Vercel Serverless Function
 *    進行檔案串流代理（Stream Proxy），避免超時與吃滿每月頻寬限制。
 *    流量 100% 由 Cloudflare R2 邊緣 CDN 承擔。
 * 2. 基礎遙測紀錄：
 *    記錄平台、User-Agent、國別、Referer 與時間戳的結構化日誌（**不含 IP**）。
 *    🔴 欄位與隱私頁 `privacy.processors.vercelData` 的描述一一對應 —— 加欄位（尤其是 IP）要同時改隱私頁與主張與依據。
 * 3. 語意化路由與解耦：
 *    連結只需指向 /dl/win、/dl/win-zip、/dl/mac，不暴露底層 R2 儲存桶的公用網址。
 *    日後儲存庫更換或加裝 Pro 閘門（階段六 FR-29），外部散佈的網址完全不需變動。
 * 4. 🔴 這條路由在 nuxt.config.ts 的 routeRules 設了 `prerender: false`。拿掉它，
 *    crawlLinks 會把 302 預繪成靜態檔，本檔從此不會被執行。
 *
 * 轉址目標來自 shared/downloads.ts（與下載頁共用的唯一來源），本檔不另寫網址。
 */
import { defineEventHandler, getRouterParam, getHeader, sendRedirect, setResponseHeader } from 'h3'
import { DOWNLOADS, DOWNLOAD_VERSION, downloadFilename, type DownloadPlatform } from '#shared/downloads'

const isPlatform = (p: string | undefined): p is DownloadPlatform => !!p && Object.hasOwn(DOWNLOADS, p)

export default defineEventHandler(async (event) => {
  const platform = getRouterParam(event, 'platform')?.toLowerCase()

  // 不合法平台直接導回公開下載頁
  if (!isPlatform(platform)) {
    return sendRedirect(event, '/download', 302)
  }
  const target = DOWNLOADS[platform]

  // 1. 遙測資料萃取
  const userAgent = getHeader(event, 'user-agent') || 'Unknown'
  const country = getHeader(event, 'cf-ipcountry') || getHeader(event, 'x-vercel-ip-country') || 'Unknown'
  const referer = getHeader(event, 'referer') || 'Direct'
  const timestamp = new Date().toISOString()

  // 2. 結構化日誌記錄（伺服器標準輸出，利於 Vercel / LogFlare 收集）
  console.info(JSON.stringify({
    event: 'download_redirect',
    platform,
    version: DOWNLOAD_VERSION,
    filename: downloadFilename(target),
    os: platform === 'mac' ? 'macos' : 'windows',
    country,
    referer,
    userAgent,
    timestamp,
  }))

  // 3. 禁止快取 302，避免瀏覽器快取導致後續下載跳過遙測計數
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  setResponseHeader(event, 'Pragma', 'no-cache')
  setResponseHeader(event, 'Expires', '0')

  // 4. 立即回傳 302 導向 R2 目標
  return sendRedirect(event, target.href, 302)
})
