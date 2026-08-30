#!/usr/bin/env node
/**
 * 語系檔護欄 —— 階段三，與 `check-content.mjs`（階段二）同一個用途：
 * 把「靜默壞掉」變成「建置失敗」。
 *
 * 它擋三件事：
 *
 *  1. **缺 key** —— `i18n.config.ts` 設了 fallbackLocale，所以缺 key 不會報錯，
 *     只會靜靜地在英文頁面上冒出一句中文。fallback 是安全網，不是工作流程。
 *
 *  2. **參數不對稱** —— 語系檔用 `{proEarly}` 這類具名參數引用 `app/utils/pricing.ts`
 *     的價格常數。翻譯時漏掉一個 `{...}`，那個數字就會**無聲消失**（不是顯示成
 *     字面文字，是整段不見）。逐 key 比對參數集合。
 *
 *  3. **訊息語法** —— vue-i18n 的訊息不是純字串，`{` 與 `@` 都是語法：
 *     - 裸露的 `{{variable}}`（產品核心概念）會被**靜默吃掉**，症狀與階段二
 *       FR-14 的 MDC 綁定一模一樣。要走 `{varToken}` 具名參數。
 *     - 裸露的 `@`（例如 `you@example.com`）會讓建置炸在
 *       "Invalid linked format"，而那句話完全沒提到 `@`。要寫成 `{'@'}`。
 *
 * 用法：
 *   node scripts/check-i18n.mjs          檢查（不通過則離開碼 1）
 *   node scripts/check-i18n.mjs --sync   補上缺的 key（空字串）並清掉改名後的殘留 key
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const LOCALES_DIR = join(ROOT, 'i18n', 'locales')

/** 各語系檔以它為準 */
const REFERENCE = 'zh-TW'

/**
 * 骨架語系：key 必須與 REFERENCE 齊全，但**允許空字串**。
 *
 * 🔴 ja 在這裡，是因為階段三決策 D-16 只上 zh-TW + en。
 *    要出貨日文＝(1) 把 ja/*.json 的空字串填滿
 *              (2) 把 'ja' 從這個集合移除
 *              (3) 在 nuxt.config.ts 的 `i18n.locales` 加一筆 ja
 *    三步缺一，這支腳本會擋下來。
 */
const SKELETON = new Set(['ja'])

const SYNC = process.argv.includes('--sync')

/** 把巢狀物件攤平成 `a.b.c` -> 字串 */
function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out)
    else out[key] = v
  }
  return out
}

/** 依 `a.b.c` 路徑刪值，並把因此變空的父物件一併收掉 */
function deletePath(obj, path) {
  const parts = path.split('.')
  const chain = [obj]
  let cur = obj
  for (const p of parts.slice(0, -1)) {
    if (typeof cur[p] !== 'object' || cur[p] === null) return
    cur = cur[p]
    chain.push(cur)
  }
  delete cur[parts.at(-1)]
  for (let i = chain.length - 1; i > 0; i--) {
    if (Object.keys(chain[i]).length === 0) delete chain[i - 1][parts[i - 1]]
  }
}

/** 依 `a.b.c` 路徑寫值，中途缺的物件自動建出來 */
function setPath(obj, path, value) {
  const parts = path.split('.')
  let cur = obj
  for (const p of parts.slice(0, -1)) {
    if (typeof cur[p] !== 'object' || cur[p] === null) cur[p] = {}
    cur = cur[p]
  }
  cur[parts.at(-1)] = value
}

/** 取出 vue-i18n 的具名參數，例如 `{proEarly}` -> 'proEarly' */
function params(str) {
  if (typeof str !== 'string') return new Set()
  return new Set([...str.matchAll(/\{\s*([A-Za-z][A-Za-z0-9_]*)\s*\}/g)].map(m => m[1]))
}

const files = readdirSync(join(LOCALES_DIR, REFERENCE)).filter(f => f.endsWith('.json'))
const locales = readdirSync(LOCALES_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== REFERENCE)
  .map(d => d.name)

const errors = []
const notes = []
let synced = 0
let pruned = 0

/**
 * 訊息語法檢查：vue-i18n 的訊息不是純字串，`{`、`@`、`|` 都是語法。
 * 這裡把兩個真的踩過的坑固定成錯誤訊息。
 */
