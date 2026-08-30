/**
 * FR-3：主題切換。
 *
 * 🔴 初始判定不在這裡 —— 它由 nuxt.config.ts 的 app.head.script 以同步 inline
 *    script 在 <head> 內完成。這支 composable 只負責「點擊之後」的切換與持久化。
 *    把初始判定搬進來會產生 FOUC（plugin / composable 都在 hydration 之後才跑）。
 */
export function useTheme() {
  const isDark = ref(false)

  onMounted(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })

  function toggleTheme() {
    const dark = document.documentElement.classList.toggle('dark')
    isDark.value = dark
    try {
      localStorage.setItem('pb-theme', dark ? 'dark' : 'light')
    } catch {
      /* 隱私模式或停用 site data 時忽略 */
    }
  }

  return { isDark, toggleTheme }
}
