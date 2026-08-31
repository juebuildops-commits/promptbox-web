/**
 * F4 —— 全站唯一的 email 收集端點。
 *
 * 🔴 這是本站**唯一**的 serverless function，是階段二 AC-15「純靜態」的
 *    刻意破例（PRD 階段三 D-18）。理由只有一個：Buttondown 的 API key
 *    若要留在伺服器端，就必須有一個伺服器端。前端直打 Buttondown 等於
 *    把 key 公開，任何人都能拿它讀取整份訂閱名單。
 *
 * 設計要點：
 *  - **tag 由伺服器決定**。前端只能送一個 kind（updates / early-bird /
 *    commercial），對應表寫死在這裡。放任前端傳 tag ＝ 讓任何人污染名單分群。
 *  - **key 未設定時回 501，不是 500**。網域與寄信服務都還沒開通（Q10-a / D29），
 *    此時表單要能誠實說「還沒開放」，而不是噴一個看起來像壞掉的錯誤。
 *  - **不回傳 Buttondown 的原始錯誤**。那裡面可能夾帶帳號資訊。
 *  - 🔴 **免費方案不支援 tags**（2026-08-30 實測撞到）。撞到 403
 *    feature_disabled 時自動拿掉 tags 重送，分群改由 metadata.kind 承擔 ——
 *    表單不會因為方案限制而整個壞掉，升級 Basic 後也不需要改程式。
 *
 * 🔴 **路線 B：不把訪客 IP 送給 Buttondown**（2026-08-30 創辦人裁示）。
 *    Buttondown 的防火牆會因為「請求來自機房 IP」而擋人（見下方 blocked 分支），
 *    官方建議的解法是把訪客真實 IP 一起送過去讓它評估。**我們刻意不這樣做** ——
 *    那會讓送給第三方的個資範圍從「使用者主動提供的 email」擴大到「IP」，
 *    而隱私頁的第三方處理者矩陣是對外承諾過的
 *    （Docs/webspec/PageDescription/06_privacy.md）。
 *    代價是 Buttondown 端要關掉 IP 檢查，防濫用的責任回到我們身上 ＝ 下面那道限流。
 *    **改動這個決定，隱私頁與主張與依據必須同時改。**
 */
import { defineEventHandler, readBody, createError, setResponseStatus, getRequestIP } from 'h3'

/** 伺服器端的 tag 對應表 —— 前端傳的是 kind，不是 tag */
const TAGS = {
  'updates': ['updates'],
  'early-bird': ['updates', 'early-bird'],
  'commercial': ['commercial-inquiry'],
} as const

type Kind = keyof typeof TAGS

/**
 * 刻意保守的 email 檢查。
 * 真正的驗證是 Buttondown 那端的雙重確認信 —— 這裡只擋明顯的手滑與機器人，
 * 不打算用正則表達式重新實作 RFC 5322。
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * 上游逾時。沒有這個的話 Buttondown 一卡住，serverless function 就一路撐到
 * 平台逾時為止，使用者看到的是通用錯誤而不是「稍後再試」。
 */
const UPSTREAM_TIMEOUT_MS = 10_000

/**
 * 🔴 限流 —— 這道防線是**必要的**，不是加分項。
 *
 * 2026-08-30 我們把 Buttondown 的 IP 檢查與 Attack mode 關掉了（見檔頭路線 B），
 * 那原本是幫我們擋洪水的機制。關掉之後責任回到這裡，而在此之前這支端點
 * **一道限流都沒有**，蜜罐是唯一防線。
 *
 * ⚠️ **誠實說明它的極限**：模組層級的 Map 生命週期跟著 serverless 實例，
 *    而平台會同時跑多個實例、也會隨時回收。所以這是**減速丘，不是牆** ——
 *    它擋得住手滑連點與最粗糙的腳本，擋不住分散式灌注。
 *    真正要擋後者需要外部狀態（KV / Redis），那是階段五會員區有了 Supabase
 *    之後才划算的投資。在那之前，不要因為「有限流了」而放鬆其他防線。
 */
const RATE_LIMIT_WINDOW_MS = 10 * 60_000
const RATE_LIMIT_MAX = 5
/** ip -> 這個視窗內的送出時間戳。只存時間戳，不存 email，也不落地。 */
const recentHits = new Map<string, number[]>()

/**
 * 回 true 代表這次要擋下。
 * 順便清掉過期的 key —— 沒有這一步，Map 會隨著實例存活時間無限長大。
 */
function isRateLimited(ip: string, now: number): boolean {
  const cutoff = now - RATE_LIMIT_WINDOW_MS

  for (const [key, stamps] of recentHits) {
    const alive = stamps.filter(t => t > cutoff)
    if (alive.length) recentHits.set(key, alive)
    else recentHits.delete(key)
  }

  const mine = recentHits.get(ip) ?? []
  if (mine.length >= RATE_LIMIT_MAX) return true

  mine.push(now)
  recentHits.set(ip, mine)
  return false
}

