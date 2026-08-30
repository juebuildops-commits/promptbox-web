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
 */
import { defineEventHandler, readBody, createError, setResponseStatus } from 'h3'

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

export type SubscribeResult = {
  status: 'ok' | 'already' | 'invalid' | 'blocked' | 'disabled' | 'error'
}

export default defineEventHandler(async (event): Promise<SubscribeResult> => {
  const body = await readBody<{ email?: string, kind?: string, company?: string }>(event)

  // 蜜罐：真人看不到這個欄位，填了就是機器人。
  // 回 ok 而不是錯誤 —— 讓機器人以為成功了，別再重試。
  if (body?.company) return { status: 'ok' }

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

    // 已在名單上：Buttondown 回 400 + code `email_already_exists`。
    // 比對關鍵字而非固定碼 —— 訊息形態隨版本而異（2026-08-30 實測確認命中）。
    const text = await res.text()
    if (res.status === 400 && /already|exists|duplicate/i.test(text)) {
      return { status: 'already' }
    }

    // 🔴 Buttondown 的防火牆擋下這個地址（2026-08-30 實測撞到）：
    //    `400 subscriber_blocked` / "This subscriber was blocked by your firewall."
    //    **含 `+` 的別名信箱是常見原因** —— 而別名正是注重隱私的使用者的習慣，
    //    也就是這個產品的客群，所以這條路徑不罕見。
    //
    //    這一格不能掉進下面的 502：封鎖是**永久的**，而 502 對應的文案是
    //    「請稍後再試一次」—— 那句話是假的，再試一百次結果都一樣。
    //    誠實紅線 C1（不得暗示超出實際的結果）。
    if (res.status === 400 && /subscriber_blocked|blocked by your firewall/i.test(text)) {
      setResponseStatus(event, 422)
      return { status: 'blocked' }
    }

    console.error('[subscribe] Buttondown', res.status, text.slice(0, 300))
    throw createError({ statusCode: 502, statusMessage: 'upstream_error' })
  }
  catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err
    console.error('[subscribe] fetch failed', err)
    setResponseStatus(event, 502)
    return { status: 'error' }
  }
})