function syntaxErrors(locale, file, key, value) {
  if (typeof value !== 'string') return []
  const out = []

  if (value.includes('{{')) {
    out.push(
      `${locale}/${file} → ${key}\n`
      + `      訊息裡有裸露的 "{{" —— vue-i18n 會靜默吃掉它。\n`
      + `      改走具名參數：訊息寫 {varToken}，呼叫端傳 TOKENS（app/utils/pricing.ts）。`,
    )
  }

  // `@` 是 linked message 運算子（@:key / @.lower:key）。email 範例裡的
  // `you@example.com` 會讓 message-compiler 直接丟 "Invalid linked format"，
  // 而那個錯誤訊息完全沒提到 `@`，第一次遇到會找很久。
  // 合法寫法只有兩種：`@:` 開頭的連結，或字面量插值 `{'@'}`。
  const bareAt = value.replace(/\{'@'\}/g, '').replace(/@[.:]/g, '')
  if (bareAt.includes('@')) {
    out.push(
      `${locale}/${file} → ${key}\n`
      + `      訊息裡有裸露的 "@" —— vue-i18n 當它是 linked message 運算子，\n`
      + `      建置會失敗在 "Invalid linked format"（訊息不會提到 @）。\n`
      + `      要輸出字面的 @ 請寫成 {'@'}，例如 you{'@'}example.com。`,
    )
  }

  return out
}

// ── 1. 參考語系自身的訊息語法 ─────────────────────────────────────────
for (const file of files) {
  const flat = flatten(JSON.parse(readFileSync(join(LOCALES_DIR, REFERENCE, file), 'utf8')))
  for (const [key, value] of Object.entries(flat)) {
    errors.push(...syntaxErrors(REFERENCE, file, key, value))
  }
}

// ── 2. 各語系：key 齊全 + 參數對稱 + 出貨語系不得留空 ─────────────────
for (const locale of locales) {
  const isSkeleton = SKELETON.has(locale)

  for (const file of files) {
    const refFlat = flatten(JSON.parse(readFileSync(join(LOCALES_DIR, REFERENCE, file), 'utf8')))
    const targetPath = join(LOCALES_DIR, locale, file)

    let target = {}
    if (existsSync(targetPath)) target = JSON.parse(readFileSync(targetPath, 'utf8'))
    else if (!SYNC) {
      errors.push(`${locale}/${file} 不存在（跑 \`npm run i18n:sync\` 產生骨架）`)
      continue
    }

    const targetFlat = flatten(target)
    let dirty = false

    for (const [key, refValue] of Object.entries(refFlat)) {
      const has = Object.hasOwn(targetFlat, key)

      if (!has) {
        if (SYNC) {
          setPath(target, key, '')
          dirty = true
          synced++
          continue
        }
        errors.push(`${locale}/${file} → 缺 key \`${key}\``)
        continue
      }

      const value = targetFlat[key]

      if (value === '') {
        if (!isSkeleton) errors.push(`${locale}/${file} → \`${key}\` 是空字串（出貨語系不得留空）`)
        continue
      }

      // 參數對稱：漏掉 {proEarly} 這種會讓數字無聲消失
      const refParams = params(refValue)
      const gotParams = params(value)
      const missing = [...refParams].filter(p => !gotParams.has(p))
      const extra = [...gotParams].filter(p => !refParams.has(p))
      if (missing.length || extra.length) {
        errors.push(
          `${locale}/${file} → \`${key}\` 參數不對稱`
          + (missing.length ? `，少了 {${missing.join('} {')}}` : '')
          + (extra.length ? `，多了 {${extra.join('} {')}}` : ''),
        )
      }

      errors.push(...syntaxErrors(locale, file, key, value))
    }

    // 反向：目標語系有、參考語系沒有的 key ＝ 改名後的遺留物。
    // --sync 直接清掉（留著會讓譯者對著一個已經沒人讀的字串工作）。
    for (const key of Object.keys(targetFlat)) {
      if (Object.hasOwn(refFlat, key)) continue
      if (SYNC) {
        deletePath(target, key)
        dirty = true
        pruned++
        continue
      }
      errors.push(`${locale}/${file} → 多出 key \`${key}\`（${REFERENCE} 沒有，可能是改名後的殘留）`)
    }

    if (SYNC && dirty) writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`, 'utf8')
  }

  if (isSkeleton) {
    let total = 0
    let filled = 0
    for (const file of files) {
      const p = join(LOCALES_DIR, locale, file)
      if (!existsSync(p)) continue
      for (const v of Object.values(flatten(JSON.parse(readFileSync(p, 'utf8'))))) {
        total++
        if (v !== '') filled++
      }
    }
    notes.push(`${locale}：骨架語系，${filled}/${total} 已翻譯（未出貨，不影響建置）`)
  }
}

if (SYNC) console.log(`i18n sync：補了 ${synced} 個 key，清掉 ${pruned} 個殘留 key`)

for (const n of notes) console.log(`  · ${n}`)

if (errors.length) {
  console.error(`\n✗ check-i18n：${errors.length} 個問題\n`)
  for (const e of errors) console.error(`  - ${e}`)
  console.error('')
  process.exit(1)
}

console.log(`✓ check-i18n：${files.length} 個檔案 × ${locales.length + 1} 個語系，key 與參數皆對稱`)
