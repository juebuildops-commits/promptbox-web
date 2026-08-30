#!/usr/bin/env node
/**
 * 護欄：content/ 內不得出現「程式碼以外」的 {{ }}。
 *
 * 為什麼需要這條：
 *   Nuxt Content 的 MDC 支援 `{{ ... }}` 資料綁定語法。寫在段落文字裡的
 *   `{{變數}}`、`{{@prompt:N}}` 會被當成綁定運算式求值，解不出來就**渲染成空字串**
 *   —— 不報錯、不警告，文字就這樣消失了。
 *
 *   而 `{{變數}}` 與 `{{@prompt:N}}` 正好是 PromptBox 的核心概念，
 *   幾乎一定會有人在寫教學或發版說明時把它打進段落裡。
 *
 *   包在行內程式碼 `` `{{變數}}` `` 或 ``` 圍籬區塊內則完全安全，
 *   而那也正是這些 token 在文件裡本來就該有的樣子。
 *
 * 用法：npm run check:content
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..', 'content')

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name)
    return d.isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : []
  })
}

/** 把圍籬區塊與行內程式碼換成等長空白，保留行號與欄位 */
function blankOutCode(src) {
  return src
    .replace(/```[\s\S]*?```/g, m => m.replace(/[^\n]/g, ' '))
    .replace(/`[^`\n]*`/g, m => ' '.repeat(m.length))
}

const offences = []
for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, 'utf8')
  blankOutCode(src).split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/\{\{[^}]*\}\}/g)) {
      offences.push({ file: path.relative(ROOT, file), line: i + 1, token: m[0] })
    }
  })
}

if (offences.length) {
  console.error('\n✗ content/ 內有未包在程式碼中的 {{ }}，MDC 會把它們渲染成空字串：\n')
  for (const o of offences) console.error(`    ${o.file}:${o.line}  ${o.token}`)
  console.error('\n  修法：包成行內程式碼 `' + offences[0].token + '`，或放進 ``` 圍籬區塊。\n')
  process.exit(1)
}

console.log(`✔ content/ 乾淨（掃描 ${walk(ROOT).length} 個檔案，無裸露的 {{ }}）`)
