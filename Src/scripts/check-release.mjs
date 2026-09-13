#!/usr/bin/env node
/**
 * 護欄：發版版本一致性檢查（check-release.mjs）
 *
 * 為什麼需要這條：
 *   歷史事故（缺口 7、9）：
 *   - 日誌已更新，但下載頁忘記更新（曾落差 5 個版本）。
 *   - 日誌與下載頁只改了繁體中文，en / ja 漏改。
 *   - 程式碼宣稱了新版本，但 download.vue 連結尚未指向該版二進位檔案。
 *
 * 檢核目標：
 *   自動推導 content/changelog/*.md 最新版號，並確保以下 3 處 100% 對齊：
 *   1. i18n download.json (zh-TW, en, ja) 的 meta.description 與 hero.badge
 *   2. i18n changelog.json (zh-TW, en, ja) 的 meta.description 與 cta.body
 *   3. download.vue 的 WIN_EXE.href 與 WIN_ZIP.href
 *
 * 用法：node scripts/check-release.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const SRC_ROOT = path.resolve(import.meta.dirname, '..')
const CHANGELOG_DIR = path.join(SRC_ROOT, 'content', 'changelog')
const LOCALES_DIR = path.join(SRC_ROOT, 'i18n', 'locales')
const DOWNLOAD_VUE = path.join(SRC_ROOT, 'app', 'pages', 'download.vue')

const LOCALES = ['zh-TW', 'en', 'ja']

/** 簡易解析 Markdown Frontmatter */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const yaml = match[1]
  const data = {}
  for (const line of yaml.split('\n')) {
    const idx = line.indexOf(':')
    if (idx !== -1) {
      const key = line.slice(0, idx).trim()
      let val = line.slice(idx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      } else if (val === 'true') val = true
      else if (val === 'false') val = false
      data[key] = val
    }
  }
  return data
}

/** 嚴格比照 changelog.vue 的 SemVer 數字拆解與排序邏輯 */
const versionParts = (v) => (String(v).match(/\d+/g) ?? []).map(Number)
const byVersionDesc = (a, b) => {
  const [pa, pb] = [versionParts(a), versionParts(b)]
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pb[i] ?? 0) - (pa[i] ?? 0)
    if (d !== 0) return d
  }
  return 0
}

// 1. 取得所有 Changelog 檔案並計算最新版本
const files = fs.readdirSync(CHANGELOG_DIR).filter((f) => f.endsWith('.md'))
const entries = []

for (const file of files) {
  const raw = fs.readFileSync(path.join(CHANGELOG_DIR, file), 'utf8')
  const fm = parseFrontmatter(raw)
  if (fm.version && fm.date && !fm.legacy && !fm.draft) {
    entries.push({
      file,
      version: String(fm.version).trim(),
      date: String(fm.date).trim(),
    })
  }
}

if (entries.length === 0) {
  console.error('✗ 未找到有效的 changelog 項目。')
  process.exit(1)
}

entries.sort((x, y) => y.date.localeCompare(x.date) || byVersionDesc(x.version, y.version))
const latest = entries[0]
const latestVersion = latest.version.startsWith('v') ? latest.version : `v${latest.version}`
const rawVersion = latestVersion.replace(/^v/i, '')

console.log(`\n🔍 check:release —— 偵測到最新發布日誌：${latestVersion} (${latest.date}，來自 ${latest.file})`)

const offences = []

// 2. 檢核 download.json (zh-TW, en, ja)
for (const loc of LOCALES) {
  const p = path.join(LOCALES_DIR, loc, 'download.json')
  if (!fs.existsSync(p)) {
    offences.push({ file: p, reason: '檔案不存在' })
    continue
  }
  const json = JSON.parse(fs.readFileSync(p, 'utf8'))
  const badge = json.download?.hero?.badge ?? ''
  const desc = json.download?.meta?.description ?? ''

  if (!badge.includes(latestVersion) && !badge.includes(rawVersion)) {
    offences.push({
      file: `i18n/locales/${loc}/download.json`,
      field: 'download.hero.badge',
      expected: latestVersion,
      actual: badge,
    })
  }
  if (!desc.includes(latestVersion) && !desc.includes(rawVersion)) {
    offences.push({
      file: `i18n/locales/${loc}/download.json`,
      field: 'download.meta.description',
      expected: latestVersion,
      actual: desc,
    })
  }
}

