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
 *    解析 User-Agent、IP 國別、Referer 與時間戳，記錄結構化日誌（並預留 Supabase 寫入接縫）。
 * 3. 語意化路由與解耦：
 *    全站與外部連結僅需指向 /dl/win、/dl/win-zip、/dl/mac，
 *    不暴露底層 pub-*.r2.dev 儲存桶網址。日後儲存庫更換或加裝 Pro 閘門（階段六 FR-29），
 *    前端與外部散佈之短網址完全不需變動。
 */
import { defineEventHandler, getRouterParam, getHeader, sendRedirect, setResponseHeader } from 'h3'

/** 支援之平台與 R2 映射目標（與 download.vue 最新版號對齊） */
const DOWNLOAD_TARGETS: Record<string, { url: string; filename: string; os: string }> = {
  'win': {
    url: 'https://pub-c877572083874aada08b285a742dce71.r2.dev/V3.9.4/PromptBox-Setup-3.9.4.exe',
    filename: 'PromptBox-Setup-3.9.4.exe',
    os: 'windows',
  },
  'win-zip': {
    url: 'https://pub-c877572083874aada08b285a742dce71.r2.dev/V3.9.4/PromptBox-3.9.4-win.zip',
    filename: 'PromptBox-3.9.4-win.zip',
    os: 'windows',
  },
  'mac': {
    url: 'https://pub-c877572083874aada08b285a742dce71.r2.dev/V3.9.4/PromptBox-3.9.4-arm64.dmg',
    filename: 'PromptBox-3.9.4-arm64.dmg',
    os: 'macos',
  },
}

export default defineEventHandler(async (event) => {
  const platform = getRouterParam(event, 'platform')?.toLowerCase()
  const target = platform ? DOWNLOAD_TARGETS[platform] : null

  // 不合法平台直接導回公開下載頁
  if (!target) {
    return sendRedirect(event, '/download', 302)
  }

  // 1. 遙測資料萃取
  const userAgent = getHeader(event, 'user-agent') || 'Unknown'
  const country = getHeader(event, 'cf-ipcountry') || getHeader(event, 'x-vercel-ip-country') || 'Unknown'
  const referer = getHeader(event, 'referer') || 'Direct'
  const timestamp = new Date().toISOString()

  // 2. 結構化日誌記錄（伺服器標準輸出，利於 Vercel / LogFlare 收集）
  console.info(JSON.stringify({
    event: 'download_redirect',
    platform,
    filename: target.filename,
    os: target.os,
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
  return sendRedirect(event, target.url, 302)
})
