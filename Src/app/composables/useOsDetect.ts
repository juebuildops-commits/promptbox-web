export type Os = 'win' | 'mac' | 'other'

/**
 * FR-4：作業系統偵測。
 *
 * 靜態預繪時沒有 User-Agent，因此掛載前一律回傳 L2 靜態 HTML 裡的通用文案，
 * 掛載後才細化 —— 這與原 `js/main.js`（parse 完才執行）的行為相同，不是新的退步。
 * 預繪值與掛載前的 client 值一致，故不會產生 hydration mismatch。
 *
 * 階段三：文案改走語系檔。`$t` 是 reactive 的，切語言時這兩個 computed
 * 會跟著重算，不需要額外的 watch。
 */
export function useOsDetect() {
  const { t } = useI18n()
  const os = ref<Os | null>(null)

  onMounted(() => {
    const ua = navigator.userAgent
    if (/Macintosh|Mac OS X/i.test(ua)) os.value = 'mac'
    else if (/Windows/i.test(ua)) os.value = 'win'
    else os.value = 'other'
  })

  const ctaLabel = computed(() => {
    if (os.value === 'mac') return t('common.os.ctaMac')
    if (os.value === 'win') return t('common.os.ctaWin')
    // 'other'（Linux 等）刻意不在這裡分支：本 composable 目前只用於下載頁，
    // 而那裡拿到的實際檔案是 Windows 版，標籤由 download.vue 自行覆寫成 ctaWin。
    // 在這裡放一個「前往下載頁面」之類的通用字串，只會產生一個永遠畫不出來的 key。
    return t('common.os.ctaDefault')
  })

  const osNote = computed(() => {
    if (os.value === 'mac') return t('common.os.noteMac')
    if (os.value === 'win') return t('common.os.noteWin')
    return t('common.os.noteDefault')
  })

  /** 該平台卡是否為「推薦目前系統」 */
  const isRecommended = (platform: Os) => computed(() => os.value === platform)

  return { os, ctaLabel, osNote, isRecommended }
}
