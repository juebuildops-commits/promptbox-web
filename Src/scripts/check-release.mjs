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
 *   - 2026-09-15：5a+ 之後同一組下載網址一度寫在三個地方（下載頁、/dl 端點、會員專區徽章），
 *     而本護欄只看得到下載頁的 WIN_EXE／WIN_ZIP，連 macOS 那一組都沒檢查。
 *
 * 檢核目標：
 *   自動推導 content/changelog/*.md 最新版號，並確保以下各處 100% 對齊：
 *   1. i18n download.json (zh-TW, en, ja) 的 meta.description 與 hero.badge
 *   2. i18n changelog.json (zh-TW, en, ja) 的 meta.description 與 cta.body
 *   3. shared/downloads.ts（下載目標的唯一來源）：
 *      DOWNLOAD_VERSION ＝ 最新版號；DOWNLOAD_PLATFORMS 每一組的 href 都含該版號；
 *      每個 sha256 都是 64 位十六進位且互不相同（擋「複製一組、忘了換校驗碼」）
 *   4. app/、server/ 裡除了 shared/downloads.ts 之外，不得出現 `r2.dev`（擋網址又被抄成第二份）
 *
 * 🔴 本護欄驗不了「sha256 真的是那個檔案的雜湊」—— 那只能整顆下載回來實算，見 shared/downloads.ts 檔頭。
 *
 * 用法：node scripts/check-release.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const SRC_ROOT = path.resolve(import.meta.dirname, '..')
const CHANGELOG_DIR = path.join(SRC_ROOT, 'content', 'changelog')
const LOCALES_DIR = path.join(SRC_ROOT, 'i18n', 'locales')
const DOWNLOADS_TS = path.join(SRC_ROOT, 'shared', 'downloads.ts')
// 🔴 這份要與 downloads.ts 的 DOWNLOADS 鍵完全一致 —— 少一個，那一組的 href／sha256 就沒有任何護欄在看。
//    ('mac' 2026-09-18～09-27 曾因沒有 mac build 暫時拿掉，v3.10.0 的 dmg 發佈後加回，WL-006 §2-3。)
const DOWNLOAD_PLATFORMS = ['win', 'win-zip', 'mac']
const NO_R2_DIRS = ['app', 'server']

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

// 4. 檢核 shared/downloads.ts（下載目標的唯一來源）
if (!fs.existsSync(DOWNLOADS_TS)) {
  offences.push({ file: 'shared/downloads.ts', reason: '檔案不存在' })
} else {
  const ts = fs.readFileSync(DOWNLOADS_TS, 'utf8')

  const declaredVersion = ts.match(/export const DOWNLOAD_VERSION\s*=\s*'([^']+)'/)?.[1]
  if (declaredVersion !== rawVersion) {
    offences.push({
      file: 'shared/downloads.ts',
      field: 'DOWNLOAD_VERSION',
      expected: rawVersion,
      actual: declaredVersion ?? '未偵測到',
    })
  }

  const seenHashes = new Map()
  for (const platform of DOWNLOAD_PLATFORMS) {
    // 抓 `'win': { href: ..., size: ..., sha256: ... }` 這一段。
    // 結尾要比對「獨佔一行的 }」—— href 裡的 `${R2}` 本身就含一個 }，比對第一個 } 會截在網址中間。
    const block = ts.match(new RegExp(`'${platform}':\\s*\\{([\\s\\S]*?)\\n\\s*\\}`))?.[1]
    if (!block) {
      offences.push({ file: 'shared/downloads.ts', field: `DOWNLOADS['${platform}']`, expected: '存在', actual: '未偵測到' })
      continue
    }
    const href = block.match(/href:\s*[`'"]([^`'"]+)[`'"]/)?.[1] ?? ''
    const sha256 = block.match(/sha256:\s*'([^']*)'/)?.[1] ?? ''

    // 檔名與版本資料夾（`/V3.9.4/`）要各自對上 —— 只看整串含不含版號，
    // 會放過「資料夾換了新版、檔名還是舊版」這種半套更新
    const filename = href.slice(href.lastIndexOf('/') + 1)
    const folderVersion = href.match(/\/[Vv](\d+\.\d+\.\d+)\//)?.[1]
    if (!filename.includes(rawVersion) || (folderVersion && folderVersion !== rawVersion)) {
      offences.push({
        file: 'shared/downloads.ts',
        field: `DOWNLOADS['${platform}'].href`,
        expected: `檔名含 ${rawVersion}，版本資料夾為 /V${rawVersion}/`,
        actual: href || '未偵測到',
      })
    }
    if (!/^[0-9a-f]{64}$/.test(sha256)) {
      offences.push({
        file: 'shared/downloads.ts',
        field: `DOWNLOADS['${platform}'].sha256`,
        expected: '64 位小寫十六進位',
        actual: sha256 || '未偵測到',
      })
    } else if (seenHashes.has(sha256)) {
      offences.push({
        file: 'shared/downloads.ts',
        field: `DOWNLOADS['${platform}'].sha256`,
        expected: `與 '${seenHashes.get(sha256)}' 不同`,
        actual: `${sha256}（兩個不同檔案不可能有同一個 SHA-256，是複製後忘了換）`,
      })
    } else {
      seenHashes.set(sha256, platform)
    }
  }
}

// 5. 下載網址不得在 shared/downloads.ts 以外再寫一份
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name)
  return e.isDirectory() ? walk(p) : [p]
})
for (const dir of NO_R2_DIRS) {
  const abs = path.join(SRC_ROOT, dir)
  if (!fs.existsSync(abs)) continue
  for (const file of walk(abs)) {
    if (!/\.(vue|ts|mjs|js|json)$/.test(file)) continue
    if (fs.readFileSync(file, 'utf8').includes('r2.dev')) {
      offences.push({
        file: path.relative(SRC_ROOT, file).replaceAll('\\', '/'),
        reason: '出現 `r2.dev` 網址 —— 下載目標只能寫在 shared/downloads.ts，這裡請改為引用它',
      })
    }
  }
}

// 6. 輸出成果或阻擋
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
console.log(`  - shared/downloads.ts ${DOWNLOAD_PLATFORMS.length} 組下載目標（${DOWNLOAD_PLATFORMS.join('／')}）已指向 ${latestVersion}，校驗碼格式正確且互不相同`)
console.log(`  - app/、server/ 沒有第二份 R2 網址\n`)
