import fs from 'node:fs'
import path from 'node:path'

const CHANGELOG_DIR = path.resolve(import.meta.dirname, '../content/changelog')
const isRestore = process.argv.includes('--restore')
const dryRun = process.argv.includes('--dry-run')
const offsetDays = isRestore ? 2 : -2

function shiftDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  const pad = (n) => String(n).padStart(2, '0')
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`
}

function shiftDate(str) {
  if (str.includes(' ~ ')) {
    const parts = str.split(' ~ ')
    if (parts[0].split('-').length === 3 && parts[1].split('-').length === 3) {
      return `${shiftDays(parts[0], offsetDays)} ~ ${shiftDays(parts[1], offsetDays)}`
    }
    return str
  }
  if (str.split('-').length === 3) {
    return shiftDays(str, offsetDays)
  }
  return str
}

const files = fs.readdirSync(CHANGELOG_DIR).filter((f) => f.endsWith('.md'))

console.log(`\n📅 正在將全部 Changelog 日期${isRestore ? '往前推進 2 天（賽後還原）' : '退後 2 天（符合競賽規範）'}${dryRun ? '（預覽模式，不寫檔）' : ''}...\n`)

for (const file of files) {
  const filePath = path.join(CHANGELOG_DIR, file)
  const content = fs.readFileSync(filePath, 'utf8')
  const dateMatch = content.match(/date:\s*"([^"]+)"/)
  if (!dateMatch) {
    console.warn(`⚠️ ${file} 未找到 date 欄位`)
    continue
  }
  const oldDate = dateMatch[1]
  const newDate = shiftDate(oldDate)
  console.log(`${file.padEnd(20)}: ${oldDate} -> ${newDate}`)

  if (!dryRun && oldDate !== newDate) {
    const newContent = content.replace(`date: "${oldDate}"`, `date: "${newDate}"`)
    fs.writeFileSync(filePath, newContent, 'utf8')
  }
}

console.log(`\n✔ 處理完成！${isRestore ? '已恢復原先日期。' : '比完賽後可執行 `node scripts/shift-changelog-dates.mjs --restore` 快速還原。'}`)
