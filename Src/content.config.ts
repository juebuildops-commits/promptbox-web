import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    // 一版一檔。順序由 date 字串反向排序推導 —— `latest` 不進 frontmatter，
    // 手動標記一定會忘記把上一版的拿掉。
    changelog: defineCollection({
      type: 'page',
      source: 'changelog/**.md',
      schema: z.object({
        version: z.string(),
        date: z.string(),
        summary: z.string(),
        /** 「更早版本歷程」的摘要卡，另外一區渲染 */
        legacy: z.boolean().optional(),
        /** 版號右側的徽章文字（例：零連網里程碑 / 重大版本）。最新版的「最新版本」徽章由順序推導，不寫在這裡 */
        badge: z.string().optional(),
        /** 重大版本：卡片用 shadow-md、版號用 font-black */
        major: z.boolean().optional(),
      }),
    }),

    // 一節一檔。側邊欄由這份 collection 生成，不再手寫。
    docs: defineCollection({
      type: 'page',
      source: 'docs/**.md',
      schema: z.object({
        title: z.string(),
        /** 側欄標籤，通常比 title 短（例：nav「MCP 整合」vs h2「MCP 整合 (Model Context Protocol)」） */
        navLabel: z.string(),
        /** 對應 style.css 的 .icon--* */
        icon: z.string(),
        /** section id，同時是側欄錨點 */
        anchor: z.string(),
        beta: z.boolean().optional(),
      }),
    }),
  },
})