/**
 * 免費方案偵測旗標。第一次撞到 403 feature_disabled 之後就記住，
 * 後續請求直接跳過「帶 tags」那一次嘗試 —— 否則每一筆訂閱都要多打一次 API。
 *
 * 模組層級變數 ⇒ 生命週期跟著 serverless 實例，實例回收就重設。
 * 這正是想要的行為：升級 Basic 之後不必手動清任何快取，
 * 下一個新實例會自己重試一次 tags，成功就永遠走回正常路徑。
 */
let tagsUnavailable = false

/**
 * 送一筆訂閱者到 Buttondown。
 *
 * 🔴 網域是 `api.buttondown.com`，不是 `api.buttondown.email`。
 *    Buttondown 已把 API 網域遷到 .com，官方文件現在只給這個。
 *    舊網域即使還在轉址也不能用：跨來源轉址依規範會**剝掉 Authorization
 *    標頭**，症狀是 401 而不是連不上 —— 看起來會像「key 填錯了」，
 *    實際上是網域錯了。
 */
function postSubscriber(apiKey: string, email: string, kind: Kind, withTags: boolean) {
  return fetch('https://api.buttondown.com/v1/subscribers', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    body: JSON.stringify({
      email_address: email,
      // Buttondown 會寄出雙重確認信；未確認前不算正式訂閱者。
      // 這同時是「不是本人也能把別人加進名單」的防線。
      type: 'unactivated',
      // 🔴 kind 一律寫進 metadata，**不管 tags 有沒有成功**。
      //    metadata 在免費方案可用（2026-08-30 實測），所以它才是
      //    「這個人從哪個表單來」的可靠載體；tags 只是 Basic 方案的加分。
      //    這一格不能掉：commercial 代表商業授權諮詢，**需要真人回信**，
      //    混進一般更新名單就會漏掉。
      metadata: { kind },
      // 後台訂閱者列表直接看得到的人類可讀版本
      notes: `kind=${kind}`,
      ...(withTags ? { tags: TAGS[kind] } : {}),
    }),
  })
}

/**
 * 從 Buttondown 的錯誤 body 裡挑出**可以寫進日誌**的部分。
 *
 * 🔴 刻意不回傳 email。這支端點的日誌會進 Vercel 的伺服器日誌，而隱私頁
 *    對外承諾的第三方處理者矩陣裡，Vercel 那一格寫的是「伺服器日誌層級的
 *    IP 與 User-Agent」—— 把訂閱者的 email 寫進去就超出那句話了。
 *    診斷需要的是**理由**，不是誰。
 */
function diagnosable(text: string): string {
  try {
    const json = JSON.parse(text) as Record<string, unknown>
    return JSON.stringify({
      code: json.code,
      detail: json.detail,
      firewall_reasons: json.firewall_reasons,
    })
  }
  catch {
    return text.slice(0, 300)
  }
}

export type SubscribeResult = {
  status: 'ok' | 'already' | 'invalid' | 'blocked' | 'rateLimited' | 'disabled' | 'error'
}

