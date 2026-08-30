/**
 * 🔴 對外已公開的承諾（見 docs/待討論問題.md §六）＝規格。
 *
 * 這些數字散落在 index / pricing 兩頁的卡片、促銷區與 FAQ，共 20 餘處。
 * 階段三把它們收斂成這一份常數，語系檔一律以 `{proEarly}` 這類具名參數引用，
 * 因此**改價只改這裡**，中英兩份文案自動同步。
 *
 * `scripts/check-i18n.mjs` 會逐 key 比對各語系的參數集合，
 * 翻譯時漏掉 `{...}` 會讓建置失敗，而不是靜默掉一個數字。
 */
export const PRICES = {
  /** 早鳥首購與續訂鎖定價（USD / 年） */
  proEarly: 19,
  /** 標準首購價（USD） */
  proStandard: 39,
  /** 標準續訂價（USD / 年） */
  proRenewStandard: 27,
  /** 連買 2 年送 1 年的一次付款金額（USD） */
  proTwoYear: 46,
  /** 永久更新權一次買斷（USD） */
  lifetime: 109,
  /** 商業授權（USD / 人 / 年） */
  commercial: 69,
  /** 商業授權買 4 送 1 的一次付款金額（USD / 年） */
  commercialBundleTotal: 276,
  /** 商業授權買 4 送 1 實得席次 */
  commercialBundleSeats: 5,
  /** 早鳥名額 */
  earlyBirdSeats: 150,
  /** 首購含更新權月數 */
  updateMonths: 12,
  /** 連買 2 年送 1 年實得更新權月數 */
  bundleMonths: 36,
} as const

/** Free 版配額（v3.4.0 五個攔截點，見 App repo README） */
export const FREE_QUOTA = {
  cards: 45,
  secretCards: 3,
  chainCards: 5,
  mcpTokens: 2,
} as const

/**
 * 🔴 產品核心概念 `{{variable}}` 的字面值。
 *
 * 它不能直接寫進語系檔 —— vue-i18n 會把 `{` 當成參數插值的開頭，
 * 而且**不會報錯**，只會靜默吃掉（與階段二 FR-14 的 MDC 綁定是完全同一種坑）。
 * 改以具名參數 `{varToken}` 傳入，語系檔裡就沒有裸露的大括號可以被吃。
 */
export const VAR_TOKEN = '{{variable}}'

/** 丟給 `$t(key, TOKENS)` 的參數包 —— 語系檔的具名參數全部來自這裡 */
export const TOKENS = { ...PRICES, ...FREE_QUOTA, varToken: VAR_TOKEN }
