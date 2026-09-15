/**
 * 會員登入（Supabase Auth，階段五 5a+）是否真的接上了一個 Supabase 專案。
 *
 * 🔴 不能用「url 是不是空字串」判斷：`@nuxtjs/supabase` 缺 url 時會在**每一頁**建立 client 時丟錯，
 *    所以 `nuxt.config.ts` 在 `SUPABASE_URL` 未設定時退回 `https://placeholder.supabase.co`。
 *    ⇒ 判斷的是「是不是那個佔位值」。改佔位值時兩處一起改。
 *
 * 和 `useAnalyticsConsent` 的 `available` 同一個用途：留空時對應功能安全停用、文案跟著改口
 * （會員專區顯示「尚未開放」、下載頁不出現會員卡、隱私頁不描述一個不存在的帳號系統）。
 */
const PLACEHOLDER_HOST = 'placeholder.supabase.co'

export function useMemberLogin() {
  const url = useRuntimeConfig().public.supabase?.url ?? ''
  const available = computed(() => !!url && !url.includes(PLACEHOLDER_HOST))
  return { available }
}