export default defineEventHandler(async (event): Promise<SubscribeResult> => {
  const body = await readBody<{ email?: string, kind?: string, topic?: string }>(event)

  // 蜜罐：真人看不到這個欄位，填了就是機器人。
  // 回 ok 而不是錯誤 —— 讓機器人以為成功了，別再重試。
  //
  // 🔴 欄位名叫 `topic` 不是 `company`（2026-08-30 改）。瀏覽器與密碼管理器
  //    會自動填 company / organization 這類**語意欄位**，而且普遍無視
  //    autocomplete="off"。被自動填到的真人會走進這一行，看到「訂閱成功」，
  //    名單裡卻什麼都沒有 —— 那是所有失敗模式裡最糟的一種：
  //    跟真的成功長得一模一樣，使用者不會回報，我們也不會知道。
  //    名字換成沒有自動填入語意的字，這條路徑才真的只剩機器人。
  if (body?.topic) return { status: 'ok' }

  // 🔴 限流在 email 驗證**之前** —— 否則洗版者只要送格式錯的地址就能繞過。
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (isRateLimited(ip, Date.now())) {
    setResponseStatus(event, 429)
    return { status: 'rateLimited' }
  }

  const email = (body?.email ?? '').trim().toLowerCase()
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    setResponseStatus(event, 422)
    return { status: 'invalid' }
  }

  const kind = (body?.kind ?? 'updates') as Kind
  if (!Object.hasOwn(TAGS, kind)) {
    setResponseStatus(event, 422)
    return { status: 'invalid' }
  }

  const apiKey = useRuntimeConfig(event).buttondownApiKey
  if (!apiKey) {
    // D29 的寄信服務尚未開通。誠實回報「未啟用」，前端會顯示對應文案。
    setResponseStatus(event, 501)
    return { status: 'disabled' }
  }

  try {
    let res = await postSubscriber(apiKey, email, kind, !tagsUnavailable)

    // 🔴 Buttondown 的**免費方案不支援 tags**，會回 403 feature_disabled
    //    （2026-08-30 實測："Tags require a Basic plan or higher"）。
    //    這不該算失敗 —— 把 tags 拿掉重送一次即可，kind 已經寫在
    //    metadata / notes 裡，分群資訊一個字都不會掉。
    //    日後升級 Basic，第一次嘗試就會成功，這段自動變成沒作用，
    //    **不需要改任何程式**。
    if (!res.ok && res.status === 403) {
      const probe = await res.clone().text()
      if (/feature_disabled|upgrade your account/i.test(probe)) {
        if (!tagsUnavailable) {
          // 每個 serverless 實例只喊一次，不要每筆訂閱都洗版
          console.warn(
            '[subscribe] Buttondown 免費方案不支援 tags，已改用 metadata.kind 分群。'
            + ' 升級 Basic 後 tags 會自動恢復，不需要改程式。',
          )
          tagsUnavailable = true
        }
        res = await postSubscriber(apiKey, email, kind, false)
      }
    }

    if (res.ok) return { status: 'ok' }

    const text = await res.text()

    // 🔴 **防火牆判斷必須排在 already 前面。**
    //    下面那條 already 的比對是關鍵字（`already|exists|duplicate`），刻意寬鬆，
    //    因為訊息形態隨版本而異。但寬鬆的代價是它會誤收 —— 只要任何一種 400 的
    //    body 裡剛好出現 "exists"，就會被說成「你已經在名單上了」，
    //    而那個人其實根本沒進名單。順序放對，這個誤判就不可能發生。
    //
    //    Buttondown 的防火牆擋下時回 `400 subscriber_blocked` /
    //    "This subscriber was blocked by your firewall."（2026-08-30 實測撞到）。
    //
    //    這一格不能掉進下面的 502：502 對應的文案是「請稍後再試一次」，
    //    而防火牆對同一個地址的判斷是確定性的，再試一次多半不會有不同結果。
    //    誠實紅線 C1（不得暗示超出實際的結果）。
    if (res.status === 400 && /subscriber_blocked|blocked by your firewall/i.test(text)) {
      // 🔴 **這行日誌是這個分支存在的理由之一。**
      //    在它之前，被擋的原因（Buttondown 每次都會在 firewall_reasons 裡講清楚）
      //    在 early return 時被整個丟掉，導致 2026-08-30 花了四輪除錯還在猜
      //    —— 猜過「含 + 的別名信箱」、猜過「刪除後被抑制」，兩個都錯，
      //    真正的原因是 `ip_address_datacenter`（請求來自 Vercel 機房 IP）。
      //    證據一直都在回應裡，只是從來沒有被寫下來過。
      console.error('[subscribe] Buttondown firewall', diagnosable(text))
      setResponseStatus(event, 422)
      return { status: 'blocked' }
    }

    // 已在名單上：Buttondown 回 400 + code `email_already_exists`。
    // 比對關鍵字而非固定碼 —— 訊息形態隨版本而異（2026-08-30 實測確認命中）。
    if (res.status === 400 && /already|exists|duplicate/i.test(text)) {
      return { status: 'already' }
    }

    // 🔴 認證與授權失敗（key 失效、被撤銷、方案變動）**不是暫時性的**。
    //    這類錯誤原本掉進下面的 502，前端顯示「請稍後再試一次」—— 又是一句假話，
    //    跟 F17 修掉的是同一種錯，只是換了個分支。改回「功能未啟用」，
    //    那對使用者是真的（服務端設定壞了，他做什麼都沒用），
    //    而 console.error 會讓我們自己知道要去修 key。
    if (res.status === 401 || res.status === 403) {
      console.error(
        '[subscribe] Buttondown 認證/授權失敗，請檢查 NUXT_BUTTONDOWN_API_KEY',
        res.status, diagnosable(text),
      )
      setResponseStatus(event, 501)
      return { status: 'disabled' }
    }

    console.error('[subscribe] Buttondown', res.status, diagnosable(text))
    throw createError({ statusCode: 502, statusMessage: 'upstream_error' })
  }
  catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err
    // AbortSignal.timeout 逾時會走到這裡（DOMException: TimeoutError）。
    // 這一類**是**暫時性的，「請稍後再試」對它成立。
    console.error('[subscribe] fetch failed', err)
    setResponseStatus(event, 502)
    return { status: 'error' }
  }
})