// 3. 檢核 changelog.json (zh-TW, en, ja)
for (const loc of LOCALES) {
  const p = path.join(LOCALES_DIR, loc, 'changelog.json')
  if (!fs.existsSync(p)) {
    offences.push({ file: p, reason: '檔案不存在' })
    continue
  }
  const json = JSON.parse(fs.readFileSync(p, 'utf8'))
  const body = json.changelog?.cta?.body ?? ''
  const desc = json.changelog?.meta?.description ?? ''

  if (!body.includes(latestVersion) && !body.includes(rawVersion)) {
    offences.push({
      file: `i18n/locales/${loc}/changelog.json`,
      field: 'changelog.cta.body',
      expected: latestVersion,
      actual: body,
    })
  }
  if (!desc.includes(latestVersion) && !desc.includes(rawVersion)) {
    offences.push({
      file: `i18n/locales/${loc}/changelog.json`,
      field: 'changelog.meta.description',
      expected: latestVersion,
      actual: desc,
    })
  }
}

// 4. 檢核 download.vue 內的 WIN_EXE 與 WIN_ZIP 下載路徑
if (!fs.existsSync(DOWNLOAD_VUE)) {
  offences.push({ file: 'app/pages/download.vue', reason: '檔案不存在' })
} else {
  const vueContent = fs.readFileSync(DOWNLOAD_VUE, 'utf8')
  // 檢查是否有包含版號的路徑或檔名，例：/V3.9.4/ 或 -3.9.4.exe 或 -3.9.4-win.zip
  const hasExeVersion = vueContent.includes(`PromptBox-Setup-${rawVersion}.exe`) || vueContent.includes(`/V${rawVersion}/`) || vueContent.includes(`/v${rawVersion}/`)
  const hasZipVersion = vueContent.includes(`PromptBox-${rawVersion}-win.zip`) || vueContent.includes(`promptbox-v${rawVersion}.zip`) || vueContent.includes(`/V${rawVersion}/`) || vueContent.includes(`/v${rawVersion}/`)

  if (!hasExeVersion) {
    offences.push({
      file: 'app/pages/download.vue',
      field: 'WIN_EXE.href',
      expected: `含 ${rawVersion} 或 /V${rawVersion}/`,
      actual: '未偵測到相應路徑',
    })
  }
  if (!hasZipVersion) {
    offences.push({
      file: 'app/pages/download.vue',
      field: 'WIN_ZIP.href',
      expected: `含 ${rawVersion} 或 /V${rawVersion}/`,
      actual: '未偵測到相應路徑',
    })
  }
}

// 5. 輸出成果或阻擋
if (offences.length > 0) {
  console.error(`\n✗ 發版版本一致性檢查失敗！最新日誌為 [${latestVersion}]，但以下檔案未同步：\n`)
  for (const o of offences) {
    if (o.reason) {
      console.error(`  - ${o.file}：${o.reason}`)
    } else {
      console.error(`  - ${o.file} ➔ [${o.field}]`)
      console.error(`      預期包含: "${o.expected}"`)
      console.error(`      目前內容: "${o.actual}"`)
    }
  }
  console.error('\n修法請參閱：Docs/發版與Changelog作業指引.md §1「發版必改 5 處一站式檔案清單」\n')
  process.exit(1)
}

console.log(`✔ check:release —— 全站最新版號一致：${latestVersion}`)
console.log(`  - 3 語系 download.json 已同步`)
console.log(`  - 3 語系 changelog.json 已同步`)
console.log(`  - download.vue 下載連結已指向 ${latestVersion}\n`)
