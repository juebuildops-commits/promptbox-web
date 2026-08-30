/**
 * F1 / Q14：聯絡信箱是佔位符，且**正掛在線上**（`mailto:test1234@google.com`
 * 指向一個與本專案無關的第三方地址）。
 *
 * 真實信箱尚未提供，因此改由 `NUXT_PUBLIC_CONTACT_EMAIL` 供給：
 *  - 有設定 ⇒ 照舊產生 mailto:
 *  - 未設定 ⇒ **不留死連結**，改導到該頁的訂閱表單。表單是我們目前
 *    唯一真的能收到訊息的管道，比一個寄不到人的 mailto 誠實。
 *
 * 換成真信箱＝在 Vercel 設一個環境變數，不必改任何 .vue。
 */
export function useContact() {
  const email = useRuntimeConfig().public.contactEmail
  const localePath = useLocalePath()

  const hasEmail = computed(() => Boolean(email))

  /**
   * @param subject  mailto 的主旨（有信箱時才用得到）
   * @param fallback 沒有信箱時要導去的站內錨點
   */
  function href(subject: string, fallback: string) {
    if (!email) return localePath(fallback)
    return `mailto:${email}?subject=${encodeURIComponent(subject)}`
  }

  return { email, hasEmail, href }
}
