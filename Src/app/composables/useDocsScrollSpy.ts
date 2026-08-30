const ACTIVE_CLASSES = ['active', 'bg-brand-surface', 'text-brand', 'font-bold']
const IDLE_CLASS = 'text-ink-500'

/**
 * FR-5：操作手冊側邊欄 Scroll-Spy。
 *
 * 由 js/main.js 原樣移植（含 rootMargin `-20% 0px -70% 0px`），刻意不重構 ——
 * 階段二會用 @nuxt/content 內建的 TOC 整段取代它。
 */
export function useDocsScrollSpy() {
  onMounted(() => {
    const sections = document.querySelectorAll('.docs-content section[id]')
    const links = document.querySelectorAll<HTMLAnchorElement>('.docs-sidebar nav a[href^="#"]')
    if (!sections.length || !links.length || !('IntersectionObserver' in window)) return

    const linkMap: Record<string, HTMLAnchorElement> = {}
    links.forEach((a) => {
      linkMap[a.getAttribute('href')!.slice(1)] = a
    })

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          links.forEach((a) => {
            a.classList.remove(...ACTIVE_CLASSES)
            a.classList.add(IDLE_CLASS)
          })
          const target = linkMap[entry.target.id]
          if (target) {
            target.classList.add(...ACTIVE_CLASSES)
            target.classList.remove(IDLE_CLASS)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )

    sections.forEach(s => spy.observe(s))
    onBeforeUnmount(() => spy.disconnect())
  })
}
