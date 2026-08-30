# 日本語ロケール — 骨架（未出貨）

階段三決策 **D-16**：本次只上 `zh-TW` + `en`，日文先留完整骨架。

這個目錄裡的 8 個 JSON **key 與 `zh-TW/` 完全一致，值全為空字串**。
`scripts/check-i18n.mjs` 每次建置都會驗證這件事，所以骨架不會隨著
中文文案演進而過期 —— 新增 key 之後跑一次 `npm run i18n:sync` 就補齊了。

## 要出貨日文，三步

1. 把這裡 8 個檔案的空字串填滿
   - 具名參數 `{proEarly}` / `{cards}` / `{varToken}` **一個都不能少**，
     少了那個數字會無聲消失（check-i18n 會擋下來）
2. `scripts/check-i18n.mjs` 的 `SKELETON` 集合移除 `'ja'`
3. `nuxt.config.ts` 的 `i18n.locales` 加一筆：

   ```ts
   {
     code: 'ja',
     language: 'ja',
     name: '日本語',
     files: ['ja/common.json', 'ja/home.json', /* …其餘 6 個 */],
   }
   ```

三步缺一，建置會失敗並指出缺哪一步。

## 已知的既有債

App 端三語裡 `ja` 有 11 條 key 缺翻譯（見 App repo README）。
官網日文上線前後，兩邊的語氣與術語應該對齊一次。
