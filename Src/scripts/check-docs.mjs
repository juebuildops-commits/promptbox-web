#!/usr/bin/env node
/**
 * check:docs —— 文件連結護欄
 *
 * 擋的是「靜默斷鏈」：文件搬家之後，指向它的連結不會噴任何錯，
 * 只是點下去 404。2026-08-29 的 Docs/ 重組一次產生了 107 條這種斷鏈，
 * 其中最嚴重的是 Docs/README.md —— 索引本身 19 條全斷，而它是 AI 的入口。
 *
 * 掃描範圍：repo 內所有 .md 的相對連結（不含 http/mailto/純錨點/站台絕對路徑）。
 *
 * 刻意豁免 Docs/refer/：那裡是 App repo 的副本，它們的內部連結指向
 * App repo 自己的路徑（../ADR/、_archive/、Wishlist/…），在這個 repo 本來就點不開。
 * 那是副本的正常狀態，不是債 —— 修它反而會讓副本與正本對不上。
 * 見 Docs/文件規則.md §6。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const SKIP_DIRS = ["node_modules", ".nuxt", ".output", ".data", ".git"];
// 副本資料夾：內部連結指向正本 repo，不納入檢查
const EXEMPT = ["Docs/refer/"];

const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");

function collect(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (SKIP_DIRS.some((s) => p.includes(s))) continue;
    if (e.isDirectory()) collect(p, out);
    else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

const broken = [];
let checked = 0;

for (const file of collect(ROOT)) {
  const r = rel(file);
  if (EXEMPT.some((x) => r.startsWith(x))) continue;
  const dir = path.dirname(file);
  const text = fs.readFileSync(file, "utf8");

  for (const m of text.matchAll(/\[([^\]]*)\]\(([^)]+)\)/g)) {
    const target = m[2].trim();
    const hashAt = target.indexOf("#");
    const bare = hashAt === -1 ? target : target.slice(0, hashAt);
    // 跳過：外部連結、純錨點、以及網站路由（/download 這種絕對路徑不是檔案）
    if (!bare || /^(https?:|mailto:|\/)/.test(bare)) continue;
    checked++;
    if (!fs.existsSync(path.resolve(dir, decodeURIComponent(bare)))) {
      broken.push({
        file: r,
        line: text.slice(0, m.index).split("\n").length,
        label: m[1],
        target,
      });
    }
  }
}

if (broken.length === 0) {
  console.log(`✅ check:docs —— ${checked} 條文件連結，0 條斷鏈`);
  process.exit(0);
}

console.error(`\n❌ check:docs —— ${checked} 條文件連結中有 ${broken.length} 條斷鏈：\n`);
let last = "";
for (const b of broken) {
  if (b.file !== last) {
    console.error(`  ${b.file}`);
    last = b.file;
  }
  console.error(`    :${b.line}  [${b.label}] -> ${b.target}`);
}
console.error(
  `\n連結指向的檔案不存在。搬過文件的話，把引用它的地方一起改掉；` +
    `\n檔案是刻意刪除的話，把連結拆成純文字（見 Docs/文件規則.md §6）。\n`
);
process.exit(1);
