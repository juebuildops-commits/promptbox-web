# promptbox-web

Nuxt 4 官網。**架構說明在 [README.md](README.md)，不要在這裡複製一份。**

> 這份只放兩種東西：**指路**，和**沒有機器在守的紅線**。
> 其餘一律指過去 —— 正本永遠不要有兩份（見 [文件規則.md §6](Docs/文件規則.md)）。
> **最後查核**：2026-08-30

---

## 進來先走哪條

| 你要做什麼 | 看哪裡 |
| --- | --- |
| 想知道網站怎麼跑 | [README.md](README.md) §四～§六（頁面／渲染／護欄） |
| 要改一處 | [Docs/README.md](Docs/README.md) §二「要動 X，先看 Y，動完回寫 Z」 |
| 要不要開一份新文件 | [Docs/文件規則.md](Docs/文件規則.md) §1 —— **預設是不開** |

---

## 🔴 五條不能踩的

1. **價格只有一個來源**：`Src/app/utils/pricing.ts`。不要在 `.vue` 或語系檔寫死數字，
   語系檔用 `{proEarly}` 這種具名參數引用，改價只改一處。

2. **依據欄填不出來 ⇒ 那句話不能上線。** 新增任何對外主張，先去
   [Docs/webspec/主張與依據.md](Docs/webspec/主張與依據.md) 加一列。
   誠實紅線 C1／C2 是紅線，不是文案風格。

3. **`Docs/refer/` 唯讀 —— 但 `refer/BRD/` 是正本。**
   🔴 **2026-08-30 創辦人確認**：`Docs/refer/BRD/` 六冊就是 **BRD 正本**。
   改配額、價格、Free/Pro 邊界時**以它為準**，不必再回 App repo 取；其餘 `refer/`（APP快照、FP04…）仍是副本。
   兩者共同的規則不變：**裡面的跨 repo 連結不要修**（它們指向 App repo 自己的路徑），
   `check:docs` 已明文豁免整個 `refer/` —— 修它反而會讓文件對不上來源。

4. **身分字串一個字都不要動**：appId、`promptbox.db`、MCP server 名、userData 路徑。
   清單在 [Docs/appsync/身分字串凍結清單.md](Docs/appsync/身分字串凍結清單.md)。
   改了會讓既有使用者的資料變孤兒，而且發出安裝檔之後就回不去。

5. **`download.vue` 的 `href` 與 `sha256` 必須成對更新。**
   校驗碼是印在頁面上的對外承諾，對不上比沒有更糟。

---

## 機器不擋、只能靠人的兩件事

- **改頁面區塊或連結去向** ⇒ 回寫 [Docs/webspec/PageDescription/](Docs/webspec/PageDescription/)
  對應那一頁的 **§2 核心內容映射**、**§3 連結拓樸**，**＋** [主張與依據.md](Docs/webspec/主張與依據.md)，
  **兩份一起**。三支護欄都不檢查這件事。

- **不要為了「先接起來」填假的環境變數**（尤其 `NUXT_PUBLIC_GTAG_ID`）。
  四個變數留空時對應功能會安全停用，文案自動改口 —— 那是刻意設計，不是待辦。

---

## 指令

npm 指令一律在 `Src/` 裡跑，**不在 repo 根**。

```bash
cd Src
npm run dev
npm run build        # check:content → check:i18n → check:docs → nuxt build
npm run check:docs   # 三支護欄也可以單獨跑
```
